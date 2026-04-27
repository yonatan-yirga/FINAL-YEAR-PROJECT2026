"""
Admin configurations for Certificates
"""
from django.contrib import admin
from .models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    """Admin interface for Certificate model"""
    
    list_display = [
        'certificate_id',
        'student',
        'issue_date',
        'issued_by',
        'pdf_available',
        'created_at',
    ]
    
    list_filter = [
        'issue_date',
        'created_at',
    ]
    
    search_fields = [
        'certificate_id',
        'student__email',
        'student__student_profile__full_name',
        'student__student_profile__university_id',
    ]
    
    readonly_fields = [
        'certificate_id',
        'issue_date',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Certificate Details', {
            'fields': ('certificate_id', 'student', 'final_report', 'issue_date', 'issued_by')
        }),
        ('Student Information', {
            'fields': ('student_name', 'student_university_id', 'company_name', 'internship_title', 'department_name', 'advisor_name')
        }),
        ('Internship Duration', {
            'fields': ('start_date', 'end_date', 'duration_months', 'performance_grade')
        }),
        ('Signature Information', {
            'fields': ('dept_head_name', 'company_rep_name', 'company_rep_title', 'uil_director_name'),
            'classes': ('collapse',)
        }),
        ('PDF File', {
            'fields': ('pdf_file', 'is_generated', 'verification_code')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def pdf_available(self, obj):
        """Check if PDF is available"""
        return bool(obj.pdf_file)
    pdf_available.boolean = True
    pdf_available.short_description = 'PDF'