"""
Registration Views
Handles registration requests, approval, and rejection
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import RegistrationRequest
from .serializers import (
    RegistrationRequestSerializer,
    RegistrationDetailSerializer,
    RegistrationApprovalSerializer,
    DepartmentListSerializer
)
from apps.departments.models import Department
from apps.accounts.permissions import IsUIL
from apps.notifications.services import NotificationService  # PHASE 2.4: Added


class RegisterView(APIView):
    """
    Public registration endpoint
    POST /api/registrations/register/
    """
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        """Create new registration request"""
        try:
            serializer = RegistrationRequestSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(
                    {'error': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save registration
            registration = serializer.save()
            
            # Send notifications (Applicant confirmation + UIL office alert)
            try:
                NotificationService.notify_registration_submitted(registration)
            except Exception as e:
                print(f'Notification error: {e}')
            
            return Response(
                {
                    'message': 'Registration submitted successfully. You will receive an email once your request is reviewed.',
                    'registration_id': registration.id
                },
                status=status.HTTP_201_CREATED
            )
        
        except Exception as e:
            return Response(
                {'error': 'An error occurred while processing your registration.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PendingRegistrationsView(ListAPIView):
    """
    List pending registrations
    GET /api/registrations/pending/
    """
    permission_classes = [IsUIL]
    serializer_class = RegistrationRequestSerializer
    
    def get_queryset(self):
        """Get pending registrations with optional type filter"""
        queryset = RegistrationRequest.objects.filter(status='PENDING')
        
        request_type = self.request.query_params.get('type')
        if request_type:
            queryset = queryset.filter(request_type=request_type.upper())
        
        return queryset.select_related('department', 'reviewed_by')


class RegistrationDetailView(RetrieveAPIView):
    """
    Get registration details
    GET /api/registrations/<id>/
    """
    permission_classes = [IsUIL]
    serializer_class = RegistrationDetailSerializer
    queryset = RegistrationRequest.objects.all()


class ApproveRegistrationView(APIView):
    """
    Approve registration
    POST /api/registrations/<id>/approve/
    """
    permission_classes = [IsUIL]
    
    @transaction.atomic
    def post(self, request, pk):
        """Approve registration and create user account"""
        try:
            try:
                registration = RegistrationRequest.objects.select_for_update().get(
                    pk=pk,
                    status='PENDING'
                )
            except RegistrationRequest.DoesNotExist:
                return Response(
                    {'error': 'Registration not found or already processed.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            try:
                user, temp_password = registration.approve(request.user)
            except ValueError as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Send notification + welcome HTML email via NotificationService.
            # This is the ONLY email sent on approval — duplicate legacy email removed.
            try:
                NotificationService.notify_registration_approved(user, temp_password)
            except Exception as e:
                print(f'Notification error: {e}')
            
            return Response(
                {
                    'message': 'Registration approved successfully.',
                    'user_email': user.email,
                    'temp_password': temp_password
                },
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                {'error': 'An error occurred while approving the registration.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RejectRegistrationView(APIView):
    """
    Reject registration
    POST /api/registrations/<id>/reject/
    """
    permission_classes = [IsUIL]
    
    def post(self, request, pk):
        """Reject registration with reason"""
        try:
            try:
                registration = RegistrationRequest.objects.get(pk=pk, status='PENDING')
            except RegistrationRequest.DoesNotExist:
                return Response(
                    {'error': 'Registration not found or already processed.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = RegistrationApprovalSerializer(
                data=request.data,
                context={'action': 'reject'}
            )
            
            if not serializer.is_valid():
                return Response(
                    {'error': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            rejection_reason = serializer.validated_data.get('rejection_reason')
            
            try:
                registration.reject(request.user, rejection_reason)
            except ValueError as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Send rejection email via NotificationService.
            # This is the ONLY email sent on rejection — duplicate legacy email removed.
            try:
                NotificationService.notify_registration_rejected(registration.email, rejection_reason)
            except Exception as e:
                print(f'Notification error: {e}')
            
            return Response(
                {'message': 'Registration rejected successfully.'},
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                {'error': 'An error occurred while rejecting the registration.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UILDashboardStatsView(APIView):
    """
    Get UIL dashboard statistics
    GET /api/registrations/stats/
    """
    permission_classes = [IsUIL]
    
    def get(self, request):
        """Return dashboard statistics for UIL"""
        try:
            today = timezone.now().date()
            week_ago = today - timedelta(days=7)
            
            stats = {
                'total_pending': RegistrationRequest.objects.filter(
                    status='PENDING'
                ).count(),
                
                'pending_today': RegistrationRequest.objects.filter(
                    status='PENDING',
                    submitted_at__date=today
                ).count(),
                
                'approved_this_week': RegistrationRequest.objects.filter(
                    status='APPROVED',
                    reviewed_at__date__gte=week_ago
                ).count(),
                
                'rejected_this_week': RegistrationRequest.objects.filter(
                    status='REJECTED',
                    reviewed_at__date__gte=week_ago
                ).count(),
                
                'by_type': {
                    'students': RegistrationRequest.objects.filter(
                        status='PENDING',
                        request_type='STUDENT'
                    ).count(),
                    'companies': RegistrationRequest.objects.filter(
                        status='PENDING',
                        request_type='COMPANY'
                    ).count(),
                    'advisors': RegistrationRequest.objects.filter(
                        status='PENDING',
                        request_type='ADVISOR'
                    ).count(),
                    'departments': RegistrationRequest.objects.filter(
                        status='PENDING',
                        request_type='DEPARTMENT'
                    ).count(),
                },
            }
            
            recent_registrations = RegistrationRequest.objects.all().order_by(
                '-submitted_at'
            )[:10]
            
            stats['recent_activity'] = RegistrationRequestSerializer(
                recent_registrations,
                many=True,
                context={'request': request}
            ).data
            
            return Response(stats, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': 'Failed to fetch dashboard statistics.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DepartmentListView(ListAPIView):
    """
    List departments for registration form
    GET /api/registrations/departments/
    """
    permission_classes = [AllowAny]
    serializer_class = DepartmentListSerializer
    queryset = Department.objects.all().order_by('name')