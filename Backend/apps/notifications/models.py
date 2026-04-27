"""
Notification Models
Handles in-app notifications for all users
"""
from django.db import models
from django.conf import settings
from django.utils import timezone


class Notification(models.Model):
    """
    In-app notification model
    Stores notifications for users about various system events
    """
    
    NOTIFICATION_TYPES = [
        ('REGISTRATION_APPROVED', 'Registration Approved'),
        ('REGISTRATION_REJECTED', 'Registration Rejected'),
        ('APPLICATION_RECEIVED', 'Application Received'),
        ('APPLICATION_ACCEPTED', 'Application Accepted'),
        ('APPLICATION_REJECTED', 'Application Rejected'),
        ('ADVISOR_ASSIGNED', 'Advisor Assigned'),
        ('ADVISOR_ASSIGNMENT_NEEDED', 'Advisor Assignment Needed'),
        ('FEEDBACK_RECEIVED', 'Feedback Received'),
        ('REPORT_SUBMITTED', 'Monthly Report Submitted'),
        ('INTERNSHIP_COMPLETED', 'Internship Completed'),
        ('GENERAL', 'General Notification'),
    ]
    
    # Core fields
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        db_index=True,
        help_text='User who receives this notification'
    )
    title = models.CharField(
        max_length=200,
        help_text='Notification title/heading'
    )
    message = models.TextField(
        help_text='Notification message body'
    )
    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES,
        default='GENERAL',
        db_index=True,
        help_text='Type of notification'
    )
    
    # Optional link
    link = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text='Direct link to relevant page (e.g., /student/internships/123)'
    )
    
    # Related object tracking (optional)
    related_object_id = models.IntegerField(
        blank=True,
        null=True,
        help_text='ID of related object (internship, application, etc.)'
    )
    related_object_type = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text='Type of related object (e.g., internship, application)'
    )
    
    # Status
    is_read = models.BooleanField(
        default=False,
        db_index=True,
        help_text='Whether notification has been read'
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text='When notification was created'
    )
    read_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text='When notification was read'
    )
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['recipient', 'created_at']),
            models.Index(fields=['notification_type']),
        ]
    
    def __str__(self):
        return f"{self.get_notification_type_display()} for {self.recipient.email}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    def get_absolute_url(self):
        """Construct dashboard link based on notification type"""
        if self.link:
            return self.link
        
        # Default dashboard links based on user role
        role_dashboard_map = {
            'STUDENT': '/student/dashboard',
            'COMPANY': '/company/dashboard',
            'ADVISOR': '/advisor/dashboard',
            'DEPARTMENT_HEAD': '/department/dashboard',
            'UIL': '/uil/dashboard',
            'ADMIN': '/admin/dashboard',
        }
        
        return role_dashboard_map.get(self.recipient.role, '/')