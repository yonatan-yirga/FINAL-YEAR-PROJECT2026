"""
Reports Views 
"""
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError as DjangoValidationError
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import MonthlyReport, FinalReport, StudentFinalReport
from .serializers import (
    MonthlyReportSerializer,
    MonthlyReportCreateSerializer,
    ActiveInternSerializer,
    FinalReportCompanySerializer,
    FinalReportAdvisorSerializer,
    FinalReportDetailSerializer,
    FinalReportListSerializer,
    StudentMonthlyReportSerializer,
    StudentMonthlyReportCreateSerializer,
    StudentFinalReportSerializer,
    StudentFinalReportCreateSerializer,
)
from apps.advisors.models import AdvisorAssignment
from apps.notifications.services import NotificationService
from apps.accounts.permissions import (
    IsStudent, IsCompany, IsAdvisor, IsDepartmentHead, IsUIL
)

logger = logging.getLogger(__name__)


# ── Phase 8 views (unchanged) ─────────────────────────────────────────────────

class ActiveInternsView(APIView):
    """GET /api/reports/active-interns/"""
    permission_classes = [IsAuthenticated, IsCompany]

    def get(self, request):
        assignments = AdvisorAssignment.objects.filter(
            internship__company=request.user,
        ).select_related('student', 'student__student_profile', 'internship', 'advisor')

        serializer = ActiveInternSerializer(assignments, many=True)
        return Response({'results': serializer.data})


class SubmitMonthlyReportView(APIView):
    """POST /api/reports/monthly/submit/"""
    permission_classes = [IsAuthenticated, IsCompany]

    def post(self, request):
        serializer = MonthlyReportCreateSerializer(
            data=request.data,
            context={'request': request},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            report = serializer.save()
        except DjangoValidationError as e:
            error_dict = e.message_dict if hasattr(e, 'message_dict') else {'detail': list(e.messages)}
            return Response(error_dict, status=status.HTTP_400_BAD_REQUEST)

        try:
            from .pdf_generator import generate_monthly_report_pdf
            pdf_path = generate_monthly_report_pdf(report)
            MonthlyReport.objects.filter(pk=report.pk).update(pdf_file=pdf_path)
        except Exception as e:
            logger.error(f'Monthly PDF generation failed for report {report.id}: {e}')

        try:
            NotificationService.notify_report_submitted(
                advisor=report.advisor_assignment.advisor,
                student=report.student,
                month=f'Month {report.report_month}',
            )
        except Exception as e:
            logger.error(f'Advisor notification failed for report {report.id}: {e}')

        return Response(
            {
                'message': f'Month {report.report_month} report submitted successfully.',
                'report_id': report.id,
                'pdf_generated': bool(report.pdf_file),
            },
            status=status.HTTP_201_CREATED,
        )


class CompanyMonthlyReportsView(APIView):
    """GET /api/reports/monthly/company/"""
    permission_classes = [IsAuthenticated, IsCompany]

    def get(self, request):
        qs = MonthlyReport.objects.filter(company=request.user).select_related(
            'student', 'student__student_profile',
            'company', 'company__company_profile',
            'advisor_assignment', 'advisor_assignment__advisor',
        ).order_by('-submitted_at')

        assignment_id = request.query_params.get('assignment_id')
        if assignment_id:
            qs = qs.filter(advisor_assignment_id=assignment_id)

        serializer = MonthlyReportSerializer(qs, many=True, context={'request': request})
        return Response({'results': serializer.data})


class AdvisorMonthlyReportsView(APIView):
    """GET /api/reports/monthly/advisor/"""
    permission_classes = [IsAuthenticated, IsAdvisor]

    def get(self, request):
        user = request.user
        
        # Base Queryset
        qs = MonthlyReport.objects.select_related(
            'student', 'student__student_profile',
            'company', 'company__company_profile',
            'advisor_assignment', 'advisor_assignment__advisor',
        ).order_by('-submitted_at')

        # Filter by assignment_id if provided (and check ownership/authority)
        assignment_id = request.query_params.get('assignment_id')
        if assignment_id:
            qs = qs.filter(advisor_assignment_id=assignment_id)
            qs = qs.filter(advisor_assignment__advisor=user)

        else:
            # If no specific assignment, only show relevant reports
            qs = qs.filter(advisor_assignment__advisor=user)

        serializer = MonthlyReportSerializer(qs, many=True, context={'request': request})
        return Response({'results': serializer.data})


class StudentMonthlyReportsView(APIView):
    """GET /api/reports/monthly/student/"""
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        qs = MonthlyReport.objects.filter(student=request.user).select_related(
            'company', 'company__company_profile',
            'advisor_assignment', 'advisor_assignment__advisor',
        ).order_by('report_month')

        serializer = MonthlyReportSerializer(qs, many=True, context={'request': request})
        return Response({'results': serializer.data})


class MonthlyReportDetailView(APIView):
    """GET /api/reports/monthly/<id>/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            report = MonthlyReport.objects.select_related(
                'student', 'student__student_profile',
                'company', 'company__company_profile',
                'advisor_assignment', 'advisor_assignment__advisor',
            ).get(pk=pk)
        except MonthlyReport.DoesNotExist:
            return Response({'error': 'Report not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        user_role = getattr(user, 'role', '')
        is_authorized = (
            user.is_staff
            or user_role in ('UIL', 'DEPARTMENT_HEAD')
            or user == report.company
            or user == report.student
            or user == report.advisor_assignment.advisor
        )
        if not is_authorized:
            return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = MonthlyReportSerializer(report, context={'request': request})
        return Response(serializer.data)


class SubmitStudentMonthlyReportView(APIView):
    """POST /api/reports/student-monthly/submit/"""
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request):
        serializer = StudentMonthlyReportCreateSerializer(
            data=request.data,
            context={'request': request},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            report = serializer.save()
        except DjangoValidationError as e:
            error_dict = e.message_dict if hasattr(e, 'message_dict') else {'detail': list(e.messages)}
            return Response(error_dict, status=status.HTTP_400_BAD_REQUEST)

        # Notify advisor
        try:
            NotificationService.notify_report_submitted(
                advisor=report.advisor_assignment.advisor,
                student=report.student,
                month=f'Month {report.report_month}'
            )
        except Exception as e:
            logger.error(f'Advisor notification failed for student report {report.id}: {e}')

        return Response(
            {
                'message': f'Month {report.report_month} report submitted successfully.',
                'report_id': report.id,
            },
            status=status.HTTP_201_CREATED,
        )


class StudentPersonalMonthlyReportsView(APIView):
    """GET /api/reports/student-monthly/my-reports/"""
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        from .models import StudentMonthlyReport
        qs = StudentMonthlyReport.objects.filter(student=request.user).select_related(
            'advisor_assignment', 'advisor_assignment__internship', 'advisor_assignment__internship__company'
        ).order_by('report_month')

        serializer = StudentMonthlyReportSerializer(qs, many=True, context={'request': request})
        return Response({'results': serializer.data})


class AdvisorStudentMonthlyReportsView(APIView):
    """GET /api/reports/student-monthly/advisor/"""
    permission_classes = [IsAuthenticated, IsAdvisor]

    def get(self, request):
        from .models import StudentMonthlyReport
        qs = StudentMonthlyReport.objects.filter(
            advisor_assignment__advisor=request.user
        ).select_related(
            'student', 'student__student_profile',
            'advisor_assignment', 'advisor_assignment__internship'
        ).order_by('-submitted_at')

        assignment_id = request.query_params.get('assignment_id')
        if assignment_id:
            qs = qs.filter(advisor_assignment_id=assignment_id)

        serializer = StudentMonthlyReportSerializer(qs, many=True, context={'request': request})
        return Response({'results': serializer.data})


# ── Phase 9: Final Report views ───────────────────────────────────────────────

class CompanySubmitFinalReportView(APIView):
    """
    POST /api/reports/final/submit/
    Stage 1: Company submits their evaluation.
    Creates FinalReport with status=PENDING_ADVISOR.
    Notifies advisor immediately.
    """
    permission_classes = [IsAuthenticated, IsCompany]

    def post(self, request):
        serializer = FinalReportCompanySerializer(
            data=request.data,
            context={'request': request},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            report = serializer.save()
        except DjangoValidationError as e:
            error_dict = e.message_dict if hasattr(e, 'message_dict') else {'detail': list(e.messages)}
            return Response(error_dict, status=status.HTTP_400_BAD_REQUEST)

        # Notify advisor to complete their section
        try:
            if hasattr(NotificationService, 'notify_final_report_pending_advisor'):
                NotificationService.notify_final_report_pending_advisor(
                    advisor=report.advisor,
                    student=report.student,
                    report_id=report.id,
                )
            else:
                # Fallback: use existing notify_report_submitted until Phase 9 services.py is deployed
                NotificationService.notify_report_submitted(
                    advisor=report.advisor,
                    student=report.student,
                    month='Final Report',
                )
                logger.warning(f'notify_final_report_pending_advisor not found — used fallback for report {report.id}')
        except Exception as e:
            logger.error(f'Advisor final-report notification failed for report {report.id}: {e}')

        return Response(
            {
                'message': 'Final report submitted. Your advisor will be notified to complete their section.',
                'report_id': report.id,
                'status': report.status,
            },
            status=status.HTTP_201_CREATED,
        )


class StudentSubmitFinalReportView(APIView):
    """
    POST /api/reports/final/student-submit/
    For students to upload their final PDF and summary.
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request):
        serializer = StudentFinalReportCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            report = serializer.save()
            return Response({'message': 'Report submitted securely.', 'report_id': report.id}, status=201)
        return Response(serializer.errors, status=400)

class AdvisorReviewFinalReportView(APIView):
    """
    PATCH /api/reports/final/advisor-review/<id>/
    Advisor requests revisions or approves the student's report.
    """
    permission_classes = [IsAuthenticated, IsAdvisor]

    def patch(self, request, pk):
        report = get_object_or_404(StudentFinalReport, pk=pk, advisor_assignment__advisor=request.user)
        action = request.data.get('action') # 'APPROVE' or 'REQUEST_REVISIONS'
        
        if action == 'REQUEST_REVISIONS':
            report.status = 'REVISIONS_REQUIRED'
            report.advisor_feedback = request.data.get('feedback', 'Please revise your report.')
            report.save()
            return Response({'status': 'REVISIONS_REQUIRED'})
        
        elif action == 'APPROVE':
            report.status = 'APPROVED'
            report.save()
            return Response({'status': 'APPROVED'})
            
        return Response({'error': 'Invalid action.'}, status=400)

class AdvisorInitiateFinalReportView(APIView):
    """
    POST /api/reports/final/advisor-initiate/
    Allows an advisor to create a FinalReport on behalf of the assignment
    when the company has not yet submitted their evaluation.
    This unblocks the advisor-to-department pipeline.
    """
    permission_classes = [IsAuthenticated, IsAdvisor]

    def post(self, request):
        assignment_id = request.data.get('assignment_id')
        if not assignment_id:
            return Response({'error': 'assignment_id is required.'}, status=400)

        try:
            assignment = AdvisorAssignment.objects.select_related(
                'student', 'advisor', 'internship', 'internship__company'
            ).get(id=assignment_id, advisor=request.user)
        except AdvisorAssignment.DoesNotExist:
            return Response({'error': 'Assignment not found.'}, status=404)

        # Check if a FinalReport already exists — if so, return its id
        existing = getattr(assignment, 'final_report', None)
        if existing:
            return Response({'final_report_id': existing.id, 'created': False})

        # Create a FinalReport with placeholder company values (advisor-initiated)
        from django.utils import timezone
        company = assignment.internship.company
        duration = str(assignment.internship.duration_months) + ' months' if hasattr(assignment.internship, 'duration_months') else '3 months'

        report = FinalReport.objects.create(
            advisor_assignment=assignment,
            student=assignment.student,
            company=company,
            advisor=assignment.advisor,
            status='PENDING_ADVISOR',
            internship_duration=duration,
            company_performance_assessment='(Awaiting company evaluation)',
            company_recommendation='CONDITIONAL',
            company_score=0,
            company_submitted_at=None,
        )

        return Response({'final_report_id': report.id, 'created': True}, status=201)


class AdvisorCompleteFinalReportView(APIView):
    """
    PATCH /api/reports/final/<id>/complete/
    Final stage: Advisor scores the report (out of 50).
    """
    permission_classes = [IsAuthenticated, IsAdvisor]

    def patch(self, request, pk):
        try:
            report = FinalReport.objects.select_related('advisor_assignment').get(pk=pk, advisor=request.user)
        except FinalReport.DoesNotExist:
            return Response({'error': 'Evaluation not found.'}, status=404)

        # Proceed directly to scoring without requiring an approved student report


        serializer = FinalReportAdvisorSerializer(report, data=request.data, partial=True)
        if serializer.is_valid():
            # First save the scores/evaluation
            report = serializer.save()
            # Then trigger the formal submission workflow (PDF + Notification)
            report.submit_advisor_section()
            
            return Response({
                'message': 'Evaluation submitted to department successfully.', 
                'total_score': report.total_score, 
                'grade': report.overall_grade,
                'pdf_url': request.build_absolute_uri(report.pdf_file.url) if report.pdf_file else None
            })
        return Response(serializer.errors, status=400)


class CompanyFinalReportsView(APIView):
    """GET /api/reports/final/company/"""
    permission_classes = [IsAuthenticated, IsCompany]

    def get(self, request):
        qs = FinalReport.objects.filter(company=request.user).select_related(
            'student', 'student__student_profile',
            'company', 'company__company_profile',
            'advisor',
            'advisor_assignment', 'advisor_assignment__internship',
        ).order_by('-created_at')

        serializer = FinalReportListSerializer(qs, many=True, context={'request': request})
        return Response({'results': serializer.data})


class AdvisorFinalReportsView(APIView):
    """
    GET /api/reports/final/advisor/
    Lists all students assigned to the advisor and their final report status.
    Shows students in the final phase regardless of whether the company has submitted.
    """
    permission_classes = [IsAuthenticated, IsAdvisor]

    def get(self, request):
        # Get all assignments for this advisor (both active and completed)
        assignments = AdvisorAssignment.objects.filter(
            advisor=request.user
        ).select_related(
            'student', 'student__student_profile',
            'internship', 'internship__company', 'internship__company__company_profile'
        ).order_by('-assigned_at')

        pending = []
        completed = []

        for assignment in assignments:
            # Check if student has submitted a report
            try:
                student_report = assignment.student_final_report
                has_student_submission = True
                student_status = student_report.status
            except StudentFinalReport.DoesNotExist:
                has_student_submission = False
                student_status = 'NOT_SUBMITTED'

            # Try to get existing FinalReport (grading record)
            try:
                final_report = assignment.final_report
                has_company_evaluation = True
            except FinalReport.DoesNotExist:
                final_report = None
                has_company_evaluation = False
            
            # Get company name safely
            try:
                company_name = assignment.internship.company.company_profile.company_name
            except AttributeError:
                company_name = assignment.internship.company.email
            
            # Prepare dashboard object
            item = {
                'id': final_report.id if final_report else None,
                'assignment_id': assignment.id,
                'student_name': assignment.student.get_full_name(),
                'company_name': company_name,
                'student_submission_status': student_status,
                'company_evaluation_status': 'SUBMITTED' if has_company_evaluation and final_report.company_submitted_at else 'PENDING',
                'advisor_evaluation_status': 'SUBMITTED' if has_company_evaluation and final_report.advisor_submitted_at else 'PENDING',
                'status': final_report.status if final_report else 'PENDING_INITIATION',
                'total_score': final_report.total_score if final_report else 0,
                'grade': final_report.overall_grade if final_report else None,
            }

            if has_company_evaluation and final_report.advisor_submitted_at:
                completed.append(item)
            else:
                # Include in pending if student has submitted or company has submitted
                if has_student_submission or has_company_evaluation:
                    pending.append(item)

        return Response({
            'pending': pending,
            'completed': completed,
        })


class DepartmentFinalReportsView(APIView):
    """GET /api/reports/final/department/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_role = getattr(request.user, 'role', '')
        if user_role not in ('DEPARTMENT_HEAD', 'UIL', 'ADMIN'):
            return Response({'error': 'Department access only.'}, status=status.HTTP_403_FORBIDDEN)

        # Base Queryset
        qs = FinalReport.objects.select_related(
            'student', 'student__student_profile',
            'company', 'company__company_profile',
            'advisor',
            'advisor_assignment', 'advisor_assignment__internship',
            'department_head',
        ).order_by('-created_at')

        # Filter by department for Dept Heads; UIL sees all
        if user_role == 'DEPARTMENT_HEAD':
            qs = qs.filter(student__department=request.user.department)

        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        serializer = FinalReportListSerializer(qs, many=True, context={'request': request})
        return Response({'results': serializer.data})


class DepartmentApproveFinalReportView(APIView):
    """
    PATCH /api/reports/final/<id>/department-approve/
    Department Head approves or rejects a final report
    """
    permission_classes = [IsAuthenticated, IsDepartmentHead]

    def patch(self, request, pk):
        try:
            report = FinalReport.objects.select_related(
                'student', 'advisor', 'advisor_assignment'
            ).get(pk=pk)
        except FinalReport.DoesNotExist:
            return Response({'error': 'Final report not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Validate department head is from same department
        if request.user.department != report.student.department:
            return Response(
                {'error': 'You can only review reports from your department.'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Validate report is ready for department review
        if report.status != 'SUBMITTED_TO_DEPARTMENT':
            return Response(
                {'error': 'Report is not ready for department review.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        action = request.data.get('action')  # 'approve' or 'reject'
        review_comments = request.data.get('review_comments', '')

        try:
            if action == 'approve':
                success = report.approve_by_department_head(
                    department_head_user=request.user,
                    review_comments=review_comments
                )
                if success:
                    return Response({
                        'message': 'Final report approved successfully.',
                        'status': report.status,
                        'can_issue_certificate': True
                    })
                else:
                    return Response(
                        {'error': 'Failed to approve report.'}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

            elif action == 'reject':
                if not review_comments:
                    return Response(
                        {'error': 'Rejection reason is required.'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                success = report.reject_by_department_head(
                    department_head_user=request.user,
                    rejection_reason=review_comments
                )
                if success:
                    return Response({
                        'message': 'Final report sent back for revision.',
                        'status': report.status
                    })
                else:
                    return Response(
                        {'error': 'Failed to reject report.'}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

            else:
                return Response(
                    {'error': 'Invalid action. Use "approve" or "reject".'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        except DjangoValidationError as e:
            error_dict = e.message_dict if hasattr(e, 'message_dict') else {'detail': list(e.messages)}
            return Response(error_dict, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f'Department approval failed for report {pk}: {e}')
            return Response(
                {'error': f'Failed to process approval: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DepartmentIssueCertificateView(APIView):
    """
    POST /api/reports/final/<id>/issue-certificate/
    Department Head issues certificate to student
    """
    permission_classes = [IsAuthenticated, IsDepartmentHead]

    def post(self, request, pk):
        try:
            report = FinalReport.objects.select_related(
                'student', 'advisor', 'advisor_assignment', 'advisor_assignment__internship'
            ).get(pk=pk)
        except FinalReport.DoesNotExist:
            return Response({'error': 'Final report not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Validate department head is from same department
        if request.user.department != report.student.department:
            return Response(
                {'error': 'You can only issue certificates for your department.'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Validate report is approved
        if not report.department_approved:
            return Response(
                {'error': 'Report must be approved before issuing certificate.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if certificate already issued
        if report.certificate_issued:
            return Response(
                {'error': 'Certificate has already been issued for this report.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            certificate = report.issue_certificate(issued_by_user=request.user)
            
            return Response({
                'message': 'Certificate issued successfully!',
                'certificate_id': certificate.certificate_id,
                'verification_code': certificate.verification_code,
                'student_name': certificate.student_name,
                'pdf_url': request.build_absolute_uri(certificate.pdf_file.url) if certificate.pdf_file else None,
                'report_status': report.status
            }, status=status.HTTP_201_CREATED)

        except DjangoValidationError as e:
            error_dict = e.message_dict if hasattr(e, 'message_dict') else {'detail': list(e.messages)}
            return Response(error_dict, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f'Certificate issuance failed for report {pk}: {e}')
            return Response(
                {'error': f'Failed to issue certificate: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DepartmentCertificatesView(APIView):
    """
    GET /api/reports/certificates/department/
    List all certificates issued by this department head
    """
    permission_classes = [IsAuthenticated, IsDepartmentHead]

    def get(self, request):
        from apps.certificates.models import Certificate
        
        # Get certificates for students in this department
        certificates = Certificate.objects.filter(
            student__department=request.user.department
        ).select_related(
            'student', 'student__student_profile',
            'final_report', 'issued_by'
        ).order_by('-created_at')

        # Filter by issued status if requested
        status_filter = request.query_params.get('status')
        if status_filter == 'issued':
            certificates = certificates.filter(is_generated=True)
        elif status_filter == 'pending':
            certificates = certificates.filter(is_generated=False)

        # Serialize certificate data
        certificate_data = []
        for cert in certificates:
            certificate_data.append({
                'id': cert.id,
                'certificate_id': cert.certificate_id,
                'verification_code': cert.verification_code,
                'student_name': cert.student_name,
                'student_university_id': cert.student_university_id,
                'company_name': cert.company_name,
                'internship_title': cert.internship_title,
                'performance_grade': cert.performance_grade,
                'issue_date': cert.issue_date,
                'is_generated': cert.is_generated,
                'issued_by_name': cert.issued_by.get_full_name() if cert.issued_by else 'System',
                'pdf_url': request.build_absolute_uri(cert.pdf_file.url) if cert.pdf_file else None,
                'created_at': cert.created_at,
            })

        return Response({
            'results': certificate_data,
            'total_count': len(certificate_data)
        })


class DepartmentPendingApprovalsView(APIView):
    """
    GET /api/reports/final/department/pending-approvals/
    Get reports that need department head approval
    """
    permission_classes = [IsAuthenticated, IsDepartmentHead]

    def get(self, request):
        # Get reports submitted to department but not yet approved
        pending_reports = FinalReport.objects.filter(
            student__department=request.user.department,
            status='SUBMITTED_TO_DEPARTMENT',
            department_approved=False
        ).select_related(
            'student', 'student__student_profile',
            'advisor', 'advisor__advisor_profile',
            'company', 'company__company_profile',
            'advisor_assignment', 'advisor_assignment__internship'
        ).order_by('-advisor_submitted_at')

        # Get approved reports ready for certificate issuance
        approved_reports = FinalReport.objects.filter(
            student__department=request.user.department,
            status='APPROVED_BY_DEPARTMENT',
            department_approved=True,
            certificate_issued=False
        ).select_related(
            'student', 'student__student_profile',
            'advisor', 'advisor__advisor_profile',
            'company', 'company__company_profile',
            'advisor_assignment', 'advisor_assignment__internship'
        ).order_by('-department_reviewed_at')

        pending_serializer = FinalReportListSerializer(pending_reports, many=True, context={'request': request})
        approved_serializer = FinalReportListSerializer(approved_reports, many=True, context={'request': request})

        return Response({
            'pending_approval': pending_serializer.data,
            'ready_for_certificate': approved_serializer.data,
            'pending_count': len(pending_serializer.data),
            'ready_count': len(approved_serializer.data)
        })


class FinalReportPDFDownloadView(APIView):
    """
    GET /api/reports/final/<id>/pdf/
    Serves the PDF file directly so the React frontend can download it
    without cross-origin issues. Falls back to redirect if media is served
    by a separate web server.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            report = FinalReport.objects.get(pk=pk)
        except FinalReport.DoesNotExist:
            return Response({'error': 'Report not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        user_role = getattr(user, 'role', '')
        is_authorized = (
            user.is_staff
            or user_role == 'UIL'
            or user == report.company
            or user == report.student
            or user == report.advisor
            or (user_role == 'DEPARTMENT_HEAD' and
                user.department == report.student.department)
        )
        if not is_authorized:
            return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        if not report.pdf_file:
            return Response({'error': 'PDF not yet generated.'}, status=status.HTTP_404_NOT_FOUND)

        import os
        from django.conf import settings
        from django.http import FileResponse, HttpResponseNotFound

        pdf_abs = os.path.join(settings.MEDIA_ROOT, str(report.pdf_file))
        if not os.path.exists(pdf_abs):
            return Response(
                {'error': 'PDF file not found on disk. It may still be generating.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        student_name = report.student.get_full_name().replace(' ', '_')
        filename = f'Final_Report_{student_name}.pdf'
        response = FileResponse(
            open(pdf_abs, 'rb'),
            content_type='application/pdf',
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        response['Access-Control-Expose-Headers'] = 'Content-Disposition'
        return response


class FinalReportDetailView(APIView):
    """GET /api/reports/final/<id>/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            report = FinalReport.objects.select_related(
                'student', 'student__student_profile', 'student__department',
                'company', 'company__company_profile',
                'advisor',
                'advisor_assignment', 'advisor_assignment__internship',
            ).get(pk=pk)
        except FinalReport.DoesNotExist:
            return Response({'error': 'Final report not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        user_role = getattr(user, 'role', '')
        is_authorized = (
            user.is_staff
            or user_role == 'UIL'
            or user == report.company
            or user == report.student
            or user == report.advisor
            or (user_role == 'DEPARTMENT_HEAD' and
                user.department == report.student.department)
        )
        if not is_authorized:
            return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = FinalReportDetailSerializer(report, context={'request': request})
        return Response(serializer.data)

class ConsolidatedReportPDFView(APIView):
    """
    GET /api/reports/monthly/consolidated/<assignment_id>/
    Generates and serves a consolidated PDF of all monthly reports.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id):
        user = request.user
        user_role = getattr(user, 'role', '')
        
        assignment = get_object_or_404(AdvisorAssignment, pk=assignment_id)
        
        # Auth check
        is_authorized = (
            user.is_staff
            or user_role in ('UIL', 'DEPARTMENT_HEAD')
            or user == assignment.advisor
            or user == assignment.student
            or (user_role == 'COMPANY' and user == assignment.internship.company)
        )
        if not is_authorized:
            return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        # Fetch all reports
        company_reports = MonthlyReport.objects.filter(advisor_assignment=assignment).order_by('report_month')
        from .models import StudentMonthlyReport
        student_reports = StudentMonthlyReport.objects.filter(advisor_assignment=assignment).order_by('report_month')

        if not company_reports.exists() and not student_reports.exists():
            return Response({'error': 'No reports found to consolidate.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            from .pdf_generator import generate_consolidated_report_pdf
            pdf_rel_path = generate_consolidated_report_pdf(assignment, company_reports, student_reports)
            
            import os
            from django.conf import settings
            from django.http import FileResponse
            
            pdf_abs = os.path.join(settings.MEDIA_ROOT, pdf_rel_path)
            
            student_name = assignment.student.get_full_name().replace(' ', '_')
            filename = f'Consolidated_Reports_{student_name}.pdf'
            
            response = FileResponse(
                open(pdf_abs, 'rb'),
                content_type='application/pdf',
            )
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response

        except Exception as e:
            logger.error(f'Consolidated PDF generation failed: {e}')
            return Response({'error': f'Failed to generate PDF: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
