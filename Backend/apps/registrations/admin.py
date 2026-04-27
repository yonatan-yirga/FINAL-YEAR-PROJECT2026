"""
Registration Admin Configuration
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from .models import RegistrationRequest


@admin.register(RegistrationRequest)
class RegistrationRequestAdmin(admin.ModelAdmin):
    """Admin configuration for RegistrationRequest"""
    
    list_display = [
        'email', 'request_type', 'department', 'status_badge',
        'submitted_at', 'reviewed_by'
    ]
    list_filter = ['status', 'request_type', 'submitted_at', 'department']
    search_fields = ['email', 'student_full_name', 'company_name', 'advisor_full_name']
    ordering = ['-submitted_at']
    readonly_fields = ['submitted_at', 'reviewed_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('request_type', 'email', 'department', 'document')
        }),
        ('Status', {
            'fields': ('status', 'rejection_reason', 'reviewed_by', 'submitted_at', 'reviewed_at')
        }),
        ('Student Information', {
            'fields': (
                'student_full_name', 'student_phone', 'student_dob', 'student_gender',
                'student_university_id', 'student_skills'
            ),
            'classes': ('collapse',)
        }),
        ('Company Information', {
            'fields': (
                'company_name', 'company_phone', 'company_address', 'company_city',
                'company_contact_person', 'company_contact_title', 'company_description'
            ),
            'classes': ('collapse',)
        }),
        ('Advisor Information', {
            'fields': ('advisor_full_name', 'advisor_phone', 'advisor_staff_id'),
            'classes': ('collapse',)
        }),
        ('Department Information', {
            'fields': ('department_name', 'department_head_name', 'department_phone'),
            'classes': ('collapse',)
        }),
    )
    
    def status_badge(self, obj):
        """Display status with color coding"""
        colors = {
            'PENDING': 'orange',
            'APPROVED': 'green',
            'REJECTED': 'red',
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'black'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'