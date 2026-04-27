"""
Internship Admin Interface
Django admin configuration for internships
"""
from django.contrib import admin
from .models import Internship


@admin.register(Internship)
class InternshipAdmin(admin.ModelAdmin):
    """Admin interface for Internship model"""
    
    list_display = [
        'title',
        'get_company_name',
        'department',
        'location',
        'start_date',
        'duration_months',
        'status',
        'available_slots',
        'is_active',
        'created_at',
    ]
    
    list_filter = [
        'status',
        'is_active',
        'department',
        'duration_months',
        'created_at',
    ]
    
    search_fields = [
        'title',
        'description',
        'required_skills',
        'location',
        'company__email',
        'company__company_profile__company_name',
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at',
        'available_slots',
        'is_deadline_passed',
        'is_accepting_applications',
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('company', 'department', 'title', 'description', 'required_skills', 'location')
        }),
        ('Duration', {
            'fields': ('duration_months', 'start_date', 'end_date')
        }),
        ('Application Settings', {
            'fields': ('max_applicants', 'application_deadline', 'available_slots')
        }),
        ('Status', {
            'fields': ('status', 'is_active', 'is_accepting_applications', 'is_deadline_passed')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_company_name(self, obj):
        """Display company name"""
        return obj.get_company_name()
    get_company_name.short_description = 'Company'
    get_company_name.admin_order_field = 'company__company_profile__company_name'
    
    def available_slots(self, obj):
        """Display available slots"""
        return obj.available_slots
    available_slots.short_description = 'Available Slots'
    
    actions = ['close_internships', 'reopen_internships', 'deactivate_internships']
    
    def close_internships(self, request, queryset):
        """Close selected internships"""
        count = 0
        for internship in queryset:
            try:
                internship.close()
                count += 1
            except Exception:
                pass
        self.message_user(request, f'{count} internship(s) closed successfully.')
    close_internships.short_description = 'Close selected internships'
    
    def reopen_internships(self, request, queryset):
        """Reopen selected internships"""
        count = 0
        for internship in queryset:
            try:
                internship.reopen()
                count += 1
            except Exception:
                pass
        self.message_user(request, f'{count} internship(s) reopened successfully.')
    reopen_internships.short_description = 'Reopen selected internships'
    
    def deactivate_internships(self, request, queryset):
        """Deactivate selected internships"""
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} internship(s) deactivated successfully.')
    deactivate_internships.short_description = 'Deactivate selected internships'