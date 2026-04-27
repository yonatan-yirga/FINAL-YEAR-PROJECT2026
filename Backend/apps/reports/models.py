"""
Report Models
Manages monthly and final internship reports
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.conf import settings
from django.utils import timezone
from core.validators import validate_pdf_file


class MonthlyReport(models.Model):
    """
    Monthly progress reports submitted by company
    Tracks student performance throughout the internship
    """
    
    PERFORMANCE_CHOICES = [
        ('EXCELLENT', 'Excellent'),
        ('VERY_GOOD', 'Very Good'),
        ('GOOD', 'Good'),
        ('NEEDS_IMPROVEMENT', 'Needs Improvement'),
    ]
    
    # Relationships
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_monthly_reports',
        limit_choices_to={'role': 'STUDENT'},
        help_text='Student this report is about'
    )
    company = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='submitted_monthly_reports',
        limit_choices_to={'role': 'COMPANY'},
        help_text='Company submitting the report'
    )
    advisor_assignment = models.ForeignKey(
        'advisors.AdvisorAssignment',
        on_delete=models.CASCADE,
        related_name='monthly_reports',
        help_text='Advisor assignment this report belongs to'
    )
    
    # Report Details
    report_month = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        help_text='Month number (1 = first month, 2 = second month, etc.)'
    )
    attendance_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text='Attendance percentage (0-100)'
    )
    tasks_completed = models.TextField(
        help_text='Description of tasks completed during this month'
    )
    performance_rating = models.CharField(
        max_length=20,
        choices=PERFORMANCE_CHOICES,
        help_text='Overall performance rating for the month'
    )
    
    # Scoring Breakdown (out of 10 each, total 40)
    task_completion_score = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)],
        help_text='Task Completion score (0-10)'
    )
    skill_development_score = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)],
        help_text='Skill Development score (0-10)'
    )
    problem_solving_score = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)],
        help_text='Problem Solving score (0-10)'
    )
    professionalism_score = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)],
        help_text='Professionalism score (0-10)'
    )
    comments = models.TextField(
        help_text='Additional comments and feedback from company'
    )
    
    # Submission Details
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='submitted_reports',
        help_text='Company user who submitted this report'
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    # PDF File
    pdf_file = models.FileField(
        upload_to='reports/monthly/%Y/%m/',
        validators=[validate_pdf_file],
        null=True,
        blank=True,
        help_text='Auto-generated PDF report'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'monthly_reports'
        verbose_name = 'Monthly Report'
        verbose_name_plural = 'Monthly Reports'
        ordering = ['-submitted_at']
        unique_together = [['student', 'advisor_assignment', 'report_month']]  # One report per month per student
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['advisor_assignment']),
            models.Index(fields=['submitted_at']),
        ]
    
    def __str__(self):
        return f"Month {self.report_month} - {self.student.get_full_name()} ({self.get_performance_rating_display()})"
    
    def clean(self):
        """Validate model data before saving"""
        super().clean()
        
        # Validate company owns the internship
        if self.company and self.advisor_assignment:
            if self.company != self.advisor_assignment.internship.company:
                raise ValidationError({
                    'company': 'Only the internship company can submit reports.'
                })
        
        # Validate student matches assignment
        if self.student and self.advisor_assignment:
            if self.student != self.advisor_assignment.student:
                raise ValidationError({
                    'student': 'Student must match the advisor assignment.'
                })
    
    def save(self, *args, **kwargs):
        """Override save to run validation"""
        self.full_clean()
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Trigger PDF generation and notification (will be implemented later)
        if is_new:
            # generate_monthly_report_pdf(self)
            # NotificationService.notify_monthly_report_submitted(self)
            pass

class StudentMonthlyReport(models.Model):
    """
    Monthly progress reports submitted by students
    Logs tasks performed, skills learned, and challenges faced
    """
    
    # Relationships
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_personal_monthly_reports',
        limit_choices_to={'role': 'STUDENT'},
        help_text='Student submitting this report'
    )
    advisor_assignment = models.ForeignKey(
        'advisors.AdvisorAssignment',
        on_delete=models.CASCADE,
        related_name='student_monthly_reports',
        help_text='Advisor assignment this report belongs to'
    )
    
    # Report Details
    report_month = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        help_text='Month number (1 = first month, 2 = second month, etc.)'
    )
    tasks_performed = models.TextField(
        help_text='Description of tasks performed during this month'
    )
    skills_learned = models.TextField(
        help_text='Skills and knowledge acquired during this month'
    )
    challenges_faced = models.TextField(
        help_text='Challenges or issues encountered'
    )
    solutions_applied = models.TextField(
        null=True, blank=True,
        help_text='How the challenges were resolved'
    )
    hours_worked = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(0)],
        help_text='Total hours worked this month'
    )
    
    # File Upload
    report_file = models.FileField(
        upload_to='reports/student_monthly/%Y/%m/',
        validators=[validate_pdf_file],
        null=True,
        blank=True,
        help_text='Supplemental documentation (PDF/DOC)'
    )
    
    # Submission Details
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'student_monthly_reports'
        verbose_name = 'Student Monthly Report'
        verbose_name_plural = 'Student Monthly Reports'
        ordering = ['-submitted_at']
        unique_together = [['student', 'advisor_assignment', 'report_month']]
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['advisor_assignment']),
            models.Index(fields=['submitted_at']),
        ]
    
    def __str__(self):
        return f"Student Month {self.report_month} - {self.student.get_full_name()}"

    def clean(self):
        """Validate model data before saving"""
        super().clean()
        
        # Validate student matches assignment
        if self.student and self.advisor_assignment:
            if self.student != self.advisor_assignment.student:
                raise ValidationError({
                    'student': 'Student must match the advisor assignment.'
                })
            if not self.advisor_assignment.is_active:
                raise ValidationError('Cannot submit reports for an inactive internship.')

    def save(self, *args, **kwargs):
        """Override save to run validation"""
        self.full_clean()
        super().save(*args, **kwargs)


class StudentFinalReport(models.Model):
    """
    Final report submitted by the student for advisor review
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REVISIONS_REQUIRED', 'Revisions Required'),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_final_reports',
        limit_choices_to={'role': 'STUDENT'}
    )
    advisor_assignment = models.OneToOneField(
        'advisors.AdvisorAssignment',
        on_delete=models.CASCADE,
        related_name='student_final_report'
    )
    report_file = models.FileField(
        upload_to='reports/student_final/%Y/',
        validators=[validate_pdf_file],
        help_text='The final report document (PDF)'
    )
    summary = models.TextField(help_text='Brief summary of internship achievements')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    advisor_feedback = models.TextField(blank=True, null=True, help_text='Feedback from advisor for revisions')
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_final_reports'

    def __str__(self):
        return f"Student Final Report - {self.student.get_full_name()}"


class FinalReport(models.Model):
    """
    Final internship evaluation with 50/50 weighted grading
    Stage 1: Company submits evaluation and score (50%)
    Stage 2: Advisor reviews student report and submits evaluation/score (50%)
    """
    
    STATUS_CHOICES = [
        ('PENDING_ADVISOR', 'Pending Advisor Review'),
        ('SUBMITTED_TO_DEPARTMENT', 'Submitted to Department Head'),
        ('APPROVED_BY_DEPARTMENT', 'Approved by Department Head'),
        ('CERTIFICATE_ISSUED', 'Certificate Issued'),
        ('COMPLETED', 'Completed'),
    ]
    
    RECOMMENDATION_CHOICES = [
        ('YES', 'Yes - Recommend'),
        ('NO', 'No - Do Not Recommend'),
        ('CONDITIONAL', 'Conditional'),
    ]
    
    GRADE_CHOICES = [
        ('A', 'A (90-100)'),
        ('B', 'B (80-89)'),
        ('C', 'C (70-79)'),
        ('D', 'D (60-69)'),
        ('F', 'F (<60)'),
    ]
    
    # Relationships
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='final_reports',
        limit_choices_to={'role': 'STUDENT'},
        help_text='Student this report is about'
    )
    company = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='company_final_evaluations',
        limit_choices_to={'role': 'COMPANY'},
        help_text='Company submitting the report'
    )
    advisor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='completed_final_reports',
        limit_choices_to={'role': 'ADVISOR'},
        help_text='Advisor completing the report'
    )
    advisor_assignment = models.OneToOneField(
        'advisors.AdvisorAssignment',
        on_delete=models.CASCADE,
        related_name='final_report',
        help_text='Advisor assignment this report belongs to'
    )
    
    # Status
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default='PENDING_ADVISOR',
        db_index=True,
        help_text='Current status of the report'
    )
    
    # Company Section (Stage 1)
    internship_duration = models.CharField(
        max_length=100,
        help_text='Duration of internship'
    )
    company_performance_assessment = models.TextField()
    company_recommendation = models.CharField(
        max_length=15,
        choices=RECOMMENDATION_CHOICES,
    )
    company_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0,
        help_text='Company evaluation score (0-100), contributes 50%'
    )
    company_submitted_at = models.DateTimeField(null=True, blank=True)
    
    # Advisor Section (Stage 2)
    advisor_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0,
        help_text='Advisor evaluation score (0-100), contributes 50%'
    )
    criteria_scores = models.JSONField(
        default=dict,
        help_text='Structured scores for evaluation criteria'
    )
    advisor_evaluation = models.TextField(blank=True, null=True)
    advisor_submitted_at = models.DateTimeField(null=True, blank=True)
    
    # Calculations
    avg_monthly_score = models.FloatField(
        default=0.0,
        help_text='Average score of all monthly reports (contributes 40%)'
    )
    total_score = models.FloatField(
        default=0.0,
        help_text='Combined weighted score (Monthly 40% + Company 30% + Advisor 30%)'
    )
    overall_grade = models.CharField(
        max_length=1,
        choices=GRADE_CHOICES,
        blank=True,
        null=True,
        help_text='Final Letter Grade'
    )
    
    # Department Head Section (Stage 3)
    department_head = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_final_reports',
        limit_choices_to={'role': 'DEPARTMENT_HEAD'},
        help_text='Department Head who reviewed this report'
    )
    department_review = models.TextField(
        blank=True, 
        null=True,
        help_text='Academic performance review and final comments from Department Head'
    )
    department_approved = models.BooleanField(
        default=False,
        help_text='Whether the Department Head has approved this report for certificate generation'
    )
    department_reviewed_at = models.DateTimeField(null=True, blank=True)
    
    # Certificate Generation (Stage 4)
    certificate_issued = models.BooleanField(
        default=False,
        help_text='Whether certificate has been generated and issued to student'
    )
    certificate_issued_at = models.DateTimeField(null=True, blank=True)
    certificate_issued_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='issued_certificates_reports',
        help_text='User who issued the certificate (Department Head)'
    )
    
    # PDF & Log
    pdf_file = models.FileField(
        upload_to='reports/final/%Y/%m/',
        validators=[validate_pdf_file],
        null=True,
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'final_reports'
        verbose_name = 'Final Evaluation'
        verbose_name_plural = 'Final Evaluations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['advisor_assignment']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Final Evaluation - {self.student.get_full_name()} ({self.total_score})"
    
    def calculate_total_grade(self):
        """Calculate weighted score (40/30/30) and assign letter grade"""
        if self.company_submitted_at and self.advisor_submitted_at:
            # 1. Calculate Average Monthly Score (40%)
            monthly_reports = MonthlyReport.objects.filter(
                student=self.student,
                advisor_assignment=self.advisor_assignment
            )
            
            if monthly_reports.exists():
                total_monthly_pct = 0
                for r in monthly_reports:
                    # Score is out of 40, convert to percentage
                    total_monthly_pct += (
                        r.task_completion_score + 
                        r.skill_development_score + 
                        r.problem_solving_score + 
                        r.professionalism_score
                    ) / 40 * 100
                self.avg_monthly_score = total_monthly_pct / monthly_reports.count()
            else:
                self.avg_monthly_score = 0.0

            # 2. Final weighted score
            # Monthly (40%) + Company (30%) + Advisor (30%)
            # Note: company_score and advisor_score are assumed to be 0-100
            self.total_score = (
                (self.avg_monthly_score * 0.4) + 
                (self.company_score * 0.3) + 
                (self.advisor_score * 0.3)
            )
            
            if self.total_score >= 90: self.overall_grade = 'A'
            elif self.total_score >= 80: self.overall_grade = 'B'
            elif self.total_score >= 70: self.overall_grade = 'C'
            elif self.total_score >= 60: self.overall_grade = 'D'
            else: self.overall_grade = 'F'
            
    def save(self, *args, **kwargs):
        self.calculate_total_grade()
        super().save(*args, **kwargs)
    
    def submit_company_section(self):
        """Mark company section as submitted"""
        self.company_submitted_at = timezone.now()
        self.status = 'PENDING_ADVISOR'
        self.save()
        
        # Notify advisor (will be implemented when integrated)
        # NotificationService.notify_final_report_pending_advisor(self)
    
    def submit_advisor_section(self):
        """Mark advisor section as submitted and send to department head"""
        from apps.notifications.services import NotificationService
        from django.utils import timezone

        self.advisor_submitted_at = timezone.now()
        self.status = 'SUBMITTED_TO_DEPARTMENT'
        self.save()
        
        # Generate PDF for department head review
        try:
            from .pdf_generator import generate_final_report_pdf
            rel_path = generate_final_report_pdf(self)
            # Update via queryset to avoid re-calculating grade in save()
            FinalReport.objects.filter(pk=self.pk).update(pdf_file=rel_path)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to generate final report PDF for {self.id}: {e}")

        # Notify department head for review
        NotificationService.notify_final_report_pending_department_head(
            student=self.student,
            advisor=self.advisor,
            report=self
        )
    
    def approve_by_department_head(self, department_head_user, review_comments=None):
        """
        Department Head approves the final report
        
        Args:
            department_head_user: User object with role='DEPARTMENT_HEAD'
            review_comments: Optional review comments from department head
        
        Returns:
            bool: True if successful
        """
        from apps.notifications.services import NotificationService
        from django.utils import timezone

        # Validate department head is from same department
        if department_head_user.department != self.student.department:
            raise ValidationError('Department Head must be from the same department as the student.')

        # Update approval status
        self.department_head = department_head_user
        self.department_review = review_comments or ''
        self.department_approved = True
        self.department_reviewed_at = timezone.now()
        self.status = 'APPROVED_BY_DEPARTMENT'
        self.save()

        # Notify student about approval
        NotificationService.create_notification(
            recipient=self.student,
            title='Final Report Approved',
            message=f'Your final internship report has been approved by the Department Head. Your certificate will be issued soon.',
            notification_type='FINAL_REPORT_APPROVED',
            link='/student/certificates'
        )

        # Notify advisor about approval
        NotificationService.create_notification(
            recipient=self.advisor,
            title='Final Report Approved by Department',
            message=f'The final report for {self.student.get_full_name()} has been approved by the Department Head.',
            notification_type='FINAL_REPORT_APPROVED',
            link='/advisor/my-students'
        )

        return True
    
    def reject_by_department_head(self, department_head_user, rejection_reason):
        """
        Department Head rejects the final report and sends back to advisor
        
        Args:
            department_head_user: User object with role='DEPARTMENT_HEAD'
            rejection_reason: Reason for rejection
        
        Returns:
            bool: True if successful
        """
        from apps.notifications.services import NotificationService
        from django.utils import timezone

        # Validate department head is from same department
        if department_head_user.department != self.student.department:
            raise ValidationError('Department Head must be from the same department as the student.')

        # Update rejection status
        self.department_head = department_head_user
        self.department_review = rejection_reason
        self.department_approved = False
        self.department_reviewed_at = timezone.now()
        self.status = 'PENDING_ADVISOR'  # Send back to advisor
        # Reset advisor submission to allow resubmission
        self.advisor_submitted_at = None
        self.save()

        # Notify advisor about rejection
        NotificationService.create_notification(
            recipient=self.advisor,
            title='Final Report Requires Revision',
            message=f'The final report for {self.student.get_full_name()} requires revision. Department Head feedback: {rejection_reason}',
            notification_type='FINAL_REPORT_REJECTED',
            link='/advisor/my-students'
        )

        # Notify student about rejection
        NotificationService.create_notification(
            recipient=self.student,
            title='Final Report Requires Revision',
            message=f'Your final internship report requires revision. Please work with your advisor to address the feedback.',
            notification_type='FINAL_REPORT_REJECTED',
            link='/student/active-internship'
        )

        return True
    
    def issue_certificate(self, issued_by_user):
        """
        Generate and issue certificate to student (Department Head action)
        
        Args:
            issued_by_user: User object (Department Head) issuing the certificate
        
        Returns:
            Certificate: The generated certificate object
        """
        from apps.certificates.models import Certificate
        from apps.certificates.certificate_generator import generate_certificate_pdf
        from apps.notifications.services import NotificationService
        from django.utils import timezone

        # Validate report is approved
        if not self.department_approved:
            raise ValidationError('Final report must be approved by Department Head before issuing certificate.')

        # Validate user can issue certificates
        if issued_by_user.role != 'DEPARTMENT_HEAD':
            raise ValidationError('Only Department Heads can issue certificates.')

        if issued_by_user.department != self.student.department:
            raise ValidationError('Department Head must be from the same department as the student.')

        # Check if certificate already exists
        if hasattr(self, 'certificate') and self.certificate:
            raise ValidationError('Certificate has already been issued for this report.')

        # Create certificate
        certificate = Certificate.objects.create(
            student=self.student,
            final_report=self,
            issued_by=issued_by_user,
            # Populate denormalized data
            student_name=self.student.get_full_name(),
            student_university_id=getattr(self.student.student_profile, 'university_id', ''),
            company_name=self.advisor_assignment.internship.get_company_name(),
            internship_title=self.advisor_assignment.internship.title,
            department_name=self.student.department.name if self.student.department else '',
            advisor_name=self.advisor.get_full_name(),
            start_date=self.advisor_assignment.internship.start_date,
            end_date=self.advisor_assignment.internship.end_date or self.advisor_assignment.internship.start_date,
            duration_months=self.advisor_assignment.internship.duration_months,
            performance_grade=self.overall_grade or '',
            # Signature names (captured at issue time)
            dept_head_name=issued_by_user.get_full_name(),
            company_rep_name=getattr(self.advisor_assignment.internship.company.company_profile, 'contact_person_name', ''),
            company_rep_title=getattr(self.advisor_assignment.internship.company.company_profile, 'contact_person_title', ''),
            uil_director_name='Dr. UIL Director',  # This should come from settings
            # Generate unique identifiers
            certificate_id=Certificate.generate_certificate_id(self.student),
            verification_code=Certificate.generate_verification_code(),
        )

        # Generate PDF
        try:
            pdf_path = generate_certificate_pdf(certificate)
            certificate.pdf_file = pdf_path
            certificate.is_generated = True
            certificate.save()
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to generate certificate PDF for {certificate.id}: {e}")

        # Update final report status
        self.certificate_issued = True
        self.certificate_issued_at = timezone.now()
        self.certificate_issued_by = issued_by_user
        self.status = 'CERTIFICATE_ISSUED'
        self.save()

        # Notify student about certificate
        NotificationService.create_notification(
            recipient=self.student,
            title='🎉 Certificate Issued!',
            message=f'Congratulations! Your internship certificate ({certificate.certificate_id}) has been issued. You can download it from your dashboard.',
            notification_type='CERTIFICATE_ISSUED',
            link='/student/certificates'
        )

        # Notify advisor about certificate
        NotificationService.create_notification(
            recipient=self.advisor,
            title='Certificate Issued',
            message=f'Certificate has been issued to {self.student.get_full_name()} for their completed internship.',
            notification_type='CERTIFICATE_ISSUED',
            link='/advisor/my-students'
        )

        return certificate
    
    @property
    def is_complete(self):
        """Check if both sections are submitted"""
        return self.company_submitted_at and self.advisor_submitted_at