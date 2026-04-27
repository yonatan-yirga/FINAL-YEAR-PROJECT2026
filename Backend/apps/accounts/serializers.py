"""
Authentication Serializers for Internship Management System
Uses Token Authentication 
"""
from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from apps.accounts.models import StudentProfile, CompanyProfile, AdvisorProfile, DepartmentHeadProfile
from apps.departments.models import Department

User = get_user_model()


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department model (minimal for nested use)"""
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'head_name', 'email', 'phone_number']
        read_only_fields = ['id']


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.
    Returns user data with department information and student skills.
    """
    department_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    headline = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'role', 'department', 'department_name',
            'is_approved', 'is_active', 'full_name', 'created_at', 'last_login',
            'skills', 'avatar', 'headline',
        ]
        read_only_fields = ['id', 'created_at', 'last_login']

    def get_department_name(self, obj) -> str:
        """Get department name if user has a department"""
        return obj.department.name if obj.department else None

    def get_full_name(self, obj) -> str:
        """Get user's full name from profile"""
        return obj.get_full_name()

    def get_skills(self, obj) -> str:
        """
        Get student skills from StudentProfile.
        Returns empty string for non-student roles so frontend code
        that does `user.skills || ''` always gets a safe string value.
        """
        try:
            if obj.role == 'STUDENT':
                return obj.student_profile.skills or ''
        except Exception:
            pass
        return ''

    def get_avatar(self, obj) -> str:
        """Get student avatar URL from StudentProfile"""
        try:
            if obj.role == 'STUDENT' and obj.student_profile.avatar:
                return obj.student_profile.avatar.url
        except Exception:
            pass
        return None

    def get_headline(self, obj) -> str:
        """Get student headline from StudentProfile"""
        try:
            if obj.role == 'STUDENT':
                return obj.student_profile.headline or ''
        except Exception:
            pass
        return ''


class StudentProfileSerializer(serializers.ModelSerializer):
    """Serializer for Student Profile with nested user data"""
    user = UserSerializer(read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = [
            'user', 'user_email', 'full_name', 'phone_number',
            'date_of_birth', 'gender', 'university_id', 'skills',
            'headline', 'about', 'location', 'experience', 'education',
            'avatar', 'banner', 'document', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'user_email', 'university_id', 'created_at', 'updated_at']


class CompanyProfileSerializer(serializers.ModelSerializer):
    """Serializer for Company Profile with nested user data"""
    user = UserSerializer(read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = CompanyProfile
        fields = [
            'user', 'user_email', 'company_name', 'phone_number',
            'address', 'city', 'contact_person_name', 'contact_person_title',
            'description', 'document', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'user_email', 'created_at', 'updated_at']


class AdvisorProfileSerializer(serializers.ModelSerializer):
    """Serializer for Advisor Profile with nested user data"""
    user = UserSerializer(read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = AdvisorProfile
        fields = [
            'user', 'user_email', 'full_name', 'phone_number',
            'staff_id', 'document', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'user_email', 'created_at', 'updated_at']


class DepartmentHeadProfileSerializer(serializers.ModelSerializer):
    """Serializer for Department Head Profile with nested user data"""
    user = UserSerializer(read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    department_name = serializers.SerializerMethodField()
    
    class Meta:
        model = DepartmentHeadProfile
        fields = [
            'user', 'user_email', 'department_name', 'document',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'user_email', 'department_name', 'created_at', 'updated_at']
    
    def get_department_name(self, obj) -> str:
        """Get department name from user's department"""
        return obj.user.department.name if obj.user.department else None


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    Validates credentials and checks approval status
    """
    email = serializers.EmailField(
        required=True,
        error_messages={
            'required': 'Email address is required.',
            'invalid': 'Enter a valid email address.'
        }
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        error_messages={
            'required': 'Password is required.'
        }
    )
    
    def validate(self, attrs):
        """
        Validate user credentials and status
        """
        email = attrs.get('email')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError(
                'Both email and password are required.',
                code='required'
            )
        
        user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password
        )
        
        if not user:
            raise serializers.ValidationError(
                'Invalid email or password. Please check your credentials and try again.',
                code='invalid_credentials'
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                'Your account is inactive. Please contact the administrator.',
                code='inactive_account'
            )
        
        if user.role not in ['ADMIN', 'UIL'] and not user.is_approved:
            raise serializers.ValidationError(
                'Your account is pending approval. Please wait for UIL to review your registration.',
                code='pending_approval'
            )
        
        attrs['user'] = user
        return attrs


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for changing user password
    Validates old password and ensures new passwords match
    """
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        error_messages={
            'required': 'Current password is required.'
        }
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        min_length=8,
        error_messages={
            'required': 'New password is required.',
            'min_length': 'New password must be at least 8 characters long.'
        }
    )
    confirm_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        error_messages={
            'required': 'Password confirmation is required.'
        }
    )
    
    def validate_old_password(self, value):
        """Validate that old password is correct"""
        user = self.context.get('request').user
        
        if not user.check_password(value):
            raise serializers.ValidationError(
                'Current password is incorrect. Please try again.',
                code='incorrect_password'
            )
        
        return value
    
    def validate(self, attrs):
        """Validate that new passwords match and meet requirements"""
        new_password = attrs.get('new_password')
        confirm_password = attrs.get('confirm_password')
        
        if new_password != confirm_password:
            raise serializers.ValidationError(
                {'confirm_password': 'New passwords do not match. Please ensure both passwords are identical.'},
                code='password_mismatch'
            )
        
        old_password = attrs.get('old_password')
        if new_password == old_password:
            raise serializers.ValidationError(
                {'new_password': 'New password must be different from your current password.'},
                code='password_unchanged'
            )
        
        user = self.context.get('request').user
        try:
            validate_password(new_password, user=user)
        except DjangoValidationError as e:
            raise serializers.ValidationError(
                {'new_password': list(e.messages)},
                code='password_validation_failed'
            )
        
        return attrs
    
    def save(self, **kwargs):
        """Save the new password"""
        user = self.context.get('request').user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class UserProfileSerializer(serializers.Serializer):
    """
    Combined serializer for user profile
    Returns user data with role-specific profile information
    """
    user = UserSerializer(read_only=True)
    profile = serializers.SerializerMethodField()
    
    def get_profile(self, obj):
        """Get role-specific profile data"""
        user = obj
        
        try:
            if user.role == 'STUDENT':
                profile = StudentProfile.objects.get(user=user)
                return StudentProfileSerializer(profile).data
            
            elif user.role == 'COMPANY':
                profile = CompanyProfile.objects.get(user=user)
                return CompanyProfileSerializer(profile).data
            
            elif user.role == 'ADVISOR':
                profile = AdvisorProfile.objects.get(user=user)
                return AdvisorProfileSerializer(profile).data
            
            elif user.role == 'DEPARTMENT_HEAD':
                profile = DepartmentHeadProfile.objects.get(user=user)
                return DepartmentHeadProfileSerializer(profile).data
            
            else:
                # Admin and UIL don't have additional profiles
                return None
        
        except (StudentProfile.DoesNotExist, CompanyProfile.DoesNotExist,
                AdvisorProfile.DoesNotExist, DepartmentHeadProfile.DoesNotExist):
            return None