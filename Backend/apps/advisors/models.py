"""
Advisor Models
Manages advisor assignments to students and feedback system
Complete advisor assignment system with notifications
"""
from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings
from django.utils import timezone
from django.db.models import Count, Q
from django.db.models.signals import post_save
from django.dispatch import receiver


class AdvisorAssignmentManager(models.Manager):
    """Custom manager for AdvisorAssignment with helper methods"""
    
    def get_current_workload(self, advisor):
        """
        Get current workload (active assignments) for an advisor
        
        Args:
            advisor: User object with role='ADVISOR'
        
        Returns:
            int: Number of active assignments
        """
        return self.filter(advisor=advisor, is_active=True).count()
    
    def get_unassigned_students(self, department):
        """
        Get students with accepted applications but no advisor assigned
        
        Args:
            department: Department object
        
        Returns:
            QuerySet: Accepted applications without advisor assignments
        """
        from apps.applications.models import Application
        
        # Get all accepted applications in this department
        accepted_applications = Application.objects.filter(
            status='ACCEPTED',
            internship__department=department
        ).select_related(
            'student',
            'student__student_profile',
            'internship',
            'internship__company',
            'internship__company__company_profile'
        )
        
        # Exclude applications that already have an advisor assigned
        assigned_application_ids = self.filter(
            is_active=True
        ).values_list('application_id', flat=True)
        
        return accepted_applications.exclude(
            id__in=assigned_application_ids
        )
    
    def get_advisor_students(self, advisor, active_only=True):
        """
        Get all students assigned to an advisor
        
        Args:
            advisor: User object with role='ADVISOR'
            active_only: Boolean, whether to return only active assignments
        
        Returns:
            QuerySet: AdvisorAssignment objects
        """
        queryset = self.filter(advisor=advisor)
        
        if active_only:
            queryset = queryset.filter(is_active=True)
        
        return queryset.select_related(
            'student',
            'student__student_profile',
            'internship',
            'internship__company',
            'internship__company__company_profile'
        ).prefetch_related('feedbacks')


class AdvisorAssignment(models.Model):
    """
    Links advisors to students for internship supervision
    Created after company accepts student's application
    """
    
    # Relationships
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_advisor_assignments',
        limit_choices_to={'role': 'STUDENT'},
        help_text='Student being supervised'
    )
    advisor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='supervised_students',
        limit_choices_to={'role': 'ADVISOR'},
        help_text='Advisor supervising the student'
    )
    internship = models.ForeignKey(
        'internships.Internship',
        on_delete=models.CASCADE,
        related_name='advisor_assignments',
        help_text='Internship being supervised'
    )
    application = models.OneToOneField(
        'applications.Application',
        on_delete=models.CASCADE,
        related_name='advisor_assignment',
        null=True,
        blank=True,
        help_text='Original application (optional link)'
    )
    
    # Assignment Details
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='made_advisor_assignments',
        help_text='User who made this assignment (UIL or Department Head)'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    
    # Status
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text='Whether this assignment is currently active'
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When the internship was completed'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Custom manager
    objects = AdvisorAssignmentManager()
    
    class Meta:
        db_table = 'advisor_assignments'
        verbose_name = 'Advisor Assignment'
        verbose_name_plural = 'Advisor Assignments'
        ordering = ['-assigned_at']
        indexes = [
            models.Index(fields=['student', 'is_active']),
            models.Index(fields=['advisor', 'is_active']),
            models.Index(fields=['internship']),
            models.Index(fields=['application']),
        ]
        # Ensure one advisor per application
        constraints = [
            models.UniqueConstraint(
                fields=['application'],
                condition=Q(is_active=True),
                name='unique_active_advisor_per_application'
            )
        ]
    
    def __str__(self):
        return f"{self.advisor.get_full_name()} → {self.student.get_full_name()}"
    
    def clean(self):
        """Validate model data before saving"""
        super().clean()
        
        # Validate all users are in same department
        if self.student and self.advisor:
            if self.student.department != self.advisor.department:
                raise ValidationError({
                    'advisor': 'Advisor must be in the same department as the student.'
                })
        
        # Validate internship department matches
        if self.student and self.internship:
            if self.student.department != self.internship.department:
                raise ValidationError({
                    'internship': 'Internship must be in the same department as the student.'
                })
        
        # Validate application is accepted (if provided)
        if self.application:
            if self.application.status != 'ACCEPTED':
                raise ValidationError({
                    'application': 'Can only assign advisor to accepted applications.'
                })
            
            # Validate application belongs to student and internship
            if self.application.student != self.student:
                raise ValidationError({
                    'application': 'Application must belong to the student.'
                })
            
            if self.application.internship != self.internship:
                raise ValidationError({
                    'application': 'Application must be for this internship.'
                })
    
    def save(self, *args, **kwargs):
        """Override save to run validation"""
        self.full_clean()
        super().save(*args, **kwargs)
    
    # Status Methods
    
    def complete(self):
        """Mark the internship as completed"""
        if not self.is_active:
            raise ValidationError('Assignment is already completed.')
        
        self.is_active = False
        self.completed_at = timezone.now()
        self.save()
        
        # Send completion notification
        from apps.notifications.services import NotificationService
        NotificationService.create_notification(
            recipient=self.student,
            title='Internship Completed',
            message=f'Your internship at {self.internship.get_company_name()} has been marked as completed.',
            notification_type='INTERNSHIP_COMPLETED',
            link='/student/dashboard'
        )
    
    # Query Methods
    
    def get_feedback_count(self):
        """Get count of feedback items"""
        return self.feedbacks.count()
    
    def get_monthly_reports_count(self):
        """Get count of monthly reports (if monthly_reports relation exists)"""
        if hasattr(self, 'monthly_reports'):
            return self.monthly_reports.count()
        return 0
    
    def get_duration_days(self):
        """Get duration of assignment in days"""
        if self.completed_at:
            return (self.completed_at.date() - self.assigned_at.date()).days
        return (timezone.now().date() - self.assigned_at.date()).days
    
    # Helper Methods
    
    def get_student_name(self):
        """Get student's full name"""
        return self.student.get_full_name()
    
    def get_advisor_name(self):
        """Get advisor's full name"""
        return self.advisor.get_full_name()
    
    def get_company_name(self):
        """Get company name"""
        return self.internship.get_company_name()
    
    def get_internship_title(self):
        """Get internship title"""
        return self.internship.title


class Feedback(models.Model):
    """
    Feedback from advisor to student during internship
    """
    
    # Relationships
    advisor_assignment = models.ForeignKey(
        AdvisorAssignment,
        on_delete=models.CASCADE,
        related_name='feedbacks',
        help_text='Advisor assignment this feedback belongs to'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='given_feedbacks',
        limit_choices_to={'role': 'ADVISOR'},
        help_text='Advisor who created this feedback'
    )
    
    # Feedback Content
    feedback_text = models.TextField(
        help_text='Feedback content from advisor to student'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'feedbacks'
        verbose_name = 'Feedback'
        verbose_name_plural = 'Feedbacks'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['advisor_assignment']),
            models.Index(fields=['created_at']),
            models.Index(fields=['created_by']),
        ]
    
    def __str__(self):
        return f"Feedback from {self.created_by.get_full_name()} to {self.advisor_assignment.student.get_full_name()}"
    
    def clean(self):
        """Validate model data before saving"""
        super().clean()
        
        # Validate feedback is not empty
        if not self.feedback_text or not self.feedback_text.strip():
            raise ValidationError({
                'feedback_text': 'Feedback cannot be empty.'
            })
        
        # Validate feedback text is reasonable length (between 10 and 5000 chars)
        if len(self.feedback_text.strip()) < 10:
            raise ValidationError({
                'feedback_text': 'Feedback must be at least 10 characters long.'
            })
        
        if len(self.feedback_text) > 5000:
            raise ValidationError({
                'feedback_text': 'Feedback cannot exceed 5000 characters.'
            })
        
        # Validate advisor owns this assignment
        if self.created_by and self.advisor_assignment:
            if self.created_by != self.advisor_assignment.advisor:
                raise ValidationError({
                    'created_by': 'Only the assigned advisor can create feedback for this assignment.'
                })
        
        # Validate assignment is active
        if self.advisor_assignment and not self.advisor_assignment.is_active:
            raise ValidationError({
                'advisor_assignment': 'Cannot add feedback to a completed assignment.'
            })
    
    def save(self, *args, **kwargs):
        """Override save to run validation"""
        self.full_clean()
        super().save(*args, **kwargs)
    
    # Helper Methods
    
    def get_student(self):
        """Get the student receiving this feedback"""
        return self.advisor_assignment.student
    
    def get_advisor(self):
        """Get the advisor who gave this feedback"""
        return self.created_by
    
    def get_feedback_preview(self, length=100):
        """Get truncated feedback text"""
        if len(self.feedback_text) <= length:
            return self.feedback_text
        return self.feedback_text[:length] + '...'


# SIGNALS

@receiver(post_save, sender=AdvisorAssignment)
def notify_advisor_assignment(sender, instance, created, **kwargs):
    """
    Send notifications when advisor is assigned
    Called automatically after AdvisorAssignment is created
    """
    if created and instance.is_active:
        from apps.notifications.services import NotificationService
        
        # Notify student
        NotificationService.create_notification(
            recipient=instance.student,
            title='Advisor Assigned',
            message=f'{instance.advisor.get_full_name()} has been assigned as your advisor for your internship at {instance.internship.get_company_name()}.',
            notification_type='ADVISOR_ASSIGNED',
            link='/student/active-internship',
            related_object_id=instance.id,
            related_object_type='advisor_assignment'
        )
        
        # Notify advisor
        NotificationService.create_notification(
            recipient=instance.advisor,
            title='New Student Assigned',
            message=f'You have been assigned to supervise {instance.student.get_full_name()} for their internship at {instance.internship.get_company_name()}.',
            notification_type='ADVISOR_ASSIGNED',
            link='/advisor/my-students',
            related_object_id=instance.id,
            related_object_type='advisor_assignment'
        )


@receiver(post_save, sender=Feedback)
def notify_feedback_sent(sender, instance, created, **kwargs):
    """
    Send notification when feedback is given
    Called automatically after Feedback is created
    """
    if created:
        from apps.notifications.services import NotificationService
        
        # Notify student
        NotificationService.create_notification(
            recipient=instance.get_student(),
            title='New Feedback Received',
            message=f'Your advisor {instance.get_advisor().get_full_name()} has provided new feedback on your internship.',
            notification_type='FEEDBACK_RECEIVED',
            link='/student/active-internship',
            related_object_id=instance.id,
            related_object_type='feedback'
        )