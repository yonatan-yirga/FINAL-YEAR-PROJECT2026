"""
Admin configurations for Reports
"""
from django.contrib import admin
from .models import MonthlyReport, FinalReport


@admin.register(MonthlyReport)
class MonthlyReportAdmin(admin.ModelAdmin):
    """Admin interface for MonthlyReport model"""
    
    list_display = [
        'student',
        'report_month',
        'performance_rating',
        'attendance_rate',
        'submitted_at',
        'pdf_available',
    ]
    
    list_filter = [
        'performance_rating',
        'report_month',
        'submitted_at',
    ]
    
    search_fields = [
        'student__email',
        'student__student_profile__full_name',
        'company__email',
        'company__company_profile__company_name',
        'tasks_completed',
        'comments',
    ]
    
    readonly_fields = [
        'submitted_at',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Report Details', {
            'fields': ('student', 'company', 'advisor_assignment', 'report_month')
        }),
        ('Performance', {
            'fields': ('attendance_rate', 'tasks_completed', 'performance_rating', 'comments')
        }),
        ('Submission', {
            'fields': ('submitted_by', 'submitted_at', 'pdf_file')
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


@admin.register(FinalReport)
class FinalReportAdmin(admin.ModelAdmin):
    """Admin interface for FinalReport model"""
    
    list_display = [
        'student',
        'status',
        'company_submitted_at',
        'advisor_submitted_at',
        'overall_grade',
        'pdf_available',
    ]
    
    list_filter = [
        'status',
        'overall_grade',
        'company_recommendation',
        'company_submitted_at',
        'advisor_submitted_at',
    ]
    
    search_fields = [
        'student__email',
        'student__student_profile__full_name',
        'company__email',
        'company__company_profile__company_name',
        'advisor__email',
        'advisor__advisor_profile__full_name',
    ]
    
    readonly_fields = [
        'company_submitted_at',
        'advisor_submitted_at',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Report Details', {
            'fields': ('student', 'company', 'advisor', 'advisor_assignment', 'status')
        }),
        ('Company Section', {
            'fields': (
                'internship_duration',
                'company_performance_assessment',
                'skills_developed',
                'key_achievements',
                'company_recommendation',
                'company_comments',
                'company_submitted_at',
            )
        }),
        ('Advisor Section', {
            'fields': (
                'advisor_evaluation',
                'academic_integration',
                'professional_development',
                'improvement_areas',
                'overall_grade',
                'advisor_submitted_at',
            )
        }),
        ('PDF File', {
            'fields': ('pdf_file',)
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