"""
Admin configurations for Advisors
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.urls import reverse
from django.utils import timezone
from .models import AdvisorAssignment, Feedback


@admin.register(AdvisorAssignment)
class AdvisorAssignmentAdmin(admin.ModelAdmin):
    """Admin interface for AdvisorAssignment model"""
    
    list_display = [
        'id',
        'student_link',
        'advisor_link',
        'internship_title',
        'company_name',
        'status_badge',
        'assigned_at',
        'duration',
        'feedback_count',
    ]
    
    list_filter = [
        'is_active',
        'assigned_at',
        'completed_at',
        'advisor__department',
        'student__department',
    ]
    
    search_fields = [
        'student__email',
        'student__student_profile__full_name',
        'student__student_profile__university_id',
        'advisor__email',
        'advisor__advisor_profile__full_name',
        'advisor__advisor_profile__staff_id',
        'internship__title',
        'internship__company__company_profile__company_name',
    ]
    
    readonly_fields = [
        'assigned_at',
        'completed_at',
        'created_at',
        'updated_at',
        'duration_display',
        'feedback_count_display',
    ]
    
    date_hierarchy = 'assigned_at'
    
    fieldsets = (
        ('Assignment Details', {
            'fields': (
                'student',
                'advisor', 
                'internship',
                'application',
                'assigned_by'
            )
        }),
        ('Status', {
            'fields': (
                'is_active',
                'assigned_at',
                'completed_at',
                'duration_display'
            )
        }),
        ('Statistics', {
            'fields': ('feedback_count_display',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_completed', 'mark_as_active']
    
    def student_link(self, obj):
        """Display student name as clickable link"""
        url = reverse('admin:accounts_user_change', args=[obj.student.id])
        return format_html(
            '<a href="{}">{}</a>',
            url,
            obj.get_student_name()
        )
    student_link.short_description = 'Student'
    student_link.admin_order_field = 'student'
    
    def advisor_link(self, obj):
        """Display advisor name as clickable link"""
        url = reverse('admin:accounts_user_change', args=[obj.advisor.id])
        return format_html(
            '<a href="{}">{}</a>',
            url,
            obj.get_advisor_name()
        )
    advisor_link.short_description = 'Advisor'
    advisor_link.admin_order_field = 'advisor'
    
    def internship_title(self, obj):
        """Display internship title"""
        return obj.get_internship_title()
    internship_title.short_description = 'Internship'
    internship_title.admin_order_field = 'internship__title'
    
    def company_name(self, obj):
        """Display company name"""
        return obj.get_company_name()
    company_name.short_description = 'Company'
    
    def status_badge(self, obj):
        """Display status as colored badge"""
        if obj.is_active:
            color = '#48bb78'
            text = 'Active'
        else:
            color = '#718096'
            text = 'Completed'
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-size: 11px; font-weight: bold;">{}</span>',
            color,
            text
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'is_active'
    
    def duration(self, obj):
        """Display duration"""
        days = obj.get_duration_days()
        if days == 0:
            return 'Today'
        elif days == 1:
            return '1 day'
        else:
            return f'{days} days'
    duration.short_description = 'Duration'
    
    def duration_display(self, obj):
        """Display duration for detail view"""
        days = obj.get_duration_days()
        months = days // 30
        remaining_days = days % 30
        
        if months > 0:
            return f'{months} month(s) and {remaining_days} day(s) ({days} days total)'
        return f'{days} day(s)'
    duration_display.short_description = 'Duration'
    
    def feedback_count(self, obj):
        """Display feedback count"""
        count = obj.get_feedback_count()
        if count == 0:
            return mark_safe('<span style="color: #cbd5e0;">0</span>')
        return format_html('<strong>{}</strong>', count)
    feedback_count.short_description = 'Feedback'
    
    def feedback_count_display(self, obj):
        """Display feedback count for detail view"""
        return f'{obj.get_feedback_count()} feedback item(s)'
    feedback_count_display.short_description = 'Total Feedback'
    
    def mark_as_completed(self, request, queryset):
        """Admin action to mark assignments as completed"""
        updated = 0
        for assignment in queryset.filter(is_active=True):
            try:
                assignment.complete()
                updated += 1
            except Exception as e:
                self.message_user(
                    request,
                    f'Error completing assignment {assignment.id}: {str(e)}',
                    level='error'
                )
        
        if updated > 0:
            self.message_user(
                request,
                f'{updated} assignment(s) marked as completed.',
                level='success'
            )
    mark_as_completed.short_description = 'Mark selected assignments as completed'
    
    def mark_as_active(self, request, queryset):
        """Admin action to mark assignments as active"""
        updated = queryset.filter(is_active=False).update(
            is_active=True,
            completed_at=None
        )
        
        if updated > 0:
            self.message_user(
                request,
                f'{updated} assignment(s) marked as active.',
                level='success'
            )
    mark_as_active.short_description = 'Mark selected assignments as active'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        queryset = super().get_queryset(request)
        return queryset.select_related(
            'student',
            'student__student_profile',
            'advisor',
            'advisor__advisor_profile',
            'internship',
            'internship__company',
            'internship__company__company_profile',
            'application',
            'assigned_by'
        ).prefetch_related('feedbacks')


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    """Admin interface for Feedback model"""
    
    list_display = [
        'id',
        'student_name',
        'advisor_name',
        'company_name',
        'created_at',
        'feedback_preview',
        'length_indicator',
    ]
    
    list_filter = [
        'created_at',
        'advisor_assignment__is_active',
        'created_by__department',
    ]
    
    search_fields = [
        'advisor_assignment__student__email',
        'advisor_assignment__student__student_profile__full_name',
        'created_by__email',
        'created_by__advisor_profile__full_name',
        'feedback_text',
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at',
        'student_detail',
        'advisor_detail',
        'internship_detail',
        'word_count',
        'char_count',
    ]
    
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Feedback Details', {
            'fields': ('advisor_assignment', 'created_by', 'feedback_text')
        }),
        ('Related Information', {
            'fields': ('student_detail', 'advisor_detail', 'internship_detail'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('word_count', 'char_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def student_name(self, obj):
        """Display student name"""
        return obj.get_student().get_full_name()
    student_name.short_description = 'Student'
    student_name.admin_order_field = 'advisor_assignment__student'
    
    def advisor_name(self, obj):
        """Display advisor name"""
        return obj.get_advisor().get_full_name()
    advisor_name.short_description = 'Advisor'
    advisor_name.admin_order_field = 'created_by'
    
    def company_name(self, obj):
        """Display company name"""
        return obj.advisor_assignment.get_company_name()
    company_name.short_description = 'Company'
    
    def feedback_preview(self, obj):
        """Display feedback preview"""
        preview = obj.get_feedback_preview(80)
        return format_html('<span style="color: #4a5568;">{}</span>', preview)
    feedback_preview.short_description = 'Feedback'
    
    def length_indicator(self, obj):
        """Display feedback length indicator"""
        length = len(obj.feedback_text)
        
        if length < 50:
            color = '#f56565'
            label = 'Short'
        elif length < 200:
            color = '#ed8936'
            label = 'Medium'
        else:
            color = '#48bb78'
            label = 'Detailed'
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; '
            'border-radius: 3px; font-size: 10px;">{}</span>',
            color,
            label
        )
    length_indicator.short_description = 'Length'
    
    def student_detail(self, obj):
        """Display student details"""
        student = obj.get_student()
        return format_html(
            '<strong>{}</strong><br>'
            'Email: {}<br>'
            'Department: {}',
            student.get_full_name(),
            student.email,
            student.department.name if student.department else 'N/A'
        )
    student_detail.short_description = 'Student Information'
    
    def advisor_detail(self, obj):
        """Display advisor details"""
        advisor = obj.get_advisor()
        return format_html(
            '<strong>{}</strong><br>'
            'Email: {}<br>'
            'Department: {}',
            advisor.get_full_name(),
            advisor.email,
            advisor.department.name if advisor.department else 'N/A'
        )
    advisor_detail.short_description = 'Advisor Information'
    
    def internship_detail(self, obj):
        """Display internship details"""
        assignment = obj.advisor_assignment
        return format_html(
            '<strong>{}</strong><br>'
            'Company: {}<br>'
            'Status: {}',
            assignment.get_internship_title(),
            assignment.get_company_name(),
            'Active' if assignment.is_active else 'Completed'
        )
    internship_detail.short_description = 'Internship Information'
    
    def word_count(self, obj):
        """Display word count"""
        count = len(obj.feedback_text.split())
        return f'{count} word(s)'
    word_count.short_description = 'Word Count'
    
    def char_count(self, obj):
        """Display character count"""
        return f'{len(obj.feedback_text)} character(s)'
    char_count.short_description = 'Character Count'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        queryset = super().get_queryset(request)
        return queryset.select_related(
            'advisor_assignment',
            'advisor_assignment__student',
            'advisor_assignment__student__student_profile',
            'advisor_assignment__advisor',
            'advisor_assignment__advisor__advisor_profile',
            'advisor_assignment__internship',
            'advisor_assignment__internship__company',
            'advisor_assignment__internship__company__company_profile',
            'created_by',
            'created_by__advisor_profile'
        )