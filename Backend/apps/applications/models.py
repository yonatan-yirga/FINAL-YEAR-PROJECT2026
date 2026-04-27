"""
Application Models
Student application system for internships
Students apply to internships, companies accept/reject
"""
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone


class Application(models.Model):
    """
    Student applications to internships
    One student can apply to one internship only once
    """
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('OFFERED', 'Offered'),
        ('ACCEPTED', 'Accepted (Placed)'),
        ('REJECTED', 'Rejected'),
    ]
    
    # Relationships
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_applications',
        limit_choices_to={'role': 'STUDENT'},
        help_text='Student who applied'
    )
    internship = models.ForeignKey(
        'internships.Internship',
        on_delete=models.CASCADE,
        related_name='applications',
        help_text='Internship being applied to'
    )
    
    # Application Content
    about_me = models.TextField(
        blank=True,
        null=True,
        help_text='Professional summary/bio for this specific application'
    )
    experience = models.TextField(
        blank=True,
        null=True,
        help_text='Past roles and work experience relevant to this internship'
    )
    education_level = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Current education level (e.g., Bachelor, Master)'
    )
    projects = models.TextField(
        blank=True,
        null=True,
        help_text='Previous projects or relevant work'
    )
    certificate = models.FileField(
        upload_to='uploads/applications/certificates/%Y/%m/',
        null=True,
        blank=True,
        help_text='Relevant certificate or supporting document (PDF/Image)'
    )
    cover_letter = models.TextField(
        blank=True,
        null=True,
        help_text='Optional additional cover letter from student'
    )
    
    # Status
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='PENDING',
        db_index=True,
        help_text='Current status of application'
    )
    
    # Review Information
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_applications',
        limit_choices_to={'role': 'COMPANY'},
        help_text='Company user who reviewed this application'
    )
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When the application was reviewed'
    )
    rejection_reason = models.TextField(
        null=True,
        blank=True,
        help_text='Reason for rejection (if rejected)'
    )
    
    # Timestamps
    applied_at = models.DateTimeField(
        auto_now_add=True,
        help_text='When student applied'
    )
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'applications'
        verbose_name = 'Application'
        verbose_name_plural = 'Applications'
        ordering = ['-applied_at']
        unique_together = [['student', 'internship']]
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['internship', 'status']),
            models.Index(fields=['status']),
            models.Index(fields=['-applied_at']),
        ]
    
    def __str__(self):
        return f"{self.get_student_name()} → {self.internship.title} ({self.status})"
    
    def clean(self):
        """Validate application before saving"""
        super().clean()

        # These checks only run when student is CREATING a new application
        if self.pk is None:

            # Validate student and internship are in same department
            if self.student.department != self.internship.department:
                raise ValidationError({
                    'internship': 'You can only apply to internships in your department.'
                })

            # Validate internship is accepting applications
            if not self.internship.is_accepting_applications:
                raise ValidationError({
                    'internship': 'This internship is not currently accepting applications.'
                })

            # Validate student doesn't already have an active internship
            existing_accepted = Application.objects.filter(
                student=self.student,
                status='ACCEPTED'
            ).exists()
            if existing_accepted:
                raise ValidationError({
                    'student': 'You already have an accepted application. Cannot apply to multiple internships.'
                })

    def save(self, *args, **kwargs):
        """Override save to run validation"""
        self.full_clean()
        super().save(*args, **kwargs)
    
    # Helper Methods
    
    def get_student_name(self):
        """Get student's full name safely"""
        try:
            return self.student.student_profile.full_name
        except Exception:
            return self.student.email
    
    def get_student_email(self):
        """Get student email"""
        return self.student.email
    
    def get_student_phone(self):
        """Get student phone"""
        try:
            return self.student.student_profile.phone_number
        except Exception:
            return None
    
    def get_student_skills(self):
        """Get student skills as string"""
        try:
            return self.student.student_profile.skills
        except Exception:
            return None
    
    def get_company_name(self):
        """Get company name"""
        try:
            return self.internship.company.company_profile.company_name
        except Exception:
            return self.internship.company.email
    
    # Status Change Methods
    
    def accept(self, company_user):
        """
        Accept this application
        
        Workflow:
        1. Update status to ACCEPTED
        2. Set reviewed_by and reviewed_at
        3. Send notification to student
        4. Send notification to department (for advisor assignment)
        5. Check if internship should be closed (max applicants reached)
        6. Auto-reject other pending applications if internship filled
        
        Args:
            company_user: User object (company) who is accepting
        
        Returns:
            bool: True if successful
        """
        from apps.notifications.services import NotificationService
        
        # Validate internship still has slots
        if self.internship.available_slots <= 0:
            raise ValidationError('No available slots remaining for this internship.')
        
        # Update application status to OFFERED
        self.status = 'OFFERED'
        self.reviewed_by = company_user
        self.reviewed_at = timezone.now()
        self.save()
        
        # Send notification to student about the offer
        NotificationService.create_notification(
            recipient=self.student,
            title='Internship Offer Received!',
            message=f'Great news! {self.get_company_name()} has offered you the {self.internship.title} position. Please review and accept the placement.',
            notification_type='OFFER_RECEIVED',
            link='/student/applications'
        )
        
        return True
    
    def confirm_placement(self):
        """
        Student action: Confirm and accept the internship offer
        Moves status from OFFERED to ACCEPTED
        """
        from apps.notifications.services import NotificationService

        if self.status != 'OFFERED':
            raise ValidationError('No offer found for this application.')

        # Double check student has no other accepted internship
        # (This is also checked in clean(), but good to have here)
        already_placed = Application.objects.filter(
            student=self.student,
            status='ACCEPTED'
        ).exists()
        if already_placed:
            raise ValidationError('You have already accepted another internship placement.')
        
        # Finalize the placement
        self.status = 'ACCEPTED'
        self.save()
        
        # Send notification to student
        NotificationService.notify_application_accepted(
            student=self.student,
            internship=self.internship
        )
        
        # Send notification to department head for advisor assignment
        if self.internship.department:
            from apps.accounts.models import User
            dept_head = User.objects.filter(
                department=self.internship.department,
                role='DEPARTMENT_HEAD',
                is_active=True,
            ).first()
            if dept_head:
                NotificationService.create_notification(
                    recipient=dept_head,
                    title='New Student Accepted — Advisor Assignment Needed',
                    message=f'{self.get_student_name()} has been accepted for {self.internship.title}. Please assign an advisor.',
                    notification_type='ADVISOR_ASSIGNMENT_NEEDED',
                    link='/department/students',
                )
        
        # Update internship slots and status if needed
        self.internship.increment_filled_slots()
        
        # If internship is now filled, auto-reject pending applications
        if self.internship.status == 'FILLED':
            self._reject_other_pending_applications()
        
        return True
    
    def reject(self, company_user, reason=None):
        """
        Reject this application
        
        Workflow:
        1. Update status to REJECTED
        2. Set reviewed_by, reviewed_at, and rejection_reason
        3. Send notification to student only
        
        Args:
            company_user: User object (company) who is rejecting
            reason: Optional rejection reason
        
        Returns:
            bool: True if successful
        """
        from apps.notifications.services import NotificationService
        
        # Update application status
        self.status = 'REJECTED'
        self.reviewed_by = company_user
        self.reviewed_at = timezone.now()
        self.rejection_reason = reason
        self.save()
        
        # Send notification to student only
        NotificationService.notify_application_rejected(
            student=self.student,
            internship=self.internship
        )
        
        return True
    
    def withdraw(self):
        """
        Withdraw application (student action)
        Only allowed if status is PENDING
        
        Returns:
            bool: True if successful
        """
        if self.status != 'PENDING':
            raise ValidationError('Can only withdraw pending applications.')
        
        # Delete the application
        self.delete()
        return True
    
    def _reject_other_pending_applications(self):
        """
        Auto-reject all other pending applications for this internship
        Called when internship reaches max applicants
        """
        from apps.notifications.services import NotificationService
        
        pending_applications = Application.objects.filter(
            internship=self.internship,
            status='PENDING'
        ).exclude(id=self.id)
        
        for app in pending_applications:
            app.status = 'REJECTED'
            app.rejection_reason = 'Position has been filled. Thank you for your interest.'
            app.save()
            
            # Notify each student
            NotificationService.notify_application_rejected(
                student=app.student,
                internship=app.internship
            )
    
    # Query Methods
    
    @classmethod
    def get_student_applications(cls, student_user, status=None):
        """Get all applications for a student, optionally filtered by status"""
        queryset = cls.objects.filter(student=student_user)
        if status:
            queryset = queryset.filter(status=status)
        return queryset.select_related('internship', 'internship__company')
    
    @classmethod
    def get_company_applications(cls, company_user, status=None, internship_id=None):
        """Get all applications for a company's internships"""
        queryset = cls.objects.filter(internship__company=company_user)
        if status:
            queryset = queryset.filter(status=status)
        if internship_id:
            queryset = queryset.filter(internship_id=internship_id)
        return queryset.select_related('student', 'student__student_profile', 'internship')
    
    @classmethod
    def has_pending_application(cls, student_user, internship):
        """Check if student has pending application for this internship"""
        return cls.objects.filter(
            student=student_user,
            internship=internship,
            status='PENDING'
        ).exists()
    
    @classmethod
    def has_accepted_application(cls, student_user):
        """Check if student has any accepted application"""
        return cls.objects.filter(
            student=student_user,
            status='ACCEPTED'
        ).exists()