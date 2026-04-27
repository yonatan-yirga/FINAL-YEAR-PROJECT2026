"""
User and Profile Models
StudentProfile with computed properties
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.conf import settings
from core.validators import validate_pdf_file


class UserManager(BaseUserManager):
    """Custom user manager where email is the unique identifier"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user with the given email and password"""
        if not email:
            raise ValueError('The Email field must be set')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser with the given email and password"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_approved', True)
        extra_fields.setdefault('role', 'ADMIN')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model with email as the unique identifier"""
    
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('UIL', 'UIL'),
        ('DEPARTMENT_HEAD', 'Department Head'),
        ('ADVISOR', 'Advisor'),
        ('STUDENT', 'Student'),
        ('COMPANY', 'Company'),
    ]
    
    # Basic fields
    email = models.EmailField(unique=True, max_length=255, db_index=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, db_index=True)
    
    # Permissions
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False, help_text='Approved by UIL')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(blank=True, null=True)
    
    # Department (null for Admin and UIL)
    department = models.ForeignKey(
        'departments.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        help_text='Department (null for Admin and UIL roles)'
    )
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email'],       name='users_email_4b85f2_idx'),
            models.Index(fields=['role'],        name='users_role_0ace22_idx'),
            models.Index(fields=['is_approved'], name='users_is_appr_73f710_idx'),
        ]
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
    
    def get_full_name(self):
        """Return the user's profile full name if available"""
        try:
            if self.role == 'STUDENT':
                return self.student_profile.full_name
            elif self.role == 'COMPANY':
                return self.company_profile.company_name
            elif self.role == 'ADVISOR':
                return self.advisor_profile.full_name
            elif self.role == 'DEPARTMENT_HEAD':
                if hasattr(self, 'department_head_profile') and self.department_head_profile.full_name:
                    return self.department_head_profile.full_name
                return self.department.head_name if self.department else self.email
            else:
                return self.email
        except Exception:
            return self.email
    
    def get_short_name(self):
        """Return a short name for the user"""
        return self.get_full_name().split()[0] if self.get_full_name() else self.email


class StudentProfile(models.Model):
    """
    Profile for Student users
    
    PHASE 3.3 UPDATE (SOLUTION A):
    Uses @property methods instead of stored fields to avoid data sync issues
    """
    
    GENDER_CHOICES = [
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    ]
    
    INTERNSHIP_STATUS_CHOICES = [
        ('NOT_APPLIED', 'Not Applied'),
        ('APPLIED', 'Applied'),
        ('ACTIVE', 'Active Internship'),
        ('COMPLETED', 'Completed'),
    ]
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='student_profile',
        primary_key=True
    )
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    university_id = models.CharField(max_length=50, unique=True, db_index=True)
    skills = models.TextField(
        help_text='Comma-separated skills (used for internship recommendations)'
    )
    headline = models.CharField(
        max_length=255, 
        blank=True, 
        help_text='Professional headline (e.g., Software Engineering Student)'
    )
    about = models.TextField(
        blank=True, 
        help_text='Professional summary/bio'
    )
    location = models.CharField(
        max_length=100, 
        blank=True, 
        help_text='City, Country'
    )
    experience = models.TextField(
        blank=True,
        help_text='Past roles, projects, or work experience'
    )
    education = models.TextField(
        blank=True,
        help_text='University, degree, and graduation year'
    )
    avatar = models.ImageField(
        upload_to='uploads/avatars/%Y/%m/',
        null=True,
        blank=True,
        help_text='Profile photo (JPG/PNG)'
    )
    banner = models.ImageField(
        upload_to='uploads/banners/%Y/%m/',
        null=True,
        blank=True,
        help_text='Profile cover banner (JPG/PNG)'
    )
    document = models.FileField(
        upload_to='uploads/students/%Y/%m/',
        validators=[validate_pdf_file],
        help_text='University acceptance letter or student ID card (PDF, max 5MB)'
    )
    
    # DEPARTMENT HEAD OVERSIGHT
    is_eligible = models.BooleanField(
        default=False,
        help_text='Validated by Department Head for the current internship cycle'
    )
    year_of_study = models.IntegerField(
        default=4,
        help_text='Current year of study (e.g. 4 for final year, 5 for Architecture/Medicine)'
    )
    eligibility_confirmed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'student_profiles'
        verbose_name = 'Student Profile'
        verbose_name_plural = 'Student Profiles'
        ordering = ['full_name']
        indexes = [
            models.Index(fields=['university_id'], name='student_pro_univers_262da4_idx'),
        ]
    
    def __str__(self):
        return f"{self.full_name} ({self.university_id})"
    
    def get_skills_list(self):
        """Return skills as a list"""
        return [skill.strip() for skill in self.skills.split(',') if skill.strip()]
    
    # PHASE 3.3: COMPUTED PROPERTIES
    
    @property
    def advisor(self):
        """Get current advisor from active AdvisorAssignment"""
        try:
            assignment = self.user.student_advisor_assignments.filter(
                is_active=True
            ).select_related('advisor').first()
            return assignment.advisor if assignment else None
        except Exception:
            return None
    
    @property
    def internship_status(self):
        """Calculate current internship status dynamically"""
        try:
            if self.user.student_advisor_assignments.filter(is_active=True).exists():
                return 'ACTIVE'
            if self.user.student_advisor_assignments.filter(is_active=False).exists():
                return 'COMPLETED'
            if self.user.student_applications.filter(status='PENDING').exists():
                return 'APPLIED'
            return 'NOT_APPLIED'
        except Exception:
            return 'NOT_APPLIED'
    
    @property
    def completion_date(self):
        """Get completion date from most recent completed assignment"""
        try:
            assignment = self.user.student_advisor_assignments.filter(
                is_active=False,
                completed_at__isnull=False
            ).order_by('-completed_at').first()
            return assignment.completed_at if assignment else None
        except Exception:
            return None
    
    def get_active_assignment(self):
        """Get the active AdvisorAssignment"""
        try:
            return self.user.student_advisor_assignments.filter(
                is_active=True
            ).select_related('advisor', 'internship__company').first()
        except Exception:
            return None
    
    def mark_as_completed(self):
        """Mark student's internship as completed"""
        try:
            assignment = self.get_active_assignment()
            if assignment:
                assignment.complete()
                return True
            return False
        except Exception:
            return False
    
    def has_active_internship(self):
        """Check if student has an active internship"""
        return self.internship_status == 'ACTIVE'
    
    def has_completed_internship(self):
        """Check if student has completed an internship"""
        return self.internship_status == 'COMPLETED'


class CompanyProfile(models.Model):
    """Profile for Company users"""
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='company_profile',
        primary_key=True
    )
    company_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    address = models.TextField()
    city = models.CharField(max_length=100)
    contact_person_name = models.CharField(max_length=255)
    contact_person_title = models.CharField(max_length=100)
    description = models.TextField(help_text='Short company description')
    document = models.FileField(
        upload_to='uploads/companies/%Y/%m/',
        validators=[validate_pdf_file],
        help_text='Company commercial license or official letter (PDF, max 5MB)'
    )
    
    # DEPARTMENT HEAD OVERSIGHT
    is_blacklisted = models.BooleanField(
        default=False,
        help_text='If true, this company is blocked from further internships in specific departments'
    )
    blacklist_reason = models.TextField(blank=True, null=True)
    target_departments = models.ManyToManyField(
        'departments.Department',
        blank=True,
        related_name='company_profiles',
        help_text='Departments this company recruits from'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'company_profiles'
        verbose_name = 'Company Profile'
        verbose_name_plural = 'Company Profiles'
        ordering = ['company_name']
    
    def __str__(self):
        return self.company_name


class AdvisorProfile(models.Model):
    """Profile for Advisor users"""
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='advisor_profile',
        primary_key=True
    )
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    staff_id = models.CharField(max_length=50, unique=True, db_index=True)
    document = models.FileField(
        upload_to='uploads/advisors/%Y/%m/',
        validators=[validate_pdf_file],
        help_text='University staff ID card or appointment letter (PDF, max 5MB)'
    )
    
    # DEPARTMENT HEAD OVERSIGHT
    max_students = models.IntegerField(
        default=15,
        help_text='Maximum number of students this advisor is allowed to supervise'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'advisor_profiles'
        verbose_name = 'Advisor Profile'
        verbose_name_plural = 'Advisor Profiles'
        ordering = ['full_name']
    
    def __str__(self):
        return f"{self.full_name} ({self.staff_id})"


class DepartmentHeadProfile(models.Model):
    """Profile for Department Head users"""
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='department_head_profile',
        primary_key=True
    )
    full_name = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    document = models.FileField(
        upload_to='uploads/departments/%Y/%m/',
        validators=[validate_pdf_file],
        help_text='Official department approval letter (PDF, max 5MB)'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'department_head_profiles'
        verbose_name = 'Department Head Profile'
        verbose_name_plural = 'Department Head Profiles'
    
    def __str__(self):
        return f"Department Head Profile for {self.user.email}"
        

class PasswordResetToken(models.Model):
    """
    Single-use token for password reset emails.
    Created by ForgotPasswordView, consumed by ResetPasswordView.
    """
    user       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens',
    )
    token      = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used       = models.BooleanField(default=False)

    class Meta:
        db_table = 'password_reset_tokens'

    def __str__(self):
        return f'PasswordResetToken for {self.user.email} (used={self.used})'