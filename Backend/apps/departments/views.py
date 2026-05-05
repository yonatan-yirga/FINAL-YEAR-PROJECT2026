"""
Department Head Views
Provides endpoints for department management dashboard
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, Prefetch
from django.utils import timezone
from datetime import timedelta, datetime

from apps.accounts.models import User, StudentProfile, CompanyProfile, AdvisorProfile
from apps.internships.models import Internship
from apps.applications.models import Application
from apps.advisors.models import AdvisorAssignment, Feedback
from apps.reports.models import FinalReport, MonthlyReport
from .serializers import (
    DepartmentSerializer,
    DepartmentStatisticsSerializer,
    DepartmentStudentSerializer,
    DepartmentAdvisorSerializer,
    DepartmentCompanySerializer,
    AdvisorAssignmentSerializer,
    FinalReportListSerializer,
    EscalationSerializer,
    DecisionIntelligenceSerializer,
    DepartmentCycleSerializer,
)
from apps.departments.models import Department, Escalation, DepartmentCycle
from django.db.models import Avg, Sum
from core.permissions import IsSameDepartmentOrUIL
from apps.accounts.permissions import IsUIL, IsAdmin
from apps.accounts.models import User, DepartmentHeadProfile
from django.utils.crypto import get_random_string
from apps.notifications.services import NotificationService


class DepartmentViewSet(viewsets.ViewSet):
    """
    Department Head dashboard endpoints
    Provides statistics, lists, and management functions
    """

    permission_classes = [IsAuthenticated]
    
    def _check_department_permission(self, request):
        """Check if user is Department Head, UIL, or Admin"""
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', '')
        if user_role in ['DEPARTMENT_HEAD', 'UIL', 'ADMIN'] or getattr(request.user, 'is_staff', False):
            return True
        return False
    
    def _get_department(self, request):
        """Get user's department (or None for UIL/Admin)"""
        if request.user.role in ['UIL', 'ADMIN']:
            return None  # Can see all departments
        return request.user.department
    
    @action(detail=False, methods=['get'], url_path='statistics')
    def statistics(self, request):
        """
        GET /api/departments/statistics/
        
        Get department statistics
        
        Returns:
            - total_students: Total students in department
            - total_advisors: Total advisors in department
            - total_companies: Total companies in department
            - active_internships: Number of active internships
            - pending_assignments: Students awaiting advisor assignment
            - completed_internships: Number of completed internships
            - monthly_placements: Placements this month
            - completion_rate: Percentage of successful completions
        """
        try:
            if not self._check_department_permission(request):
                return Response(
                    {'error': 'Only Department Heads can access this endpoint.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            department = self._get_department(request)
            
            # Base querysets
            if department:
                students_qs = User.objects.filter(role='STUDENT', department=department, is_approved=True)
                advisors_qs = User.objects.filter(role='ADVISOR', department=department, is_approved=True)
                companies_qs = User.objects.filter(role='COMPANY', department=department, is_approved=True)
                internships_qs = Internship.objects.filter(department=department)
                assignments_qs = AdvisorAssignment.objects.filter(student__department=department)
            else:
                students_qs = User.objects.filter(role='STUDENT', is_approved=True)
                advisors_qs = User.objects.filter(role='ADVISOR', is_approved=True)
                companies_qs = User.objects.filter(role='COMPANY', is_approved=True)
                internships_qs = Internship.objects.all()
                assignments_qs = AdvisorAssignment.objects.all()
            
            # Calculate statistics
            total_students = students_qs.count()
            total_advisors = advisors_qs.count()
            total_companies = companies_qs.count()
            
            # Active internships (status = ACTIVE)
            active_internships = internships_qs.filter(status='ACTIVE').count()
            
            # Pending advisor assignments (accepted applications without any advisor ever assigned)
            accepted_applications = Application.objects.filter(
                status='ACCEPTED',
                internship__department=department if department else Q()
            ).exclude(
                student__in=assignments_qs.values('student')
            ).count()
            
            # Completed internships
            completed_internships = assignments_qs.filter(is_active=False).count()
            
            # Monthly placements (applications accepted this month)
            month_ago = timezone.now() - timedelta(days=30)
            monthly_placements = Application.objects.filter(
                status='ACCEPTED',
                reviewed_at__gte=month_ago,
                internship__department=department if department else Q()
            ).count()
            
            # Completion rate
            total_assignments = assignments_qs.count()
            if total_assignments > 0:
                completion_rate = (completed_internships / total_assignments) * 100
            else:
                completion_rate = 0
            
            data = {
                'total_students': total_students,
                'total_advisors': total_advisors,
                'total_companies': total_companies,
                'active_internships': active_internships,
                'pending_assignments': accepted_applications,
                'completed_internships': completed_internships,
                'monthly_placements': monthly_placements,
                'completion_rate': round(completion_rate, 2),
            }
            
            serializer = DepartmentStatisticsSerializer(data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': 'Failed to fetch statistics', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='students')
    def students(self, request):
        """
        GET /api/departments/students/
        
        Get all students in department with their internship status
        
        Query params:
            - search: Search by name or university ID
            - status: Filter by internship status (not_applied, applied, active, completed)
        
        Returns list of students with:
            - Student profile info
            - Current internship status
            - Company name (if active)
            - Advisor name (if assigned)
        """
        try:
            if not self._check_department_permission(request):
                return Response(
                    {'error': 'Only Department Heads can access this endpoint.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            department = self._get_department(request)
            
            # Base queryset
            queryset = User.objects.filter(
                role='STUDENT',
                is_approved=True
            ).select_related(
                'student_profile',
                'department'
            ).prefetch_related(
                Prefetch(
                    'student_applications',
                    queryset=Application.objects.select_related('internship__company').order_by('-applied_at')
                ),
                Prefetch(
                    'student_advisor_assignments',
                    queryset=AdvisorAssignment.objects.select_related(
                        'advisor',
                        'internship__company'
                    ).filter(is_active=True)
                )
            )
            
            if department:
                queryset = queryset.filter(department=department)
            
            # Search
            search = request.query_params.get('search', None)
            if search:
                queryset = queryset.filter(
                    Q(student_profile__full_name__icontains=search) |
                    Q(student_profile__university_id__icontains=search) |
                    Q(email__icontains=search)
                )
            
            # Filter by status
            status_filter = request.query_params.get('status', None)
            if status_filter:
                if status_filter == 'not_applied':
                    # Students with no applications
                    queryset = queryset.filter(student_applications__isnull=True)
                elif status_filter == 'applied':
                    # Students with pending applications
                    queryset = queryset.filter(
                        student_applications__status='PENDING'
                    ).distinct()
                elif status_filter == 'active':
                    # Students with active internships
                    queryset = queryset.filter(
                        student_advisor_assignments__is_active=True
                    ).distinct()
                elif status_filter == 'completed':
                    # Students who completed internships
                    queryset = queryset.filter(
                        student_advisor_assignments__is_active=False
                    ).distinct()
            
            # Serialize
            serializer = DepartmentStudentSerializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': 'Failed to fetch students', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='advisors')
    def advisors(self, request):
        """
        GET /api/departments/advisors/
        
        Get all advisors in department with workload info
        
        Returns list of advisors with:
            - Advisor profile info
            - Number of assigned students
            - Active students count
            - Completed students count
        """
        try:
            if not self._check_department_permission(request):
                return Response(
                    {'error': 'Only Department Heads can access this endpoint.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            department = self._get_department(request)
            
            # Base queryset with annotations
            queryset = User.objects.filter(
                role='ADVISOR',
                is_approved=True
            ).select_related(
                'advisor_profile',
                'department'
            ).annotate(
                assignments_count=Count('supervised_students'),
                active_count=Count(
                    'supervised_students',
                    filter=Q(supervised_students__is_active=True)
                ),
                completed_count=Count(
                    'supervised_students',
                    filter=Q(supervised_students__is_active=False)
                )
            )
            
            if department:
                queryset = queryset.filter(department=department)
            
            # Search
            search = request.query_params.get('search', None)
            if search:
                queryset = queryset.filter(
                    Q(advisor_profile__full_name__icontains=search) |
                    Q(advisor_profile__staff_id__icontains=search) |
                    Q(email__icontains=search)
                )
            
            # Serialize
            serializer = DepartmentAdvisorSerializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': 'Failed to fetch advisors', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'], url_path='students')
    def advisor_students(self, request, pk=None):
        """
        GET /api/departments/advisors/:id/students/
        
        Get advisor details and all their assigned students with internship info
        
        Returns:
            - Advisor profile info
            - List of students with:
                - Student profile info
                - Company/internship details
                - Internship status
                - Start/end dates
                - Batch info
        """
        try:
            if not self._check_department_permission(request):
                return Response(
                    {'error': 'Only Department Heads can access this endpoint.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get advisor
            try:
                advisor = User.objects.get(
                    id=pk,
                    role='ADVISOR',
                    is_approved=True
                )
            except User.DoesNotExist:
                return Response(
                    {'error': 'Advisor not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get advisor's students with internship details
            assignments = AdvisorAssignment.objects.filter(
                advisor=advisor
            ).select_related(
                'student__student_profile',
                'internship__company__company_profile',
                'internship',
            ).order_by('-assigned_at')
            
            # Build students list
            students_data = []
            for assignment in assignments:
                try:
                    student = assignment.student
                    
                    # Get internship - from assignment directly
                    internship = assignment.internship
                    company = internship.company if internship else None
                    
                    # Safely get student profile data
                    student_profile = getattr(student, 'student_profile', None)
                    full_name = student_profile.full_name if student_profile else student.email
                    student_id = student_profile.student_id if student_profile else None
                    phone_number = student_profile.phone_number if student_profile else None
                    batch = student_profile.batch if student_profile else None
                    
                    # Safely get company data
                    company_profile = getattr(company, 'company_profile', None) if company else None
                    company_name = company_profile.company_name if company_profile else None
                    
                    student_data = {
                        'id': student.id,
                        'full_name': full_name,
                        'student_id': student_id,
                        'email': student.email,
                        'phone_number': phone_number,
                        'batch': batch,
                        'company_name': company_name,
                        'internship_title': internship.title if internship else None,
                        'internship_status': 'ACTIVE' if assignment.is_active else 'COMPLETED',
                        'start_date': internship.start_date.isoformat() if internship and internship.start_date else None,
                        'end_date': internship.end_date.isoformat() if internship and internship.end_date else None,
                        'assigned_date': assignment.assigned_at.isoformat() if assignment.assigned_at else None,
                    }
                    students_data.append(student_data)
                except Exception as student_error:
                    # Log the error but continue processing other students
                    print(f"Error processing student assignment {assignment.id}: {str(student_error)}")
                    import traceback
                    traceback.print_exc()
                    continue
            
            # Advisor data
            advisor_profile = getattr(advisor, 'advisor_profile', None)
            advisor_data = {
                'id': advisor.id,
                'full_name': advisor_profile.full_name if advisor_profile else advisor.email,
                'staff_id': advisor_profile.staff_id if advisor_profile else None,
                'email': advisor.email,
                'phone_number': advisor_profile.phone_number if advisor_profile else None,
                'department': advisor.department.name if advisor.department else None,
            }
            
            return Response({
                'advisor': advisor_data,
                'students': students_data
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': 'Failed to fetch advisor students', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='companies')
    def companies(self, request):
        """
        GET /api/departments/companies/
        
        Get all companies in department with activity stats
        
        Returns list of companies with:
            - Company profile info
            - Posted internships count
            - Active interns count
            - Completed interns count
        """
        try:
            if not self._check_department_permission(request):
                return Response(
                    {'error': 'Only Department Heads can access this endpoint.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            department = self._get_department(request)
            
            # Base queryset with annotations
            queryset = User.objects.filter(
                role='COMPANY',
                is_approved=True
            ).select_related(
                'company_profile',
                'department'
            ).annotate(
                internships_count=Count('posted_internships'),
                active_interns_count=Count(
                    'posted_internships__advisor_assignments',
                    filter=Q(posted_internships__advisor_assignments__is_active=True)
                ),
                completed_interns_count=Count(
                    'posted_internships__advisor_assignments',
                    filter=Q(posted_internships__advisor_assignments__is_active=False)
                )
            )
            
            if department:
                queryset = queryset.filter(department=department)
            
            # Search
            search = request.query_params.get('search', None)
            if search:
                queryset = queryset.filter(
                    Q(company_profile__company_name__icontains=search) |
                    Q(email__icontains=search)
                )
            
            # Serialize
            serializer = DepartmentCompanySerializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': 'Failed to fetch companies', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='unassigned-students')
    def unassigned_students(self, request):
        """
        GET /api/departments/unassigned-students/
        
        Get students with accepted applications but no advisor assigned
        
        Returns list of students awaiting advisor assignment
        """
        try:
            if not self._check_department_permission(request):
                return Response(
                    {'error': 'Only Department Heads can access this endpoint.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            department = self._get_department(request)
            
            # Get accepted applications
            accepted_apps = Application.objects.filter(
                status='ACCEPTED'
            ).select_related(
                'student',
                'internship__company'
            )
            
            if department:
                accepted_apps = accepted_apps.filter(internship__department=department)
            
            # Exclude students who have ANY advisor assignment (active or completed)
            assigned_students = AdvisorAssignment.objects.values_list('student_id', flat=True)
            
            accepted_apps = accepted_apps.exclude(student_id__in=assigned_students)
            
            # Format response
            data = []
            for app in accepted_apps:
                data.append({
                    'application_id': app.id,
                    'student_id': app.student.id,
                    'student_name': app.student.get_full_name(),
                    'student_email': app.student.email,
                    'university_id': app.student.student_profile.university_id if hasattr(app.student, 'student_profile') else None,
                    'internship_id': app.internship.id,
                    'internship_title': app.internship.title,
                    'company_name': app.internship.get_company_name(),
                    'start_date': app.internship.start_date,
                    'accepted_at': app.reviewed_at,
                })
            
            return Response(data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': 'Failed to fetch unassigned students', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='assign-advisor')
    def assign_advisor(self, request):
        """
        POST /api/departments/assign-advisor/
        
        Assign an advisor to a student
        
        Request body:
            {
                "application_id": 1,
                "advisor_id": 5
            }
        
        Returns the created assignment
        """
        try:
            if not self._check_department_permission(request):
                return Response(
                    {'error': 'Only Department Heads can assign advisors.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            application_id = request.data.get('application_id')
            advisor_id = request.data.get('advisor_id')
            
            if not application_id or not advisor_id:
                return Response(
                    {'error': 'Both application_id and advisor_id are required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get application
            try:
                application = Application.objects.select_related(
                    'student',
                    'internship'
                ).get(id=application_id)
            except Application.DoesNotExist:
                return Response(
                    {'error': 'Application not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Validate application is accepted
            if application.status != 'ACCEPTED':
                return Response(
                    {'error': 'Can only assign advisor to accepted applications.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get advisor
            try:
                advisor = User.objects.get(id=advisor_id, role='ADVISOR', is_approved=True)
            except User.DoesNotExist:
                return Response(
                    {'error': 'Advisor not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Validate same department
            if application.student.department != advisor.department:
                return Response(
                    {'error': 'Advisor must be in the same department as the student.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if assignment already exists
            existing = AdvisorAssignment.objects.filter(
                student=application.student,
                internship=application.internship,
                is_active=True
            ).exists()
            
            if existing:
                return Response(
                    {'error': 'Student already has an active advisor for this internship.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create assignment
            assignment = AdvisorAssignment.objects.create(
                student=application.student,
                advisor=advisor,
                internship=application.internship,
                application=application,
                assigned_by=request.user,
                is_active=True
            )
            
            serializer = AdvisorAssignmentSerializer(assignment)
            return Response(
                {
                    'message': 'Advisor assigned successfully.',
                    'assignment': serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        
        except Exception as e:
            return Response(
                {'error': 'Failed to assign advisor', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='assign-company')
    def assign_company(self, request):
        """
        POST /api/departments/assign-company/
        
        Directly assign a student to a company/internship (Manual Placement)
        Bypasses the normal application process
        
        Request body:
            {
                "student_id": 1,
                "internship_id": 3,
                "assigned_by": "department_head"
            }
        
        Returns the created application and assignment
        """
        try:
            if not self._check_department_permission(request):
                return Response(
                    {'error': 'Only Department Heads can assign companies to students.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            student_id = request.data.get('student_id')
            internship_id = request.data.get('internship_id')
            
            if not student_id or not internship_id:
                return Response(
                    {'error': 'Both student_id and internship_id are required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get student
            try:
                student = User.objects.get(id=student_id, role='STUDENT', is_approved=True)
            except User.DoesNotExist:
                return Response(
                    {'error': 'Student not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get internship
            try:
                internship = Internship.objects.select_related('company').get(id=internship_id)
            except Internship.DoesNotExist:
                return Response(
                    {'error': 'Internship not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Validate same department
            if student.department != internship.department:
                return Response(
                    {'error': 'Student and internship must be in the same department.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if student already has an accepted application
            existing_accepted = Application.objects.filter(
                student=student,
                status='ACCEPTED'
            ).exists()
            
            if existing_accepted:
                return Response(
                    {'error': 'Student already has an accepted internship placement.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if internship has available slots (allow department head to override if needed)
            # We'll create the application even if slots are 0, but warn in logs
            if internship.available_slots <= 0:
                print(f"Warning: Assigning student to internship with {internship.available_slots} available slots")
            
            # Check if application already exists for this student-internship pair
            existing_app = Application.objects.filter(
                student=student,
                internship=internship
            ).first()
            
            if existing_app:
                if existing_app.status == 'ACCEPTED':
                    return Response(
                        {'error': 'Student is already accepted for this internship.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                # If pending or rejected, update it to accepted
                existing_app.status = 'ACCEPTED'
                existing_app.reviewed_by = None  # Department Head is not a COMPANY user
                existing_app.reviewed_at = timezone.now()
                existing_app.updated_at = timezone.now()
                # Save without validation
                existing_app.save_base(raw=True)
                application = existing_app
            else:
                # Create new application with ACCEPTED status (direct placement)
                # We need to bypass validation but still set all required fields
                from django.db import connection
                from django.db.models import F
                
                # Create the application object
                application = Application(
                    student=student,
                    internship=internship,
                    status='ACCEPTED',
                    reviewed_by=None,  # Set to None since Department Head is not a COMPANY user
                    reviewed_at=timezone.now(),
                    about_me='Direct placement by Department Head',
                )
                
                # Manually set the auto fields
                now = timezone.now()
                
                # Temporarily remove auto_now_add to allow manual setting
                applied_at_field = Application._meta.get_field('applied_at')
                updated_at_field = Application._meta.get_field('updated_at')
                
                original_auto_now_add = applied_at_field.auto_now_add
                original_auto_now = updated_at_field.auto_now
                
                applied_at_field.auto_now_add = False
                updated_at_field.auto_now = False
                
                try:
                    # Set the timestamps manually
                    application.applied_at = now
                    application.updated_at = now
                    
                    # Save without validation
                    application.save_base(raw=True, force_insert=True)
                finally:
                    # Restore the original field settings
                    applied_at_field.auto_now_add = original_auto_now_add
                    updated_at_field.auto_now = original_auto_now
            
            # Update internship slots
            internship.increment_filled_slots()
            
            # Send notifications (optional - don't fail if notifications fail)
            try:
                from apps.notifications.services import NotificationService
                
                # Notify student
                NotificationService.notify_placement_assigned_to_student(
                    student=student,
                    internship=internship
                )
                
                # Notify company
                NotificationService.notify_student_assigned_to_company(
                    company=internship.company,
                    student=student,
                    internship=internship
                )
            except Exception as notification_error:
                # Log the error but don't fail the assignment
                print(f"Warning: Failed to send notifications: {notification_error}")
            
            return Response(
                {
                    'message': 'Student successfully assigned to company.',
                    'application': {
                        'id': application.id,
                        'student_name': student.get_full_name(),
                        'company_name': internship.get_company_name(),
                        'internship_title': internship.title,
                        'status': application.status,
                    }
                },
                status=status.HTTP_201_CREATED
            )
        
        except Exception as e:
            # Log the full error for debugging
            import traceback
            error_details = traceback.format_exc()
            print(f"ERROR in assign_company: {error_details}")
            
            return Response(
                {'error': 'Failed to assign company to student', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='reports')
    def reports(self, request):
        """
        GET /api/departments/reports/
        
        Get all final reports in department
        
        Query params:
            - status: Filter by status (pending_advisor, submitted_to_department, completed)
        
        Returns list of final reports
        """
        try:
            if not self._check_department_permission(request):
                return Response(
                    {'error': 'Only Department Heads can access this endpoint.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            department = self._get_department(request)
            
            # Base queryset
            queryset = FinalReport.objects.select_related(
                'student',
                'company',
                'advisor',
                'advisor_assignment'
            )
            
            if department:
                queryset = queryset.filter(student__department=department)
            
            # Filter by status
            status_filter = request.query_params.get('status', None)
            if status_filter:
                queryset = queryset.filter(status=status_filter.upper())
            
            # Search
            search = request.query_params.get('search', None)
            if search:
                queryset = queryset.filter(
                    Q(student__student_profile__full_name__icontains=search) |
                    Q(company__company_profile__company_name__icontains=search)
                )
            
            # Serialize
            serializer = FinalReportListSerializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': 'Failed to fetch reports', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # ========================================================================
    # PHASE 3.3: NEW METHODS ADDED BELOW
    # ========================================================================
    
    @action(detail=False, methods=['get'], url_path='activity')
    def activity(self, request):
        """
        GET /api/departments/activity/
        
        Get recent activity feed (last 7 days)
        Shows recent acceptances, assignments, and completions
        
        PHASE 3.3: NEW METHOD
        
        Returns:
            List of activity objects with:
            - type: 'acceptance', 'assignment', or 'completion'
            - message: Human-readable description
            - timestamp: When it happened
            - student_id: Related student ID
        """
        try:
            if not self._check_department_permission(request):
                return Response(
                    {'error': 'Only Department Heads can access this endpoint.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            department = self._get_department(request)
            activities = []
            seven_days_ago = timezone.now() - timedelta(days=7)
            
            # Recent acceptances (applications accepted in last 7 days)
            if department:
                recent_acceptances = Application.objects.filter(
                    student__department=department,
                    status='ACCEPTED',
                    reviewed_at__gte=seven_days_ago
                ).select_related(
                    'student__student_profile',
                    'internship__company__company_profile'
                ).order_by('-reviewed_at')[:5]
            else:
                recent_acceptances = Application.objects.filter(
                    status='ACCEPTED',
                    reviewed_at__gte=seven_days_ago
                ).select_related(
                    'student__student_profile',
                    'internship__company__company_profile'
                ).order_by('-reviewed_at')[:5]
            
            for app in recent_acceptances:
                try:
                    student_name = app.student.get_full_name()
                    company_name = app.internship.company.get_full_name()
                    activities.append({
                        'type': 'acceptance',
                        'message': f"{student_name} accepted at {company_name}",
                        'timestamp': app.reviewed_at.isoformat(),
                        'student_id': app.student.id
                    })
                except Exception:
                    continue
            
            # Recent advisor assignments
            if department:
                recent_assignments = AdvisorAssignment.objects.filter(
                    student__department=department,
                    assigned_at__gte=seven_days_ago
                ).select_related(
                    'student__student_profile',
                    'advisor__advisor_profile'
                ).order_by('-assigned_at')[:5]
            else:
                recent_assignments = AdvisorAssignment.objects.filter(
                    assigned_at__gte=seven_days_ago
                ).select_related(
                    'student__student_profile',
                    'advisor__advisor_profile'
                ).order_by('-assigned_at')[:5]
            
            for assignment in recent_assignments:
                try:
                    student_name = assignment.student.get_full_name()
                    advisor_name = assignment.advisor.get_full_name()
                    activities.append({
                        'type': 'assignment',
                        'message': f"{advisor_name} assigned to {student_name}",
                        'timestamp': assignment.assigned_at.isoformat(),
                        'student_id': assignment.student.id
                    })
                except Exception:
                    continue
            
           # Recent completions - filter on AdvisorAssignment, not StudentProfile
            if department:
                recent_completions = AdvisorAssignment.objects.filter(
                    student__department=department,
                    is_active=False,
                    completed_at__isnull=False,
                    completed_at__gte=seven_days_ago
                ).select_related(
                    'student__student_profile'
                ).order_by('-completed_at')[:5]
            else:
                recent_completions = AdvisorAssignment.objects.filter(
                    is_active=False,
                    completed_at__isnull=False,
                    completed_at__gte=seven_days_ago
                ).select_related(
                    'student__student_profile'
                ).order_by('-completed_at')[:5]
            
            for assignment in recent_completions:
                try:
                    student_name = assignment.student.get_full_name()
                    activities.append({
                        'type': 'completion',
                        'message': f"{student_name} completed internship",
                        'timestamp': assignment.completed_at.isoformat(),
                        'student_id': assignment.student.id
                    })
                except Exception:
                    continue
            
            # Sort all activities by timestamp (most recent first)
            activities.sort(key=lambda x: x['timestamp'], reverse=True)
            
            # Return top 20 activities
            return Response(activities[:20], status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': 'Failed to fetch activity feed', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], url_path='complete')
    def mark_completed(self, request, pk=None):
        """
        POST /api/departments/students/<id>/complete/
        
        Mark student's internship as completed
        
        
        Requirements:
        - Student must have active internship
        - Final report must be submitted and approved
        
        Actions:
        - Updates student status to COMPLETED
        - Sets completion_date
        - Marks advisor assignment as inactive
        - Triggers certificate generation (if integrated)
        - Sends notifications (if integrated)
        
        Args:
            pk: Student user ID
        
        Returns:
            Success message and updated student data
        """
        try:
            if not self._check_department_permission(request):
                return Response(
                    {'error': 'Only Department Heads can access this endpoint.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            department = self._get_department(request)
            
            # Get student
            try:
                if department:
                    student = User.objects.select_related('student_profile').get(
                        id=pk,
                        role='STUDENT',
                        department=department
                    )
                else:
                    student = User.objects.select_related('student_profile').get(
                        id=pk,
                        role='STUDENT'
                    )
            except User.DoesNotExist:
                return Response(
                    {'error': 'Student not found or not in your department'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Validate student has an active internship
            if not hasattr(student, 'student_profile'):
                return Response(
                    {'error': 'Student profile not found'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            student_profile = student.student_profile
            
            # Check using property
            if student_profile.internship_status != 'ACTIVE':
                return Response(
                    {'error': 'Student does not have an active internship to complete'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if final report exists and is completed
            try:
                active_assignment = AdvisorAssignment.objects.get(
                    student=student,
                    is_active=True
                )
                
                # Check if final report is submitted to department
                try:
                    final_report = FinalReport.objects.get(
                        student=student,
                        advisor_assignment=active_assignment
                    )
                    
                    if final_report.status not in ['SUBMITTED_TO_DEPARTMENT', 'COMPLETED']:
                        return Response(
                            {'error': 'Final report must be submitted to department before marking as complete'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except FinalReport.DoesNotExist:
                    return Response(
                        {'error': 'Final report not found. Student must submit final report first.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
            except AdvisorAssignment.DoesNotExist:
                return Response(
                    {'error': 'No active advisor assignment found'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Mark student as completed using the method
            student_profile.mark_as_completed()
            
            # Update final report status to COMPLETED
            if final_report:
                final_report.status = 'COMPLETED'
                final_report.save()
            
            
            return Response({
                'message': 'Student internship marked as completed successfully',
                'student': {
                    'id': student.id,
                    'name': student.get_full_name(),
                    'status': student_profile.internship_status,
                    'completion_date': student_profile.completion_date.isoformat() if student_profile.completion_date else None
                }
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': 'Failed to mark student as completed', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='decision-intelligence')
    def decision_intelligence(self, request):
        """
        GET /api/departments/decision-intelligence/
        
        Strategic Data View for Department Head.
        Calculates trends, risk markers, and performance quality scores.
        """
        try:
            if not self._check_department_permission(request):
                return Response({'error': 'Only Department Heads can access this endpoint.'}, status=status.HTTP_403_FORBIDDEN)
            
            dept = self._get_department(request)
            q_filter = Q(department=dept) if dept else Q()
            q_filter_student = Q(student__department=dept) if dept else Q()
            
            # 1. Placement Trends (last 6 months)
            trends = []
            for i in range(5, -1, -1):
                start_date = (timezone.now() - timedelta(days=30*i)).replace(day=1)
                month_name = start_date.strftime('%b %Y')
                count = Application.objects.filter(
                    q_filter,
                    status='ACCEPTED',
                    reviewed_at__month=start_date.month,
                    reviewed_at__year=start_date.year
                ).count()
                trends.append({'month': month_name, 'count': count})

            # 2. Key Metrics
            total_students = User.objects.filter(q_filter, role='STUDENT', is_approved=True).count()
            placed_students = Application.objects.filter(q_filter, status='ACCEPTED').values('student').distinct().count()
            placement_rate = (placed_students / total_students * 100) if total_students > 0 else 0
            
            # Quality Score (Average attendance rate from monthly reports)
            try:
                avg_perf = MonthlyReport.objects.filter(q_filter_student).aggregate(Avg('attendance_rate'))['attendance_rate__avg'] or 0
            except Exception:
                avg_perf = 0

            # 3. Risk Identification
            # Overloaded advisors (> 15 students)
            try:
                overloaded_count = User.objects.filter(q_filter, role='ADVISOR').annotate(
                    acount=Count('supervised_students', filter=Q(supervised_students__is_active=True))
                ).filter(acount__gt=15).count()
            except Exception:
                overloaded_count = 0

            # Failing students (Those with 'NEEDS_IMPROVEMENT' in latest report)
            try:
                failing_count = MonthlyReport.objects.filter(q_filter_student, performance_rating='NEEDS_IMPROVEMENT').values('student').distinct().count() or 0
            except Exception:
                failing_count = 0

            # 4. Critical Escalations
            try:
                escalations = Escalation.objects.filter(department=dept, status='OPEN') if dept else Escalation.objects.filter(status='OPEN')
                escalations_data = EscalationSerializer(escalations[:5], many=True).data
            except Exception:
                escalations_data = []
            
            data = {
                'placement_rate': round(placement_rate, 1),
                'completion_rate': self._calculate_completion_rate(dept),
                'avg_performance_score': round(float(avg_perf), 1),
                'placement_trends': trends,
                'overloaded_advisors_count': overloaded_count,
                'failing_students_count': failing_count,
                'missing_reports_count': self._get_missing_reports_count(dept),
                'critical_escalations': escalations_data,
                'at_risk_students': self._get_at_risk_preview(dept)
            }
            
            return Response(data)
        except Exception as e:
            import traceback
            print(f"Decision Intelligence Error: {str(e)}")
            print(traceback.format_exc())
            return Response({'error': f'Failed to fetch decision intelligence data: {str(e)}'}, status=500)

    @action(detail=False, methods=['post'], url_path='validate-students')
    def validate_students(self, request):
        """Bulk validate student eligibility for the cycle"""
        student_ids = request.data.get('student_ids', [])
        is_eligible = request.data.get('is_eligible', True)
        
        updated = StudentProfile.objects.filter(user_id__in=student_ids).update(
            is_eligible=is_eligible,
            eligibility_confirmed_at=timezone.now()
        )
        return Response({'message': f'Updated {updated} students'}, status=200)

    @action(detail=True, methods=['post'], url_path='blacklist')
    def blacklist_company(self, request, pk=None):
        """Blacklist a company from department internships"""
        try:
            company_profile = CompanyProfile.objects.get(user_id=pk)
            company_profile.is_blacklisted = request.data.get('is_blacklisted', True)
            company_profile.blacklist_reason = request.data.get('reason', '')
            company_profile.save()
            return Response({'message': 'Company status updated'})
        except CompanyProfile.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

    def _calculate_completion_rate(self, dept):
        try:
            q = Q(student__department=dept) if dept else Q()
            total = AdvisorAssignment.objects.filter(q).count()
            completed = AdvisorAssignment.objects.filter(q, is_active=False).count()
            return round((completed / total * 100), 1) if total > 0 else 0
        except Exception:
            return 0

    def _get_missing_reports_count(self, dept):
        try:
            # Logic: Check for active students who haven't submitted a report in > 30 days
            month_ago = timezone.now() - timedelta(days=30)
            q = Q(student__department=dept) if dept else Q()
            
            # Get active assignments
            active_assignments = AdvisorAssignment.objects.filter(q, is_active=True)
            
            # Count those without recent reports
            missing = 0
            for assignment in active_assignments:
                recent_reports = MonthlyReport.objects.filter(
                    student=assignment.student,
                    submitted_at__gte=month_ago
                ).exists()
                if not recent_reports:
                    missing += 1
            
            return missing
        except Exception:
            return 0

    def _get_at_risk_preview(self, dept):
        try:
            # Preview of students with issues
            month_ago = timezone.now() - timedelta(days=30)
            q = Q(student__department=dept) if dept else Q()
            
            # Get active assignments
            active_assignments = AdvisorAssignment.objects.filter(
                q, is_active=True
            ).select_related('student', 'student__student_profile')[:10]
            
            at_risk = []
            for assignment in active_assignments:
                # Check if student has recent reports
                recent_reports = MonthlyReport.objects.filter(
                    student=assignment.student,
                    submitted_at__gte=month_ago
                ).exists()
                
                if not recent_reports:
                    at_risk.append({
                        'id': assignment.student.id,
                        'name': assignment.student.get_full_name(),
                        'reason': 'Missing Monthly Report'
                    })
                    
                    if len(at_risk) >= 5:
                        break
            
            return at_risk
        except Exception:
            return []

    @action(detail=False, methods=['get'], url_path='cycles')
    def cycles(self, request):
        """
        Get all department cycles
        GET /api/departments/cycles/
        """
        try:
            dept = self._get_department(request)
            if not dept:
                return Response({'error': 'Department not found'}, status=404)
            
            cycles = DepartmentCycle.objects.filter(department=dept).order_by('-year', '-semester')
            
            cycle_data = [{
                'id': cycle.id,
                'year': cycle.year,
                'semester': cycle.semester,
                'is_active': cycle.is_active,
                'start_date': cycle.start_date.isoformat(),
                'end_date': cycle.end_date.isoformat(),
                'created_at': cycle.created_at.isoformat(),
                'status': 'Active' if cycle.is_active else 'Closed',
                'duration_days': (cycle.end_date - cycle.start_date).days,
            } for cycle in cycles]
            
            return Response(cycle_data, status=200)
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    @action(detail=False, methods=['post'], url_path='cycles/create')
    def create_cycle(self, request):
        """
        Create a new department cycle
        POST /api/departments/cycles/create/
        Body: { year, semester, start_date, end_date, is_active }
        """
        try:
            dept = self._get_department(request)
            if not dept:
                return Response({'error': 'Department not found'}, status=404)
            
            year = request.data.get('year')
            semester = request.data.get('semester')
            start_date = request.data.get('start_date')
            end_date = request.data.get('end_date')
            is_active = request.data.get('is_active', False)
            
            # Validation
            if not year:
                return Response({'error': 'Year is required'}, status=400)
            if not semester:
                return Response({'error': 'Semester is required'}, status=400)
            if not start_date or start_date.strip() == '':
                return Response({'error': 'Start date is required and cannot be empty'}, status=400)
            if not end_date or end_date.strip() == '':
                return Response({'error': 'End date is required and cannot be empty'}, status=400)
            
            # Validate date format (should be YYYY-MM-DD)
            try:
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Dates must be in YYYY-MM-DD format'}, status=400)
            
            # Validate date logic
            if start_date_obj >= end_date_obj:
                return Response({'error': 'Start date must be before end date'}, status=400)
            
            # Check if cycle already exists
            if DepartmentCycle.objects.filter(department=dept, year=year, semester=semester).exists():
                return Response({'error': 'Cycle already exists for this year and semester'}, status=400)
            
            # If setting as active, deactivate other cycles
            if is_active:
                DepartmentCycle.objects.filter(department=dept, is_active=True).update(is_active=False)
            
            # Create cycle
            cycle = DepartmentCycle.objects.create(
                department=dept,
                year=year,
                semester=semester,
                start_date=start_date_obj,
                end_date=end_date_obj,
                is_active=is_active
            )
            
            return Response({
                'message': 'Cycle created successfully',
                'cycle': {
                    'id': cycle.id,
                    'year': cycle.year,
                    'semester': cycle.semester,
                    'is_active': cycle.is_active,
                    'start_date': cycle.start_date.isoformat(),
                    'end_date': cycle.end_date.isoformat(),
                }
            }, status=201)
            
        except Exception as e:
            return Response({'error': f'Failed to create cycle: {str(e)}'}, status=500)
    
    @action(detail=True, methods=['put'], url_path='cycles/update')
    def update_cycle(self, request, pk=None):
        """
        Update an existing cycle
        PUT /api/departments/{cycle_id}/cycles/update/
        Body: { year, semester, start_date, end_date, is_active }
        """
        try:
            dept = self._get_department(request)
            if not dept:
                return Response({'error': 'Department not found'}, status=404)
            
            cycle = DepartmentCycle.objects.filter(id=pk, department=dept).first()
            if not cycle:
                return Response({'error': 'Cycle not found'}, status=404)
            
            # Update fields
            if 'year' in request.data:
                cycle.year = request.data['year']
            if 'semester' in request.data:
                cycle.semester = request.data['semester']
            if 'start_date' in request.data:
                start_date = request.data['start_date']
                if not start_date or start_date.strip() == '':
                    return Response({'error': 'Start date cannot be empty'}, status=400)
                try:
                    cycle.start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                except ValueError:
                    return Response({'error': 'Start date must be in YYYY-MM-DD format'}, status=400)
            if 'end_date' in request.data:
                end_date = request.data['end_date']
                if not end_date or end_date.strip() == '':
                    return Response({'error': 'End date cannot be empty'}, status=400)
                try:
                    cycle.end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                except ValueError:
                    return Response({'error': 'End date must be in YYYY-MM-DD format'}, status=400)
            
            # Validate date logic
            if cycle.start_date >= cycle.end_date:
                return Response({'error': 'Start date must be before end date'}, status=400)
            
            if 'is_active' in request.data:
                is_active = request.data['is_active']
                if is_active:
                    # Deactivate other cycles
                    DepartmentCycle.objects.filter(department=dept, is_active=True).exclude(id=pk).update(is_active=False)
                cycle.is_active = is_active
            
            cycle.save()
            
            return Response({
                'message': 'Cycle updated successfully',
                'cycle': {
                    'id': cycle.id,
                    'year': cycle.year,
                    'semester': cycle.semester,
                    'is_active': cycle.is_active,
                    'start_date': cycle.start_date.isoformat(),
                    'end_date': cycle.end_date.isoformat(),
                }
            }, status=200)
            
        except Exception as e:
            return Response({'error': f'Failed to update cycle: {str(e)}'}, status=500)
    
    @action(detail=True, methods=['post'], url_path='cycles/activate')
    def activate_cycle(self, request, pk=None):
        """
        Activate a specific cycle (deactivates all others)
        POST /api/departments/{cycle_id}/cycles/activate/
        """
        try:
            dept = self._get_department(request)
            if not dept:
                return Response({'error': 'Department not found'}, status=404)
            
            cycle = DepartmentCycle.objects.filter(id=pk, department=dept).first()
            if not cycle:
                return Response({'error': 'Cycle not found'}, status=404)
            
            # Deactivate all other cycles
            DepartmentCycle.objects.filter(department=dept, is_active=True).update(is_active=False)
            
            # Activate this cycle
            cycle.is_active = True
            cycle.save()
            
            return Response({
                'message': f'Cycle {cycle.year} Semester {cycle.semester} activated successfully'
            }, status=200)
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    @action(detail=True, methods=['post'], url_path='cycles/close')
    def close_cycle(self, request, pk=None):
        """
        Close/deactivate a specific cycle
        POST /api/departments/{cycle_id}/cycles/close/
        """
        try:
            dept = self._get_department(request)
            if not dept:
                return Response({'error': 'Department not found'}, status=404)
            
            cycle = DepartmentCycle.objects.filter(id=pk, department=dept).first()
            if not cycle:
                return Response({'error': 'Cycle not found'}, status=404)
            
            cycle.is_active = False
            cycle.save()
            
            return Response({
                'message': f'Cycle {cycle.year} Semester {cycle.semester} closed successfully'
            }, status=200)
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    @action(detail=True, methods=['delete'], url_path='cycles/delete')
    def delete_cycle(self, request, pk=None):
        """
        Delete a cycle (only if not active and has no associated data)
        DELETE /api/departments/{cycle_id}/cycles/delete/
        """
        try:
            dept = self._get_department(request)
            if not dept:
                return Response({'error': 'Department not found'}, status=404)
            
            cycle = DepartmentCycle.objects.filter(id=pk, department=dept).first()
            if not cycle:
                return Response({'error': 'Cycle not found'}, status=404)
            
            if cycle.is_active:
                return Response({'error': 'Cannot delete an active cycle'}, status=400)
            
            cycle.delete()
            
            return Response({
                'message': 'Cycle deleted successfully'
            }, status=200)
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=False, methods=['get'], url_path='escalations')
    def escalations(self, request):
        """
        Get all escalations for the department
        GET /api/departments/escalations/
        Query params: status (OPEN, RESOLVED, ESCALATED_TO_UIL)
        """
        try:
            dept = self._get_department(request)
            if not dept:
                return Response({'error': 'Department not found'}, status=404)
            
            status_filter = request.query_params.get('status', 'OPEN')
            
            escalations = Escalation.objects.filter(
                department=dept,
                status=status_filter
            ).select_related('student', 'advisor', 'company', 'created_by').order_by('-created_at')
            
            escalation_data = [{
                'id': esc.id,
                'issue_type': esc.issue_type,
                'issue_type_display': esc.get_issue_type_display(),
                'title': esc.title,
                'description': esc.description,
                'status': esc.status,
                'status_display': esc.get_status_display(),
                'student_name': esc.student.get_full_name() if esc.student else None,
                'student_id': esc.student.id if esc.student else None,
                'advisor_name': esc.advisor.get_full_name() if esc.advisor else None,
                'advisor_id': esc.advisor.id if esc.advisor else None,
                'company_name': esc.company.company_profile.company_name if esc.company and hasattr(esc.company, 'company_profile') else None,
                'company_id': esc.company.id if esc.company else None,
                'resolution_notes': esc.resolution_notes,
                'created_by_name': esc.created_by.get_full_name() if esc.created_by else None,
                'created_at': esc.created_at.isoformat(),
                'updated_at': esc.updated_at.isoformat(),
            } for esc in escalations]
            
            return Response({
                'count': len(escalation_data),
                'escalations': escalation_data
            }, status=200)
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    @action(detail=True, methods=['post'], url_path='escalations/resolve')
    def resolve_escalation(self, request, pk=None):
        """
        Resolve an escalation
        POST /api/departments/{escalation_id}/escalations/resolve/
        Body: { resolution_notes }
        """
        try:
            dept = self._get_department(request)
            if not dept:
                return Response({'error': 'Department not found'}, status=404)
            
            escalation = Escalation.objects.filter(id=pk, department=dept).first()
            if not escalation:
                return Response({'error': 'Escalation not found'}, status=404)
            
            resolution_notes = request.data.get('resolution_notes', '')
            
            escalation.status = 'RESOLVED'
            escalation.resolution_notes = resolution_notes
            escalation.save()
            
            return Response({
                'message': 'Escalation resolved successfully',
                'escalation': {
                    'id': escalation.id,
                    'status': escalation.status,
                    'resolution_notes': escalation.resolution_notes,
                }
            }, status=200)
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    @action(detail=True, methods=['post'], url_path='escalations/escalate-to-uil')
    def escalate_to_uil(self, request, pk=None):
        """
        Escalate an issue to UIL (University Internship Leadership)
        POST /api/departments/{escalation_id}/escalations/escalate-to-uil/
        Body: { escalation_reason }
        """
        try:
            dept = self._get_department(request)
            if not dept:
                return Response({'error': 'Department not found'}, status=404)
            
            escalation = Escalation.objects.filter(id=pk, department=dept).first()
            if not escalation:
                return Response({'error': 'Escalation not found'}, status=404)
            
            escalation_reason = request.data.get('escalation_reason', '')
            
            escalation.status = 'ESCALATED_TO_UIL'
            escalation.resolution_notes = f"Escalated to UIL: {escalation_reason}"
            escalation.save()
            
            return Response({
                'message': 'Issue escalated to UIL successfully',
                'escalation': {
                    'id': escalation.id,
                    'status': escalation.status,
                    'resolution_notes': escalation.resolution_notes,
                }
            }, status=200)
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    @action(detail=False, methods=['post'], url_path='escalations/create')
    def create_escalation(self, request):
        """
        Create a new escalation
        POST /api/departments/escalations/create/
        Body: { issue_type, title, description, student_id, advisor_id, company_id }
        """
        try:
            dept = self._get_department(request)
            if not dept:
                return Response({'error': 'Department not found'}, status=404)
            
            issue_type = request.data.get('issue_type')
            title = request.data.get('title')
            description = request.data.get('description')
            student_id = request.data.get('student_id')
            advisor_id = request.data.get('advisor_id')
            company_id = request.data.get('company_id')
            
            if not all([issue_type, title, description]):
                return Response({'error': 'Missing required fields'}, status=400)
            
            student = None
            advisor = None
            company = None
            
            if student_id:
                student = User.objects.filter(id=student_id, department=dept).first()
            if advisor_id:
                advisor = User.objects.filter(id=advisor_id, department=dept).first()
            if company_id:
                company = User.objects.filter(id=company_id).first()
            
            escalation = Escalation.objects.create(
                department=dept,
                issue_type=issue_type,
                title=title,
                description=description,
                student=student,
                advisor=advisor,
                company=company,
                created_by=request.user,
                status='OPEN'
            )
            
            return Response({
                'message': 'Escalation created successfully',
                'escalation': {
                    'id': escalation.id,
                    'issue_type': escalation.issue_type,
                    'title': escalation.title,
                    'status': escalation.status,
                }
            }, status=201)
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=False, methods=['post'], url_path='add-advisor')
    def add_advisor(self, request):
        """
        POST /api/departments/add-advisor/
        
        Register a new advisor (Department Head only)
        
        Request body:
            {
                "full_name": "Dr. John Doe",
                "email": "advisor@university.edu",
                "phone_number": "+251 912 345 678",
                "staff_id": "STAFF-2024-001",
                "max_students": 15
            }
        
        Returns the created advisor user
        """
        try:
            if not self._check_department_permission(request):
                return Response(
                    {'error': 'Only Department Heads can register advisors.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get form data
            full_name = request.data.get('full_name')
            email = request.data.get('email')
            phone_number = request.data.get('phone_number')
            staff_id = request.data.get('staff_id')
            max_students = request.data.get('max_students', 15)
            
            # Validation
            if not all([full_name, email, phone_number, staff_id]):
                return Response(
                    {'error': 'All fields are required: full_name, email, phone_number, staff_id'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if email already exists
            if User.objects.filter(email=email).exists():
                return Response(
                    {'error': 'An account with this email already exists.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if staff_id already exists
            if AdvisorProfile.objects.filter(staff_id=staff_id).exists():
                return Response(
                    {'error': 'An advisor with this staff ID already exists.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get department
            department = self._get_department(request)
            if not department:
                return Response(
                    {'error': 'Department not found.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate random password
            import random
            import string
            password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
            
            # Create user
            user = User.objects.create_user(
                email=email,
                password=password,
                role='ADVISOR',
                department=department,
                is_approved=True  # Auto-approve since created by Department Head
            )
            
            # Create advisor profile
            advisor_profile = AdvisorProfile.objects.create(
                user=user,
                full_name=full_name,
                phone_number=phone_number,
                staff_id=staff_id,
                max_students=max_students
            )
            
            # Send email with credentials
            try:
                from django.core.mail import send_mail
                from django.conf import settings
                
                # Get frontend URL
                try:
                    frontend_url = settings.CORS_ALLOWED_ORIGINS[0]
                except (AttributeError, IndexError):
                    frontend_url = 'http://localhost:5173'
                
                subject = 'Welcome to Internship Management System - Advisor Account Created'
                message = f"""
Dear {full_name},

Your advisor account has been created by the Department Head.

Login Credentials:
Email: {email}
Password: {password}

Please login at: {frontend_url}/login

After logging in, we recommend changing your password in the settings.

Best regards,
Internship Management System
                """
                
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=True,
                )
            except Exception as e:
                # Log error but don't fail the request
                print(f"Failed to send email: {str(e)}")
            
            return Response(
                {
                    'success': True,
                    'message': f'Advisor {full_name} has been successfully registered. Login credentials have been sent to {email}.',
                    'advisor': {
                        'id': user.id,
                        'full_name': full_name,
                        'email': email,
                        'staff_id': staff_id,
                        'max_students': max_students,
                    }
                },
                status=status.HTTP_201_CREATED
            )
        
        except Exception as e:
            return Response(
                {'error': 'Failed to register advisor', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UILDepartmentViewSet(viewsets.ModelViewSet):
    """
    Department management endpoints for UIL/Admin
    Allows creating, listing, and deleting departments
    """
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, IsUIL | IsAdmin]

    def get_queryset(self):
        return Department.objects.all().order_by('name')

    def perform_create(self, serializer):
        """Create department, department head user, and send credentials"""
        department = serializer.save()
        
        # 1. Generate random password
        temp_password = get_random_string(12)
        
        # 2. Create User account for Department Head
        try:
            # Check if user already exists
            user = User.objects.filter(email=department.email).first()
            if not user:
                user = User.objects.create_user(
                    email=department.email,
                    password=temp_password,
                    role='DEPARTMENT_HEAD',
                    department=department,
                    is_active=True,
                    is_approved=True
                )
                
                # 3. Create Profile
                DepartmentHeadProfile.objects.create(
                    user=user,
                    full_name=department.head_name,
                    phone_number=department.phone
                )
            else:
                # If user exists, just update their role and department if they aren't already DH
                if user.role != 'DEPARTMENT_HEAD':
                    user.role = 'DEPARTMENT_HEAD'
                    user.department = department
                    user.save()
            
            # 4. Notify with credentials
            NotificationService.notify_department_created(department, temp_password)
            
        except Exception as e:
            print(f"Error creating Department Head account: {e}")
            # Even if user creation fails, we already saved the department

