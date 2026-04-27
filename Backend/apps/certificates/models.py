"""
Certificate Models
One certificate per student, tied to their completed FinalReport.
"""
import datetime
import random
import string
from django.db import models
from django.conf import settings


class Certificate(models.Model):

    # ── Relationships ─────────────────────────────────────────────────────────
    student = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='certificate',
        limit_choices_to={'role': 'STUDENT'},
    )
    final_report = models.OneToOneField(
        'reports.FinalReport',
        on_delete=models.CASCADE,
        related_name='certificate',
    )
    issued_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='issued_certificates',
    )

    # ── Certificate identifiers ───────────────────────────────────────────────
    certificate_id    = models.CharField(max_length=50, unique=True, db_index=True)
    verification_code = models.CharField(max_length=32, unique=True, db_index=True)
    issue_date        = models.DateField(default=datetime.date.today)

    # ── Student / internship data (denormalised at issue time) ────────────────
    student_name          = models.CharField(max_length=255)
    student_university_id = models.CharField(max_length=100)
    company_name          = models.CharField(max_length=255)
    internship_title      = models.CharField(max_length=255)
    department_name       = models.CharField(max_length=255)
    advisor_name          = models.CharField(max_length=255)
    start_date            = models.DateField()
    end_date              = models.DateField()
    duration_months       = models.IntegerField()
    performance_grade     = models.CharField(max_length=5, blank=True)

    # ── Signature names (denormalised at issue time) ──────────────────────────
    # These are stored so the PDF is accurate even if profiles change later.
    dept_head_name     = models.CharField(
        max_length=255, blank=True, default='',
        help_text='Department head full name at time of issue (from Department.head_name)',
    )
    company_rep_name   = models.CharField(
        max_length=255, blank=True, default='',
        help_text='Company contact person name (from CompanyProfile.contact_person_name)',
    )
    company_rep_title  = models.CharField(
        max_length=100, blank=True, default='',
        help_text='Company contact person title (from CompanyProfile.contact_person_title)',
    )
    uil_director_name  = models.CharField(
        max_length=255, blank=True, default='',
        help_text='UIL director name at time of issue (from settings.UIL_DIRECTOR_NAME)',
    )

    # ── PDF ───────────────────────────────────────────────────────────────────
    pdf_file     = models.FileField(upload_to='certificates/', null=True, blank=True)
    is_generated = models.BooleanField(default=False)

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'certificates'
        verbose_name = 'Certificate'
        verbose_name_plural = 'Certificates'
        ordering = ['-issue_date']
        indexes = [
            models.Index(fields=['certificate_id'],    name='certificate_certifi_a0a669_idx'),
            models.Index(fields=['verification_code'], name='cert_vcode_idx'),
            models.Index(fields=['student'],            name='certificate_student_e19697_idx'),
        ]

    def __str__(self):
        return f'{self.certificate_id} — {self.student_name}'

    # ── Class-level helpers (called by views before .save()) ──────────────────

    @staticmethod
    def generate_certificate_id(student):
        """
        Format: CERT-{YEAR}-{DEPT_2LETTERS}-{SEQ:03d}
        Example: CERT-2024-CS-001
        Safe to call before the instance is saved.
        """
        year = datetime.date.today().year
        try:
            dept_code = student.department.name[:2].upper().replace(' ', '')
        except Exception:
            dept_code = 'XX'
        # Next sequence number for this year + dept
        prefix = f'CERT-{year}-{dept_code}-'
        last = (
            Certificate.objects
            .filter(certificate_id__startswith=prefix)
            .order_by('-certificate_id')
            .values_list('certificate_id', flat=True)
            .first()
        )
        if last:
            try:
                seq = int(last.split('-')[-1]) + 1
            except ValueError:
                seq = 1
        else:
            seq = 1
        return f'{prefix}{seq:03d}'

    @staticmethod
    def generate_verification_code():
        """16-character random alphanumeric code, guaranteed unique."""
        chars = string.ascii_uppercase + string.digits
        while True:
            code = ''.join(random.choices(chars, k=16))
            if not Certificate.objects.filter(verification_code=code).exists():
                return code