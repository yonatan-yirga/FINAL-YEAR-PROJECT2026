"""
Certificate Views 

Endpoints:
  POST /api/certificates/mark-completed/      → MarkStudentCompletedView   (DEPARTMENT_HEAD)
  GET  /api/certificates/my-certificate/      → MyCertificateView          (STUDENT)
  GET  /api/certificates/department/          → DepartmentCertificatesView (DEPARTMENT_HEAD)
  GET  /api/certificates/<id>/download/       → DownloadCertificateView    (STUDENT/DEPT)
  GET  /api/certificates/verify/<code>/       → VerifyCertificateView      (PUBLIC)
"""
import os
import datetime
from django.http import FileResponse, Http404
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Certificate
from .serializers import CertificateSerializer, CertificateVerifySerializer
from .certificate_generator import CertificateGenerator
from apps.reports.models import FinalReport
from apps.notifications.services import NotificationService
from apps.notifications.email_service import EmailService


# ── Permission helpers ────────────────────────────────────────────────────────
def is_department_head(user):
    return user.is_authenticated and getattr(user, 'role', '') == 'DEPARTMENT_HEAD'

def is_student(user):
    return user.is_authenticated and user.role == 'STUDENT'


# ── Data-gathering helpers ────────────────────────────────────────────────────

def _get_dept_head_name(student):
    """
    Returns the real department head's name from Department.head_name.
    Falls back gracefully — never raises.
    """
    try:
        return student.department.head_name or ''
    except Exception:
        return ''


def _get_company_rep(report):
    """
    Returns (contact_person_name, contact_person_title) from CompanyProfile.
    Falls back gracefully — never raises.
    """
    try:
        profile = report.company.company_profile
        return profile.contact_person_name or '', profile.contact_person_title or ''
    except Exception:
        return '', ''


def _resolve_end_date(internship):
    """
    Returns a non-null end_date for the certificate.

    Priority:
      1. internship.end_date  (if already set)
      2. start_date + duration_months * 30 days  (calculated fallback)
      3. today  (last-resort fallback — should never be reached in practice)

    This prevents the NOT NULL constraint violation on Certificate.end_date
    when an internship was posted without an explicit end_date.
    """
    if internship.end_date:
        return internship.end_date

    if internship.start_date and internship.duration_months:
        try:
            months = int(internship.duration_months)
            # Use relativedelta if available, otherwise multiply by 30 days
            try:
                from dateutil.relativedelta import relativedelta
                return internship.start_date + relativedelta(months=months)
            except ImportError:
                return internship.start_date + datetime.timedelta(days=30 * months)
        except Exception:
            pass

    # Absolute last resort
    return datetime.date.today()


# ── Views ─────────────────────────────────────────────────────────────────────

class MarkStudentCompletedView(APIView):
    """
    POST /api/certificates/mark-completed/
    Department head marks a student as completed and triggers certificate generation.
    Body: { "final_report_id": 123 }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not is_department_head(request.user):
            return Response({'error': 'Only department heads can issue certificates.'},
                            status=status.HTTP_403_FORBIDDEN)

        final_report_id = request.data.get('final_report_id')
        if not final_report_id:
            return Response({'error': 'final_report_id is required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Load report — include company__company_profile for contact person fields
        try:
            report = FinalReport.objects.select_related(
                'student',
                'student__department',
                'advisor',
                'advisor__advisor_profile',
                'company',
                'company__company_profile',
                'advisor_assignment__internship',
            ).get(pk=final_report_id)
        except FinalReport.DoesNotExist:
            return Response({'error': 'Final report not found.'},
                            status=status.HTTP_404_NOT_FOUND)

        # Validate status
        if report.status not in ('SUBMITTED_TO_DEPARTMENT', 'COMPLETED'):
            return Response(
                {'error': 'Final report must be fully completed before issuing a certificate.'},
                status=status.HTTP_400_BAD_REQUEST)

        # Validate same department
        student = report.student
        if student.department != request.user.department:
            return Response({'error': 'Student is not in your department.'},
                            status=status.HTTP_403_FORBIDDEN)

        # Already issued?
        if Certificate.objects.filter(student=student).exists():
            cert = Certificate.objects.get(student=student)
            return Response(
                {'message': 'Certificate already exists.',
                 'certificate': CertificateSerializer(cert, context={'request': request}).data},
                status=status.HTTP_200_OK)

        # ── Gather denormalised data ──────────────────────────────────────────
        try:
            assignment = report.advisor_assignment
            internship = assignment.internship
        except Exception as e:
            return Response(
                {'error': f'Could not access internship data: {e}'},
                status=status.HTTP_400_BAD_REQUEST)

        # Student
        try:
            student_name = student.student_profile.full_name
            student_uid  = student.student_profile.university_id
        except Exception:
            student_name = student.get_full_name() or student.email
            student_uid  = str(student.id)

        # Company name
        try:
            company_name = report.company.company_profile.company_name
        except Exception:
            company_name = report.company.get_full_name() or report.company.email

        # Advisor
        try:
            advisor_name = report.advisor.advisor_profile.full_name
        except Exception:
            advisor_name = report.advisor.get_full_name() or report.advisor.email

        dept_name = student.department.name if student.department else 'N/A'

        # Signature data
        dept_head_name                      = _get_dept_head_name(student)
        company_rep_name, company_rep_title = _get_company_rep(report)

        # Resolve end_date — never None (fixes NOT NULL constraint violation)
        resolved_end_date = _resolve_end_date(internship)

        # ── Create Certificate ────────────────────────────────────────────────
        try:
            # Save department review to the report
            department_review = request.data.get('department_review', '')
            FinalReport.objects.filter(pk=report.pk).update(
                department_review=department_review,
                department_reviewed_at=timezone.now()
            )
            report.refresh_from_db()

            cert = Certificate(
                student=student,
                final_report=report,
                issued_by=request.user,
                student_name=student_name,
                student_university_id=student_uid,
                company_name=company_name,
                internship_title=internship.title,
                department_name=dept_name,
                advisor_name=advisor_name,
                start_date=internship.start_date,
                end_date=resolved_end_date,      # guaranteed non-null
                duration_months=internship.duration_months,
                performance_grade=report.overall_grade or '',
                # Signature fields
                dept_head_name=dept_head_name,
                company_rep_name=company_rep_name,
                company_rep_title=company_rep_title,
            )
            cert.certificate_id    = Certificate.generate_certificate_id(student)
            cert.verification_code = Certificate.generate_verification_code()
            cert.save()
        except Exception as e:
            return Response(
                {'error': f'Failed to create certificate record: {e}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # ── Generate PDF ──────────────────────────────────────────────────────
        try:
            generator     = CertificateGenerator(cert)
            relative_path = generator.generate()
            Certificate.objects.filter(pk=cert.pk).update(
                pdf_file=relative_path,
                is_generated=True,
            )
            cert.refresh_from_db()
        except Exception:
            # PDF failure is non-fatal — certificate record still exists
            pass

        # ── Mark assignment completed ─────────────────────────────────────────
        try:
            from django.utils import timezone
            assignment.is_active    = False
            assignment.completed_at = timezone.now()
            assignment.save(update_fields=['is_active', 'completed_at'])
        except Exception:
            pass

        # ── Mark final report completed ───────────────────────────────────────
        try:
            FinalReport.objects.filter(pk=report.pk).update(status='COMPLETED')
        except Exception:
            pass

        # ── Notify student ────────────────────────────────────────────────────
        try:
            NotificationService.create_notification(
                recipient=student,
                title='Your Internship Certificate is Ready!',
                message=(
                    f'Congratulations! Your internship completion certificate '
                    f'({cert.certificate_id}) has been issued and is ready to download.'
                ),
                notification_type='INTERNSHIP_COMPLETED',
                link='/student/congratulations',
            )
        except Exception:
            pass

        # ── Email student ─────────────────────────────────────────────────────
        try:
            EmailService.send_certificate_ready_email(student, cert)
        except Exception:
            pass

        return Response(
            {'message': 'Certificate issued successfully.',
             'certificate': CertificateSerializer(cert, context={'request': request}).data},
            status=status.HTTP_201_CREATED)


class MyCertificateView(APIView):
    """GET /api/certificates/my-certificate/ — student views own certificate."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_student(request.user):
            return Response({'error': 'Only students can access this endpoint.'},
                            status=status.HTTP_403_FORBIDDEN)
        try:
            cert = Certificate.objects.get(student=request.user)
            return Response(CertificateSerializer(cert, context={'request': request}).data)
        except Certificate.DoesNotExist:
            return Response({'detail': 'No certificate found.'}, status=status.HTTP_404_NOT_FOUND)


class DepartmentCertificatesView(ListAPIView):
    """GET /api/certificates/department/ — department lists all issued certificates."""
    permission_classes = [IsAuthenticated]
    serializer_class = CertificateSerializer

    def get_queryset(self):
        if not is_department_head(self.request.user):
            return Certificate.objects.none()
        return Certificate.objects.filter(
            student__department=self.request.user.department
        ).select_related('student', 'final_report').order_by('-issue_date')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class DownloadCertificateView(APIView):
    """GET /api/certificates/<id>/download/ — stream PDF to client."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            cert = Certificate.objects.get(pk=pk)
        except Certificate.DoesNotExist:
            raise Http404

        user = request.user
        allowed = (
            (is_student(user) and cert.student == user) or
            (is_department_head(user) and cert.student.department == user.department)
        )
        if not allowed:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        # Resolve the on-disk path (may or may not exist yet)
        filepath = None
        if cert.pdf_file:
            filepath = os.path.join(settings.MEDIA_ROOT, str(cert.pdf_file))

        # Auto-generate PDF if it doesn't exist on disk
        if not filepath or not os.path.exists(filepath):
            try:
                generator = CertificateGenerator(cert)
                relative_path = generator.generate()
                Certificate.objects.filter(pk=cert.pk).update(
                    pdf_file=relative_path,
                    is_generated=True,
                )
                cert.refresh_from_db()
                filepath = os.path.join(settings.MEDIA_ROOT, str(cert.pdf_file))
            except Exception as e:
                return Response(
                    {'error': f'Failed to generate certificate PDF: {e}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        if not os.path.exists(filepath):
            return Response({'error': 'PDF file not found on server.'},
                            status=status.HTTP_404_NOT_FOUND)

        response = FileResponse(
            open(filepath, 'rb'),
            content_type='application/pdf',
        )
        response['Content-Disposition'] = (
            f'attachment; filename="certificate_{cert.certificate_id}.pdf"'
        )
        return response


class VerifyCertificateView(APIView):
    """
    GET /api/certificates/verify/<code>/ — PUBLIC endpoint.
    Accepts both verification_code and certificate_id.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, code):
        cert = (
            Certificate.objects.filter(verification_code=code).first() or
            Certificate.objects.filter(certificate_id=code).first()
        )
        if not cert:
            return Response(
                {'valid': False, 'message': 'Certificate not found or invalid code.'},
                status=status.HTTP_404_NOT_FOUND)
        return Response({
            'valid': True,
            'message': 'Certificate is authentic and verified.',
            'certificate': CertificateVerifySerializer(cert).data,
        })