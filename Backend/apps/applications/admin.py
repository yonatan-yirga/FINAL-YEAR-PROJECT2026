"""
Application Admin Configuration
Django admin interface for applications
"""
from django.contrib import admin
from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    """Admin interface for applications"""
    
    list_display = [
        'id',
        'get_student_name',
        'get_internship_title',
        'get_company_name',
        'status',
        'education_level',
        'applied_at',
        'reviewed_at',
    ]
    
    list_filter = [
        'status',
        'applied_at',
        'reviewed_at',
        'internship__department',
    ]
    
    search_fields = [
        'student__email',
        'student__student_profile__full_name',
        'internship__title',
        'internship__company__company_profile__company_name',
    ]
    
    readonly_fields = [
        'applied_at',
        'updated_at',
        'reviewed_at',
    ]
    
    fieldsets = [
        ('Application Information', {
            'fields': [
                'student',
                'internship',
                'about_me',
                'experience',
                'education_level',
                'projects',
                'certificate',
                'cover_letter',
                'status',
            ]
        }),
        ('Review Information', {
            'fields': [
                'reviewed_by',
                'reviewed_at',
                'rejection_reason',
            ]
        }),
        ('Timestamps', {
            'fields': [
                'applied_at',
                'updated_at',
            ]
        }),
    ]
    
    def get_student_name(self, obj):
        """Display student name"""
        return obj.get_student_name()
    get_student_name.short_description = 'Student'
    get_student_name.admin_order_field = 'student__student_profile__full_name'
    
    def get_internship_title(self, obj):
        """Display internship title"""
        return obj.internship.title
    get_internship_title.short_description = 'Internship'
    get_internship_title.admin_order_field = 'internship__title'
    
    def get_company_name(self, obj):
        """Display company name"""
        return obj.get_company_name()
    get_company_name.short_description = 'Company'
    
    def has_add_permission(self, request):
        """Disable manual creation of applications"""
        return False