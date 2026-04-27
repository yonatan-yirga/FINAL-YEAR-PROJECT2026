"""
Application Views
API views for student application system
"""
from rest_framework import generics, status, parsers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Application
from .serializers import (
    ApplicationSerializer,
    ApplicationCreateSerializer,
    ApplicationListSerializer,
    ApplicationActionSerializer,
)
from apps.internships.models import Internship
from core.permissions import (
    IsSameDepartmentOrUIL,
    IsStudentOrUIL,
    IsCompanyOrUIL,
    IsOwnerOrUIL,
)
from apps.notifications.services import NotificationService


class ApplyToInternshipView(generics.CreateAPIView):
    """
    POST /api/applications/
    
    Create a new application (student applies to internship)
    
    Request Body:
    {
        "internship": 1,
        "cover_letter": "I am very interested..."
    }
    
    Permissions: Student users only
    Auto-sets: student = request.user
    
    Workflow:
    1. Validate internship is accepting applications
    2. Check no duplicate application
    3. Check student has no active internship
    4. Create application (status=PENDING)
    5. Send notification to company
    """
    
    serializer_class = ApplicationCreateSerializer
    permission_classes = [IsAuthenticated, IsStudentOrUIL]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def perform_create(self, serializer):
        """Create application and send notification"""
        # Save application
        application = serializer.save()
        
        # Send notification to company
        try:
            company = application.internship.company
            NotificationService.create_notification(
                recipient=company,
                title='New Application Received',
                message=f'{application.get_student_name()} has applied for {application.internship.title}.',
                notification_type='APPLICATION_RECEIVED',
                link='/company/applications'
            )
        except Exception as e:
            # Log error but don't fail the application
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Failed to send application notification: {str(e)}')


class MyApplicationsView(generics.ListAPIView):
    """
    GET /api/applications/my-applications/
    
    List all applications submitted by current student
    
    Query Parameters:
    - status: Filter by status (PENDING, ACCEPTED, REJECTED)
    
    Permissions: Student users only
    Returns: Student's own applications only
    """
    
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsStudentOrUIL]
    
    def get_queryset(self):
        """Get current student's applications"""
        user = self.request.user
        
        # UIL can't use this endpoint
        if user.role == 'UIL' or user.is_staff:
            return Application.objects.none()
        
        # Get student's applications
        queryset = Application.objects.filter(
            student=user
        ).select_related(
            'internship',
            'internship__company',
            'internship__company__company_profile',
            'internship__department',
            'reviewed_by'
        ).order_by('-applied_at')
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())
        
        return queryset


class ApplicationDetailView(generics.RetrieveAPIView):
    """
    GET /api/applications/<id>/
    
    Get detailed information about a specific application
    
    Permissions:
    - Student can view their own applications
    - Company can view applications to their internships
    - UIL can view all
    """
    
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsSameDepartmentOrUIL]
    
    def get_queryset(self):
        """Get applications based on user role"""
        user = self.request.user
        
        # UIL and Admin can see all
        if user.is_staff or user.role == 'UIL':
            return Application.objects.all()
        
        # Students see their own applications
        if user.role == 'STUDENT':
            return Application.objects.filter(student=user)
        
        # Companies see applications to their internships
        if user.role == 'COMPANY':
            return Application.objects.filter(internship__company=user)
        
        # Others see nothing
        return Application.objects.none()


class CompanyApplicationsView(generics.ListAPIView):
    """
    GET /api/applications/company-applications/
    
    List all applications received for company's internships
    
    Query Parameters:
    - status: Filter by status (PENDING, ACCEPTED, REJECTED)
    - internship: Filter by internship ID
    
    Permissions: Company users only
    Returns: Applications to company's internships
    """
    
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsCompanyOrUIL]
    
    def get_queryset(self):
        """Get applications for company's internships"""
        user = self.request.user
        
        # UIL can't use this endpoint effectively
        if user.role == 'UIL' or user.is_staff:
            return Application.objects.none()
        
        # Get applications for company's internships
        queryset = Application.objects.filter(
            internship__company=user
        ).select_related(
            'student',
            'student__student_profile',
            'internship',
            'internship__department',
            'reviewed_by'
        ).order_by('-applied_at')
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())
        
        # Filter by internship if provided
        internship_id = self.request.query_params.get('internship', None)
        if internship_id:
            queryset = queryset.filter(internship_id=internship_id)
        
        return queryset


class AcceptApplicationView(APIView):
    """
    POST /api/applications/<id>/accept/
    
    Accept a pending application
    
    Permissions: Company owner of internship or UIL
    
    Workflow:
    1. Update application status to ACCEPTED
    2. Send notification to student
    3. Send notification to department (for advisor assignment)
    4. Check if max applicants reached
    5. If reached: close internship, reject other pending applications
    """
    
    permission_classes = [IsAuthenticated, IsCompanyOrUIL]
    
    def post(self, request, pk):
        """Accept application"""
        # Get application
        application = get_object_or_404(
            Application.objects.select_related('internship', 'student'),
            pk=pk
        )
        
        # Check permission - must be internship owner (unless UIL/Admin)
        if request.user.role == 'COMPANY':
            if application.internship.company != request.user:
                return Response(
                    {'error': 'You can only accept applications to your own internships.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Check application is pending
        if application.status != 'PENDING':
            return Response(
                {'error': f'Cannot accept application with status: {application.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check internship has available slots
        if application.internship.available_slots <= 0:
            return Response(
                {'error': 'No available slots remaining for this internship.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Accept the application
        try:
            application.accept(request.user)
            
            return Response({
                'message': 'Application accepted successfully.',
                'application': ApplicationSerializer(application).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to accept application: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class RejectApplicationView(APIView):
    """
    POST /api/applications/<id>/reject/
    
    Reject a pending application
    
    Request Body:
    {
        "rejection_reason": "We have decided to proceed with other candidates."
    }
    
    Permissions: Company owner of internship or UIL
    
    Workflow:
    1. Update application status to REJECTED
    2. Store rejection reason
    3. Send notification to student only
    """
    
    permission_classes = [IsAuthenticated, IsCompanyOrUIL]
    
    def post(self, request, pk):
        """Reject application"""
        # Get application
        application = get_object_or_404(
            Application.objects.select_related('internship', 'student'),
            pk=pk
        )
        
        # Check permission - must be internship owner (unless UIL/Admin)
        if request.user.role == 'COMPANY':
            if application.internship.company != request.user:
                return Response(
                    {'error': 'You can only reject applications to your own internships.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Check application is pending
        if application.status != 'PENDING':
            return Response(
                {'error': f'Cannot reject application with status: {application.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get rejection reason
        rejection_reason = request.data.get('rejection_reason', '').strip()
        if not rejection_reason:
            return Response(
                {'error': 'Rejection reason is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Reject the application
        try:
            application.reject(request.user, reason=rejection_reason)
            
            return Response({
                'message': 'Application rejected successfully.',
                'application': ApplicationSerializer(application).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to reject application: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class WithdrawApplicationView(APIView):
    """
    POST /api/applications/<id>/withdraw/
    
    Withdraw a pending application (student action)
    
    Permissions: Student who owns the application
    
    Note: Deletes the application entirely
    """
    
    permission_classes = [IsAuthenticated, IsStudentOrUIL]
    
    def post(self, request, pk):
        """Withdraw application"""
        # Get application
        application = get_object_or_404(
            Application.objects.select_related('student'),
            pk=pk
        )
        
        # Check permission - must be application owner (unless UIL/Admin)
        if request.user.role == 'STUDENT':
            if application.student != request.user:
                return Response(
                    {'error': 'You can only withdraw your own applications.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Check application is pending
        if application.status != 'PENDING':
            return Response(
                {'error': 'Can only withdraw pending applications.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Withdraw (delete) the application
        try:
            application.withdraw()
            
            return Response({
                'message': 'Application withdrawn successfully.'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to withdraw application: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

class ConfirmPlacementView(APIView):
    """
    POST /api/applications/<id>/confirm/
    
    Student action: Confirm and accept the internship offer
    
    Permissions: Student who owns the application
    """
    
    permission_classes = [IsAuthenticated, IsStudentOrUIL]
    
    def post(self, request, pk):
        """Confirm placement"""
        # Get application
        application = get_object_or_404(
            Application.objects.select_related('student', 'internship'),
            pk=pk
        )
        
        # Check permission
        if application.student != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You can only confirm your own offers.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check status is OFFERED
        if application.status != 'OFFERED':
            return Response(
                {'error': f'Cannot confirm placement for application with status: {application.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Confirm the placement
        try:
            application.confirm_placement()
            
            return Response({
                'message': 'Internship placement confirmed successfully!',
                'application': ApplicationSerializer(application).data
            }, status=status.HTTP_200_OK)
            
        except DjangoValidationError as e:
            return Response(
                {'error': e.message_dict if hasattr(e, 'message_dict') else str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to confirm placement: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

class MyFeedbackView(generics.ListAPIView):
    """
    GET /api/applications/my-feedback/

    Returns all feedback the current student has received from their advisor.

    Permission: Student only.
    Logic: find the active AdvisorAssignment linked to this student,
           then return its feedbacks ordered newest-first.
    """

    permission_classes = [IsAuthenticated, IsStudentOrUIL]

    def get_serializer_class(self):
        # Import here to avoid circular imports
        from apps.advisors.serializers import FeedbackSerializer
        return FeedbackSerializer

    def get_queryset(self):
        from apps.advisors.models import AdvisorAssignment, Feedback

        user = self.request.user

        if user.role not in ('STUDENT',):
            return Feedback.objects.none()

        # Find the active advisor assignment for this student
        try:
            assignment = AdvisorAssignment.objects.get(
                student=user,
                is_active=True
            )
        except AdvisorAssignment.DoesNotExist:
            return Feedback.objects.none()

        return Feedback.objects.filter(
            advisor_assignment=assignment
        ).order_by('-created_at')