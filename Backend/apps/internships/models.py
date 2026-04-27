"""
Internship Models
Manages internship postings by companies
"""
from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from django.utils import timezone
from datetime import date


class Internship(models.Model):
    """
    Internship positions posted by companies
    Students can search, view, and apply to these internships
    """
    
    STATUS_CHOICES = [
        ('OPEN', 'Open for Applications'),
        ('CLOSED', 'Closed'),
        ('FILLED', 'All Positions Filled'),
    ]
    
    # Relationships
    company = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posted_internships',
        limit_choices_to={'role': 'COMPANY'},
        help_text='Company posting this internship'
    )
    department = models.ForeignKey(
        'departments.Department',
        on_delete=models.CASCADE,
        related_name='internships',
        help_text='Department this internship belongs to (inherited from company)'
    )
    
    # Basic Information
    title = models.CharField(
        max_length=200,
        help_text='Job title/position name'
    )
    description = models.TextField(
        help_text='Detailed description of the internship role and responsibilities'
    )
    required_skills = models.TextField(
        help_text='Comma-separated skills required (used for recommendation engine)'
    )
    location = models.CharField(
        max_length=200,
        help_text='City or address where internship takes place'
    )
    
    # Duration
    duration_months = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        help_text='Internship duration in months (1-12)'
    )
    start_date = models.DateField(
        help_text='Internship start date'
    )
    end_date = models.DateField(
        null=True,
        blank=True,
        help_text='Internship end date (calculated or manual)'
    )
    
    # Application Management
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text='Whether this internship is currently visible'
    )
    max_applicants = models.IntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(50)],
        help_text='Maximum number of students that can be accepted'
    )
    application_deadline = models.DateField(
        null=True,
        blank=True,
        help_text='Last date to accept applications (optional)'
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='OPEN',
        db_index=True,
        help_text='Current status of internship posting'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'internships'
        verbose_name = 'Internship'
        verbose_name_plural = 'Internships'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['company', 'status']),
            models.Index(fields=['department', 'status']),
            models.Index(fields=['status', 'is_active']),
            models.Index(fields=['start_date']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.get_company_name()}"
    
    def clean(self):
        """Validate model data before saving"""
        super().clean()

        # Fetch the original values from the database when editing (pk exists).
        # This lets us skip date-in-the-past checks when the date was not changed —
        # otherwise any edit to an existing internship (e.g. changing description)
        # would be rejected because its start_date or deadline is now in the past.
        original = None
        if self.pk is not None:
            try:
                original = Internship.objects.get(pk=self.pk)
            except Internship.DoesNotExist:
                pass

        # Validate start_date is not in the past.
        # On creation (pk is None): always check.
        # On edit: only check if start_date actually changed.
        if self.start_date:
            start_date_changed = (original is None) or (self.start_date != original.start_date)
            if start_date_changed and self.start_date < date.today():
                raise ValidationError({
                    'start_date': 'Start date cannot be in the past.'
                })

        # Validate end_date is after start_date (if provided) — always enforce.
        if self.start_date and self.end_date:
            if self.end_date <= self.start_date:
                raise ValidationError({
                    'end_date': 'End date must be after start date.'
                })

        # Validate department matches company's department
        if self.company and self.department:
            if self.company.department != self.department:
                raise ValidationError({
                    'department': 'Department must match company\'s department.'
                })

        # Validate required_skills has at least 2 skills
        if self.required_skills:
            skills_list = [s.strip() for s in self.required_skills.split(',') if s.strip()]
            if len(skills_list) < 2:
                raise ValidationError({
                    'required_skills': 'At least 2 skills are required (comma-separated).'
                })

        # Validate application_deadline is not in the past.
        # On creation: always check.
        # On edit: only check if deadline actually changed.
        if self.application_deadline:
            deadline_changed = (original is None) or (self.application_deadline != original.application_deadline)
            if deadline_changed and self.application_deadline < date.today():
                raise ValidationError({
                    'application_deadline': 'Application deadline cannot be in the past.'
                })
    
    def save(self, *args, **kwargs):
        """Override save to run validation"""
        self.full_clean()
        super().save(*args, **kwargs)
    
    # Properties
    
    @property
    def is_deadline_passed(self):
        """Check if application deadline has passed"""
        if self.application_deadline:
            return date.today() > self.application_deadline
        return False
    
    @property
    def available_slots(self):
        """Calculate available slots for this internship"""
        accepted_count = self.applications.filter(status='ACCEPTED').count()
        remaining = self.max_applicants - accepted_count
        return max(0, remaining)  # Never return negative
    
    @property
    def is_accepting_applications(self):
        """Check if internship is currently accepting applications"""
        if not self.is_active:
            return False
        if self.status != 'OPEN':
            return False
        if self.is_deadline_passed:
            return False
        if self.available_slots <= 0:
            return False
        return True
    
    # Methods
    
    def get_company_name(self):
        """Get company name safely"""
        try:
            return self.company.company_profile.company_name
        except Exception:
            return self.company.email
    
    def get_skills_list(self):
        """Return required skills as a list"""
        return [skill.strip() for skill in self.required_skills.split(',') if skill.strip()]
    
    def close(self):
        """Close the internship (no more applications)"""
        self.status = 'CLOSED'
        self.save()
    
    def reopen(self):
        """Reopen the internship for applications"""
        # Only reopen if there are available slots
        if self.available_slots > 0:
            self.status = 'OPEN'
            self.save()
        else:
            raise ValidationError('Cannot reopen internship with no available slots.')
    
    def increment_filled_slots(self):
        """
        Called when an application is accepted
        Updates status to FILLED if all slots are taken
        """
        if self.available_slots == 0:
            self.status = 'FILLED'
            self.save()
    
    def get_application_count(self):
        """Get total number of applications"""
        return self.applications.count()
    
    def get_accepted_count(self):
        """Get number of accepted applications"""
        return self.applications.filter(status='ACCEPTED').count()
    
    def get_pending_count(self):
        """Get number of pending applications"""
        return self.applications.filter(status='PENDING').count()
    
    def can_apply(self, student_user):
        """
        Check if a student can apply to this internship
        
        Args:
            student_user: User object with role=STUDENT
        
        Returns:
            tuple: (can_apply: bool, reason: str)
        """
        # Check if accepting applications
        if not self.is_accepting_applications:
            return (False, 'This internship is not currently accepting applications.')
        
        # Check department match
        if student_user.department != self.department:
            return (False, 'You can only apply to internships in your department.')
        
        # Check if already applied
        existing_application = self.applications.filter(student=student_user).exists()
        if existing_application:
            return (False, 'You have already applied to this internship.')
        
        # Check if student already has an active internship
        active_application = student_user.student_applications.filter(status='ACCEPTED').exists()
        if active_application:
            return (False, 'You already have an active internship.')
        
        return (True, 'You can apply to this internship.')