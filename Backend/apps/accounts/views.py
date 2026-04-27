"""
Authentication Views for Internship Management System
Uses Token Authentication 
"""
import secrets
from datetime import timedelta
from django.conf import settings as django_settings
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from .serializers import (
    LoginSerializer,
    UserSerializer,
    PasswordChangeSerializer,
    UserProfileSerializer,
    StudentProfileSerializer,
    CompanyProfileSerializer,
    AdvisorProfileSerializer,
    DepartmentHeadProfileSerializer,
)
from apps.accounts.permissions import IsUIL, IsAdmin
from apps.accounts.models import (
    StudentProfile, CompanyProfile, AdvisorProfile, DepartmentHeadProfile,
    PasswordResetToken,
)

User = get_user_model()


class LoginView(APIView):
    """
    User login endpoint
    
    POST /api/auth/login/
    
    Request:
        {
            "email": "user@example.com",
            "password": "password123"
        }
    
    Response (Success - 200):
        {
            "token": "abc123...",
            "user": {
                "id": 1,
                "email": "user@example.com",
                "role": "STUDENT",
                "department": 1,
                "department_name": "Computer Science",
                "is_approved": true,
                "is_active": true,
                "full_name": "John Doe",
                "created_at": "2026-01-01T00:00:00Z",
                "last_login": "2026-02-11T00:00:00Z"
            }
        }
    
    Response (Error - 400):
        {
            "error": "Invalid email or password. Please check your credentials and try again."
        }
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    
    def post(self, request):
        """
        Authenticate user and return token
        
        Args:
            request: HTTP request with email and password
            
        Returns:
            Response with token and user data on success
            Response with error message on failure
        """
        try:
            # Validate credentials using serializer
            serializer = self.serializer_class(
                data=request.data,
                context={'request': request}
            )
            
            if not serializer.is_valid():
                # Extract first error message
                errors = serializer.errors
                
                # Handle non-field errors
                if 'non_field_errors' in errors:
                    error_message = errors['non_field_errors'][0]
                else:
                    # Get first field error
                    first_field = list(errors.keys())[0]
                    error_message = errors[first_field][0] if isinstance(errors[first_field], list) else errors[first_field]
                
                return Response(
                    {'error': str(error_message)},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get validated user
            user = serializer.validated_data['user']
            
            # Create or get auth token
            token, created = Token.objects.get_or_create(user=user)
            
            # Update last login
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            # Serialize user data
            user_data = UserSerializer(user).data
            
            return Response(
                {
                    'token': token.key,
                    'user': user_data,
                    'message': 'Login successful'
                },
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                {'error': 'An error occurred during login. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LogoutView(APIView):
    """
    User logout endpoint
    
    POST /api/auth/logout/
    
    Headers:
        Authorization: Token abc123...
    
    Response (Success - 200):
        {
            "message": "Successfully logged out"
        }
    
    Response (Error - 401):
        {
            "detail": "Authentication credentials were not provided."
        }
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Logout user by deleting their auth token
        
        Args:
            request: HTTP request with authentication token
            
        Returns:
            Response with success message
        """
        try:
            # Delete the user's token
            request.user.auth_token.delete()
            
            return Response(
                {'message': 'Successfully logged out'},
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                {'error': 'An error occurred during logout. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserProfileView(APIView):
    """
    Get current user profile with role-specific data
    
    GET /api/auth/profile/
    
    Headers:
        Authorization: Token abc123...
    
    Response (Success - 200):
        {
            "user": {
                "id": 1,
                "email": "student@example.com",
                "role": "STUDENT",
                "department": 1,
                "department_name": "Computer Science",
                "is_approved": true,
                "is_active": true,
                "full_name": "John Doe",
                "created_at": "2026-01-01T00:00:00Z",
                "last_login": "2026-02-11T00:00:00Z"
            },
            "profile": {
                "user": {...},
                "user_email": "student@example.com",
                "full_name": "John Doe",
                "phone_number": "+1234567890",
                "date_of_birth": "2000-01-01",
                "gender": "MALE",
                "university_id": "STU001",
                "skills": "Python, Django, React",
                "document": "/media/uploads/students/2026/01/document.pdf",
                "created_at": "2026-01-01T00:00:00Z",
                "updated_at": "2026-02-11T00:00:00Z"
            }
        }
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Return current user profile with role-specific information
        
        Args:
            request: HTTP request with authentication token
            
        Returns:
            Response with user and profile data
        """
        try:
            user = request.user
            
            # Serialize user with profile
            serializer = UserProfileSerializer(user)
            
            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                {'error': 'An error occurred while fetching profile. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def patch(self, request):
        """
        Update current user profile
        
        PATCH /api/auth/profile/
        
        Permissions: Login required
        
        Supports partial updates of role-specific profile fields.
        """
        try:
            user = request.user
            
            # Determine which profile to update
            if user.role == 'STUDENT':
                profile = getattr(user, 'student_profile', None)
                serializer_class = StudentProfileSerializer
            elif user.role == 'COMPANY':
                profile = getattr(user, 'company_profile', None)
                serializer_class = CompanyProfileSerializer
            elif user.role == 'ADVISOR':
                profile = getattr(user, 'advisor_profile', None)
                serializer_class = AdvisorProfileSerializer
            elif user.role == 'DEPARTMENT_HEAD':
                profile = getattr(user, 'department_head_profile', None)
                serializer_class = DepartmentHeadProfileSerializer
            else:
                return Response(
                    {'error': f'Role {user.role} does not have an editable profile.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not profile:
                return Response(
                    {'error': 'Profile not found for this user.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Update the profile
            serializer = serializer_class(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                
                # Return updated combined profile
                return Response(
                    UserProfileSerializer(user).data,
                    status=status.HTTP_200_OK
                )
            
            return Response(
                {'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            return Response(
                {'error': f'An error occurred while updating profile: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PasswordChangeView(APIView):
    """
    Change user password
    
    POST /api/auth/change-password/
    
    Headers:
        Authorization: Token abc123...
    
    Request:
        {
            "old_password": "currentpass123",
            "new_password": "newpass123",
            "confirm_password": "newpass123"
        }
    
    Response (Success - 200):
        {
            "message": "Password changed successfully",
            "token": "new_token_key..."
        }
    
    Response (Error - 400):
        {
            "error": {
                "old_password": "Current password is incorrect."
            }
        }
    """
    permission_classes = [IsAuthenticated]
    serializer_class = PasswordChangeSerializer
    
    @transaction.atomic
    def post(self, request):
        """
        Change user password and create new token
        
        Args:
            request: HTTP request with old and new passwords
            
        Returns:
            Response with success message and new token
        """
        try:
            # Validate password change data
            serializer = self.serializer_class(
                data=request.data,
                context={'request': request}
            )
            
            if not serializer.is_valid():
                return Response(
                    {'error': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save new password
            serializer.save()
            
            # Delete old token and create new one for security
            request.user.auth_token.delete()
            token = Token.objects.create(user=request.user)
            
            return Response(
                {
                    'message': 'Password changed successfully. Please use your new password for future logins.',
                    'token': token.key
                },
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                {'error': 'An error occurred while changing password. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SystemStatusView(APIView):
    """
    Check system setup status
    
    GET /api/auth/system-status/
    
    No authentication required (for initial system setup verification)
    
    Response (Success - 200):
        {
            "system_ready": true,
            "admin_exists": true,
            "uil_exists": true,
            "admin_count": 1,
            "uil_count": 1,
            "total_users": 15,
            "setup_instructions": "System is ready for use"
        }
    
    Response (System Not Ready):
        {
            "system_ready": false,
            "admin_exists": false,
            "uil_exists": false,
            "admin_count": 0,
            "uil_count": 0,
            "total_users": 0,
            "setup_instructions": "Please create Admin account first using: python manage.py createsuperuser"
        }
    """
    permission_classes = [AllowAny]  # Public endpoint for setup verification
    
    def get(self, request):
        """
        Return system setup status
        
        Checks if:
        - Admin account exists
        - UIL account exists
        - System is ready for operation
        
        Returns:
            Response with system status information
        """
        try:
            # Check for Admin accounts
            admin_count = User.objects.filter(
                role='ADMIN',
                is_staff=True,
                is_superuser=True
            ).count()
            admin_exists = admin_count > 0
            
            # Check for UIL accounts
            uil_count = User.objects.filter(role='UIL').count()
            uil_exists = uil_count > 0
            
            # System is ready if both Admin and UIL exist
            system_ready = admin_exists and uil_exists
            
            # Total users count
            total_users = User.objects.count()
            
            # Generate setup instructions
            if not admin_exists and not uil_exists:
                setup_instructions = (
                    "Step 1: Create Admin account using: python manage.py createsuperuser\n"
                    "Step 2: Create UIL account using: python manage.py create_uil"
                )
            elif admin_exists and not uil_exists:
                setup_instructions = (
                    "Step 2: Create UIL account using: python manage.py create_uil\n"
                    "Admin account already exists."
                )
            elif not admin_exists and uil_exists:
                setup_instructions = (
                    "Step 1: Create Admin account using: python manage.py createsuperuser\n"
                    "UIL account already exists."
                )
            else:
                setup_instructions = "✅ System is fully configured and ready for use!"
            
            return Response(
                {
                    'system_ready': system_ready,
                    'admin_exists': admin_exists,
                    'uil_exists': uil_exists,
                    'admin_count': admin_count,
                    'uil_count': uil_count,
                    'total_users': total_users,
                    'setup_instructions': setup_instructions,
                    'next_steps': self._get_next_steps(system_ready)
                },
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                {
                    'error': 'An error occurred while checking system status.',
                    'details': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_next_steps(self, system_ready: bool) -> str:
        """Get next steps based on system status"""
        if system_ready:
            return (
                "System is ready! Next steps:\n"
                "1. Access Django Admin at /admin/\n"
                "2. UIL can start approving registrations\n"
                "3. Create departments if needed\n"
                "4. Users can start registering"
            )
        else:
            return (
                "Complete system setup first:\n"
                "1. Create Admin account\n"
                "2. Create UIL account\n"
                "3. Verify both accounts exist\n"
                "4. Start accepting user registrations"
            )


# ─── Phase 11: UIL Management Views ──────────────────────────────────────────

class UILUserListView(ListAPIView):
    """
    List all approved users — UIL only.
    GET /api/auth/users/?role=STUDENT&search=alice&ordering=-created_at
    """
    permission_classes = [IsAuthenticated, IsUIL | IsAdmin]
    serializer_class   = UserSerializer
    filter_backends    = [SearchFilter, OrderingFilter]
    search_fields      = ['email']
    ordering_fields    = ['created_at', 'email', 'role']
    ordering           = ['-created_at']

    def get_queryset(self):
        qs   = User.objects.filter(is_approved=True).exclude(role__in=['ADMIN', 'UIL'])
        role = self.request.query_params.get('role')
        if role:
            qs = qs.filter(role=role)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page     = self.paginate_queryset(queryset)
        users    = page if page is not None else queryset

        results = []
        for user in users:
            data = UserSerializer(user).data
            data['display_name'] = self._get_display_name(user)
            data['profile_info'] = self._get_profile_info(user)
            results.append(data)

        if page is not None:
            return self.get_paginated_response(results)
        return Response(results)

    @staticmethod
    def _get_display_name(user):
        try:
            if user.role == 'STUDENT':
                return user.student_profile.full_name
            elif user.role == 'COMPANY':
                return user.company_profile.company_name
            elif user.role == 'ADVISOR':
                return user.advisor_profile.full_name
            elif user.role == 'DEPARTMENT_HEAD':
                return user.department.head_name if user.department else user.email
        except Exception:
            pass
        return user.email

    @staticmethod
    def _get_profile_info(user):
        try:
            if user.role == 'STUDENT':
                p = user.student_profile
                return f"ID: {p.university_id} | {(p.skills or '')[:40] or '—'}"
            elif user.role == 'COMPANY':
                p = user.company_profile
                return f"{p.city or '—'} | Contact: {p.contact_person_name or '—'}"
            elif user.role == 'ADVISOR':
                p = user.advisor_profile
                dept = user.department.name if user.department else '—'
                return f"Staff ID: {p.staff_id} | Dept: {dept}"
            elif user.role == 'DEPARTMENT_HEAD':
                dept = user.department.name if user.department else '—'
                return f"Department: {dept}"
        except Exception:
            pass
        return ''


class UILSystemStatsView(APIView):
    """
    System-wide statistics for UIL system overview.
    GET /api/auth/system-stats/
    """
    permission_classes = [IsAuthenticated, IsUIL | IsAdmin]

    def get(self, request):
        try:
            from apps.internships.models  import Internship
            from apps.applications.models import Application
            from apps.advisors.models     import AdvisorAssignment
            from apps.reports.models      import MonthlyReport, FinalReport
            from apps.departments.models  import Department
            from apps.certificates.models import Certificate
            from apps.registrations.models import RegistrationRequest
            from django.utils             import timezone
            import datetime

            today     = timezone.now().date()
            month_ago = today - datetime.timedelta(days=30)

            approved = User.objects.filter(is_approved=True).exclude(role__in=['ADMIN', 'UIL'])

            users_by_role = {
                'students':         approved.filter(role='STUDENT').count(),
                'companies':        approved.filter(role='COMPANY').count(),
                'advisors':         approved.filter(role='ADVISOR').count(),
                'department_heads': approved.filter(role='DEPARTMENT_HEAD').count(),
            }
            users_by_role['total'] = sum(users_by_role.values())

            internships = {
                'open':  Internship.objects.filter(status='OPEN').count(),
                'filled':Internship.objects.filter(status='FILLED').count(),
                'closed':Internship.objects.filter(status='CLOSED').count(),
                'total': Internship.objects.count(),
            }

            applications = {
                'pending':  Application.objects.filter(status='PENDING').count(),
                'accepted': Application.objects.filter(status='ACCEPTED').count(),
                'rejected': Application.objects.filter(status='REJECTED').count(),
                'total':    Application.objects.count(),
            }

            reports = {
                'monthly_total':   MonthlyReport.objects.count(),
                'final_completed': FinalReport.objects.filter(status='COMPLETED').count(),
                'final_pending':   FinalReport.objects.exclude(status='COMPLETED').count(),
            }

            certificates = {
                'issued':    Certificate.objects.count(),
                'generated': Certificate.objects.filter(is_generated=True).count(),
            }

            recent_users = [
                {
                    'email':      u.email,
                    'role':       u.get_role_display(),
                    'created_at': u.created_at.strftime('%b %d, %Y'),
                    'department': u.department.name if u.department else '—',
                }
                for u in approved.order_by('-created_at')[:5]
            ]

            return Response({
                'users':                 users_by_role,
                'new_users_this_month':  approved.filter(created_at__date__gte=month_ago).count(),
                'internships':           internships,
                'active_internships':    AdvisorAssignment.objects.filter(is_active=True).count(),
                'applications':          applications,
                'reports':               reports,
                'certificates':          certificates,
                'total_departments':     Department.objects.count(),
                'pending_registrations': RegistrationRequest.objects.filter(status='PENDING').count(),
                'recent_users':          recent_users,
            })

        except Exception as e:
            return Response({'error': f'Failed to fetch system stats: {str(e)}'}, status=500)


# ── Password Reset (Forgot Password) ─────────────────────────────────────────

class ForgotPasswordView(APIView):
    """
    POST /api/auth/forgot-password/
    Public endpoint. Sends a reset link to the email if it exists.
    Always returns 200 so we don't reveal whether an email is registered.
    Body: { "email": "user@example.com" }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        User = get_user_model()
        try:
            user = User.objects.get(email=email, is_active=True)

            # Invalidate any previous unused tokens for this user
            PasswordResetToken.objects.filter(user=user, used=False).delete()

            # Create new token (valid for 1 hour)
            token = secrets.token_urlsafe(32)
            PasswordResetToken.objects.create(
                user=user,
                token=token,
                expires_at=timezone.now() + timedelta(hours=1),
            )

            # Build reset URL
            try:
                frontend_url = django_settings.CORS_ALLOWED_ORIGINS[0]
            except (AttributeError, IndexError):
                frontend_url = 'http://localhost:5173'
            reset_url = f'{frontend_url}/reset-password/{token}'

            # Send email
            try:
                send_mail(
                    subject='Reset your password — DMU Internship System',
                    message=(
                        f'Hello,\n\n'
                        f'You requested a password reset. Click the link below to set a new password:\n\n'
                        f'{reset_url}\n\n'
                        f'This link expires in 1 hour. If you did not request this, ignore this email.\n\n'
                        f'— DMU Internship System'
                    ),
                    from_email=django_settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
            except Exception:
                pass  # fail silently — don't reveal failure to client

        except User.DoesNotExist:
            pass  # Don't reveal that email doesn't exist

        # Always return the same response
        return Response({
            'message': 'If an account with that email exists, a reset link has been sent.'
        })


class SendTemporaryPasswordView(APIView):
    """
    POST /api/auth/send-temporary-password/
    Public endpoint. Generates and sends a temporary password to the user's email.
    The temporary password is valid for 24 hours and should be changed immediately.
    Body: { "email": "user@example.com" }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        User = get_user_model()
        try:
            user = User.objects.get(email=email, is_active=True)

            # Generate a secure temporary password (12 characters: letters + numbers)
            import string
            import random
            characters = string.ascii_letters + string.digits
            temp_password = ''.join(random.choice(characters) for _ in range(12))
            
            # Add special character for security
            temp_password = temp_password[:6] + '@' + temp_password[6:]

            # Set the temporary password
            user.set_password(temp_password)
            user.save()

            # Send email with temporary password
            try:
                send_mail(
                    subject='Your Temporary Password — DMU Internship System',
                    message=(
                        f'Hello {user.get_full_name()},\n\n'
                        f'You requested a temporary password for your account.\n\n'
                        f'Your temporary password is: {temp_password}\n\n'
                        f'IMPORTANT SECURITY INSTRUCTIONS:\n'
                        f'1. Use this password to log in immediately\n'
                        f'2. Change your password after logging in (Settings → Change Password)\n'
                        f'3. This password is valid for 24 hours\n'
                        f'4. Do not share this password with anyone\n\n'
                        f'If you did not request this, please contact support immediately.\n\n'
                        f'— DMU Internship System'
                    ),
                    from_email=django_settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except Exception as e:
                # Log the error but don't reveal it to the client
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to send temporary password email: {e}")
                pass

        except User.DoesNotExist:
            pass  # Don't reveal that email doesn't exist

        # Always return the same response
        return Response({
            'message': 'If an account with that email exists, a temporary password has been sent.'
        })


class ResetPasswordView(APIView):
    """
    POST /api/auth/reset-password/
    Public endpoint. Validates token and sets new password.
    Body: { "token": "...", "new_password": "...", "confirm_password": "..." }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        token_str     = request.data.get('token', '').strip()
        new_password  = request.data.get('new_password', '')
        confirm_password = request.data.get('confirm_password', '')

        if not token_str:
            return Response({'error': 'Token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not new_password:
            return Response({'error': 'New password is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if new_password != confirm_password:
            return Response({'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            reset_token = PasswordResetToken.objects.select_related('user').get(
                token=token_str,
                used=False,
            )
        except PasswordResetToken.DoesNotExist:
            return Response({'error': 'Invalid or expired reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        if reset_token.expires_at < timezone.now():
            reset_token.delete()
            return Response({'error': 'This reset link has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        # Set new password
        with transaction.atomic():
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            reset_token.used = True
            reset_token.save()
            # Invalidate all existing tokens for this user
            Token.objects.filter(user=user).delete()

        return Response({'message': 'Password reset successfully. You can now log in.'})


class ValidateResetTokenView(APIView):
    """
    GET /api/auth/reset-password/<token>/validate/
    Public. Used by frontend to check if a token is still valid before showing the form.
    """
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            reset_token = PasswordResetToken.objects.get(token=token, used=False)
            if reset_token.expires_at < timezone.now():
                reset_token.delete()
                return Response({'valid': False, 'error': 'This link has expired.'})
            return Response({'valid': True})
        except PasswordResetToken.DoesNotExist:
            return Response({'valid': False, 'error': 'Invalid or already used link.'})


# ── Admin User Management Views ──────────────────────────────────────────

class AdminUserListView(APIView):
    """
    List all users or create a new user (Admin only)
    GET /api/auth/admin/users/
    POST /api/auth/admin/users/
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        users = User.objects.all().order_by('-created_at')
        
        results = []
        for user in users:
            data = UserSerializer(user).data
            data['display_name'] = UILUserListView._get_display_name(user)
            data['profile_info'] = UILUserListView._get_profile_info(user)
            results.append(data)
            
        return Response(results)

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password')
        role = request.data.get('role', 'STUDENT')
        
        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if User.objects.filter(email=email).exists():
            return Response({'error': 'A user with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    email=email,
                    password=password,
                    role=role,
                    is_approved=True  # Admin created users are pre-approved
                )
                
                return Response(
                    {'message': f'User {email} created successfully.', 'user': UserSerializer(user).data},
                    status=status.HTTP_201_CREATED
                )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminUserDetailView(APIView):
    """
    Update or Delete a user (Admin only)
    PATCH /api/auth/admin/users/<id>/
    DELETE /api/auth/admin/users/<id>/
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            
            if user.role == 'ADMIN' and user.is_superuser and request.user != user:
                 return Response({'error': 'Cannot edit the superadmin.'}, status=status.HTTP_400_BAD_REQUEST)
                 
            # Only allow updating role, is_approved
            if 'role' in request.data:
                user.role = request.data['role']
            if 'is_approved' in request.data:
                user.is_approved = request.data['is_approved']
            if 'password' in request.data and request.data['password']:
                user.set_password(request.data['password'])
                
            user.save()
            return Response({'message': 'User updated successfully.'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            
            if user.role == 'ADMIN' and user.is_superuser:
                 return Response({'error': 'Cannot delete the superadmin.'}, status=status.HTTP_400_BAD_REQUEST)
                 
            user.delete()
            return Response({'message': 'User deleted successfully.'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)