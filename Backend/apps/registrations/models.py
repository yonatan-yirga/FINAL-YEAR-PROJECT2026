"""
Registration Request Models
Handles pending user registrations before UIL approval
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
from core.validators import validate_pdf_file
import secrets
import string

User = get_user_model()


def generate_temp_password(length=12):
    """Generate temporary password for approved users"""
    chars = string.ascii_letters + string.digits + '!@#$%^&*'
    return ''.join(secrets.choice(chars) for _ in range(length))


class RegistrationRequest(models.Model):
    """Model for handling user registration requests"""
    
    REQUEST_TYPE_CHOICES = [
        ('STUDENT', 'Student'),
        ('COMPANY', 'Company'),
        ('ADVISOR', 'Advisor'),
        ('DEPARTMENT', 'Department Head'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    GENDER_CHOICES = [
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    ]
    
    # Common fields
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPE_CHOICES, db_index=True)
    email = models.EmailField(max_length=255, db_index=True)
    department = models.ForeignKey(
        'departments.Department',
        on_delete=models.CASCADE,
        related_name='registration_requests',
        null=True,
        blank=True,
        help_text='Primary department (used for Students/Advisors)'
    )
    target_departments = models.ManyToManyField(
        'departments.Department',
        blank=True,
        related_name='multi_registration_requests',
        help_text='Multiple departments (used for Companies)'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    rejection_reason = models.TextField(null=True, blank=True)
    document = models.FileField(
        upload_to='uploads/registrations/%Y/%m/',
        validators=[validate_pdf_file],
        help_text='Required document (PDF, max 5MB)'
    )
    
    # Review tracking
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_registrations'
    )
    
    # Student-specific fields
    student_full_name = models.CharField(max_length=255, null=True, blank=True)
    student_phone = models.CharField(max_length=20, null=True, blank=True)
    student_dob = models.DateField(null=True, blank=True)
    student_gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    student_university_id = models.CharField(max_length=50, null=True, blank=True)
    student_skills = models.TextField(null=True, blank=True)
    
    # Company-specific fields
    company_name = models.CharField(max_length=255, null=True, blank=True)
    company_phone = models.CharField(max_length=20, null=True, blank=True)
    company_address = models.TextField(null=True, blank=True)
    company_city = models.CharField(max_length=100, null=True, blank=True)
    company_contact_person = models.CharField(max_length=255, null=True, blank=True)
    company_contact_title = models.CharField(max_length=100, null=True, blank=True)
    company_description = models.TextField(null=True, blank=True)
    
    # Advisor-specific fields
    advisor_full_name = models.CharField(max_length=255, null=True, blank=True)
    advisor_phone = models.CharField(max_length=20, null=True, blank=True)
    advisor_staff_id = models.CharField(max_length=50, null=True, blank=True)
    
    # Department-specific fields
    department_name = models.CharField(max_length=255, null=True, blank=True)
    department_head_name = models.CharField(max_length=255, null=True, blank=True)
    department_phone = models.CharField(max_length=20, null=True, blank=True)
    
    class Meta:
        db_table = 'registration_requests'
        verbose_name = 'Registration Request'
        verbose_name_plural = 'Registration Requests'
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['status']),
            models.Index(fields=['request_type']),
        ]
    
    def __str__(self):
        return f"{self.get_request_type_display()} - {self.email} ({self.status})"
    
    @transaction.atomic
    def approve(self, reviewed_by_user):
        """
        Approve registration and create User + Profile
        
        Args:
            reviewed_by_user: UIL user who approved the request
            
        Returns:
            tuple: (user, temp_password)
        """
        if self.status == 'APPROVED':
            raise ValueError('Registration already approved')
        
        # Generate temporary password
        temp_password = generate_temp_password()
        
        # Map request_type to User role
        role_mapping = {
            'STUDENT': 'STUDENT',
            'COMPANY': 'COMPANY',
            'ADVISOR': 'ADVISOR',
            'DEPARTMENT': 'DEPARTMENT_HEAD',  # Fix: DEPARTMENT -> DEPARTMENT_HEAD
        }
        user_role = role_mapping.get(self.request_type, self.request_type)
        
        # Create User account
        # For companies, use the first target department if available, else the primary field
        primary_dept = self.department
        if self.request_type == 'COMPANY' and self.target_departments.exists():
            primary_dept = self.target_departments.first()

        user = User.objects.create_user(
            email=self.email,
            password=temp_password,
            role=user_role,
            department=primary_dept,
            is_active=True,
            is_approved=True
        )
        
        # Create appropriate profile
        if self.request_type == 'STUDENT':
            from apps.accounts.models import StudentProfile
            StudentProfile.objects.create(
                user=user,
                full_name=self.student_full_name,
                phone_number=self.student_phone,
                date_of_birth=self.student_dob,
                gender=self.student_gender,
                university_id=self.student_university_id,
                skills=self.student_skills,
                document=self.document
            )
        
        elif self.request_type == 'COMPANY':
            from apps.accounts.models import CompanyProfile
            profile = CompanyProfile.objects.create(
                user=user,
                company_name=self.company_name,
                phone_number=self.company_phone,
                address=self.company_address,
                city=self.company_city,
                contact_person_name=self.company_contact_person,
                contact_person_title=self.company_contact_title,
                description=self.company_description,
                document=self.document
            )
            # Migrate target departments
            if self.target_departments.exists():
                profile.target_departments.set(self.target_departments.all())
        
        elif self.request_type == 'ADVISOR':
            from apps.accounts.models import AdvisorProfile
            AdvisorProfile.objects.create(
                user=user,
                full_name=self.advisor_full_name,
                phone_number=self.advisor_phone,
                staff_id=self.advisor_staff_id,
                document=self.document
            )
        
        elif self.request_type == 'DEPARTMENT':
            from apps.accounts.models import DepartmentHeadProfile
            DepartmentHeadProfile.objects.create(
                user=user,
                full_name=self.department_head_name,
                phone_number=self.department_phone,
                document=self.document
            )
        
        # Update registration status
        self.status = 'APPROVED'
        self.reviewed_at = timezone.now()
        self.reviewed_by = reviewed_by_user
        self.save()
        
        return user, temp_password
    
    def reject(self, reviewed_by_user, reason):
        """
        Reject registration with reason
        
        Args:
            reviewed_by_user: UIL user who rejected the request
            reason: Reason for rejection
        """
        if self.status != 'PENDING':
            raise ValueError('Can only reject pending registrations')
        
        self.status = 'REJECTED'
        self.rejection_reason = reason
        self.reviewed_at = timezone.now()
        self.reviewed_by = reviewed_by_user
        self.save()