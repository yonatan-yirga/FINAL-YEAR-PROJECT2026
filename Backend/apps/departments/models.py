"""
Department Model 
"""

from django.db import models
from django.core.validators import RegexValidator


class DepartmentManager(models.Manager):
    """
    Custom manager for Department model
    Provides helper method to filter departments by user access
    """
    
    def for_user(self, user):
        """
        Get departments user can access
        
        Args:
            user: User object
        
        Returns:
            QuerySet of departments user can access
        
        Usage:
            departments = Department.objects.for_user(request.user)
        """
        # UIL and Admin can see all departments
        if user.is_staff or user.role == 'UIL':
            return self.all()
        
        # Others can only see their own department
        if user.department:
            return self.filter(id=user.department.id)
        
        # No department = no access
        return self.none()


# EXISTING Department model - ADD THIS LINE:
# objects = DepartmentManager()

# Example of how the updated Department model should look:

from django.conf import settings

class Department(models.Model):
    """Department model for organizing users and internships"""
    
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    
    name = models.CharField(max_length=255, unique=True, db_index=True)
    head_name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, unique=True)
    phone_number = models.CharField(validators=[phone_regex], max_length=17)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = DepartmentManager()  # Custom manager
    
    class Meta:
        db_table = 'departments'
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        return self.name
    
    def get_user_count(self):
        """Return the total number of users in this department"""
        return self.users.count()
    
    def get_student_count(self):
        """Return the number of students in this department"""
        return self.users.filter(role='STUDENT').count()
    
    def get_advisor_count(self):
        """Return the number of advisors in this department"""
        return self.users.filter(role='ADVISOR').count()
    
    def get_company_count(self):
        """Return the number of companies linked to this department"""
        return self.users.filter(role='COMPANY').count()

class DepartmentCycle(models.Model):
    """
    Bonus Feature: Manages internship seasons/cycles for a department.
    Allows opening/closing the system for new applications.
    """
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='cycles')
    year = models.IntegerField(help_text="e.g., 2026")
    semester = models.IntegerField(choices=[(1, 'Semester 1'), (2, 'Semester 2')], default=1)
    is_active = models.BooleanField(default=True, help_text="Is this the current active cycle?")
    start_date = models.DateField()
    end_date = models.DateField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'department_cycles'
        unique_together = [['department', 'year', 'semester']]

    def __str__(self):
        return f"{self.department.name} - {self.year} S{self.semester}"

class Escalation(models.Model):
    """
    Authority Intervention Model:
    Tracks formal issues flagged to the Department Head for resolution.
    """
    ISSUE_TYPES = [
        ('FAILING_STUDENT', 'Student Performance Risk'),
        ('INACTIVE_ADVISOR', 'Advisor Inactivity'),
        ('COMPANY_ISSUE', 'Company Policy Violation'),
        ('PLACEMENT_CONFLICT', 'Placement Conflict'),
        ('OTHER', 'Other Strategic Issue'),
    ]
    
    STATUS_CHOICES = [
        ('OPEN', 'Open (Awaiting Resolution)'),
        ('RESOLVED', 'Resolved'),
        ('ESCALATED_TO_UIL', 'Escalated to UIL'),
    ]
    
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='escalations')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_escalations', null=True, blank=True)
    advisor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='advisor_escalations', null=True, blank=True)
    company = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='company_escalations', null=True, blank=True)
    
    issue_type = models.CharField(max_length=50, choices=ISSUE_TYPES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    
    resolution_notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_escalations')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'escalations'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.status}] {self.title}"