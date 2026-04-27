"""
Django Admin Configuration for Accounts App
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.db import transaction
from .models import User, StudentProfile, CompanyProfile, AdvisorProfile, DepartmentHeadProfile


class StudentProfileInline(admin.StackedInline):
    """Inline admin for StudentProfile"""
    model = StudentProfile
    can_delete = False
    verbose_name_plural = 'Student Profile'
    fk_name = 'user'
    fields = [
        'full_name', 'phone_number', 'date_of_birth', 'gender',
        'university_id', 'skills', 'document'
    ]


class CompanyProfileInline(admin.StackedInline):
    """Inline admin for CompanyProfile"""
    model = CompanyProfile
    can_delete = False
    verbose_name_plural = 'Company Profile'
    fk_name = 'user'
    fields = [
        'company_name', 'phone_number', 'address', 'city',
        'contact_person_name', 'contact_person_title', 'description', 'document'
    ]


class AdvisorProfileInline(admin.StackedInline):
    """Inline admin for AdvisorProfile"""
    model = AdvisorProfile
    can_delete = False
    verbose_name_plural = 'Advisor Profile'
    fk_name = 'user'
    fields = ['full_name', 'phone_number', 'staff_id', 'document']


class DepartmentHeadProfileInline(admin.StackedInline):
    """Inline admin for DepartmentHeadProfile"""
    model = DepartmentHeadProfile
    can_delete = False
    verbose_name_plural = 'Department Head Profile'
    fk_name = 'user'
    fields = ['document']


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for User model with bulk approval actions"""
    
    list_display = [
        'email', 'role', 'department', 'approval_status',
        'active_status', 'created_at'
    ]
    list_filter = ['role', 'is_active', 'is_approved', 'is_staff', 'created_at', 'department']
    search_fields = ['email']
    ordering = ['-created_at']
    
    # Bulk actions
    actions = ['approve_users', 'reject_users', 'activate_users', 'deactivate_users']
    
    fieldsets = (
        (None, {
            'fields': ('email', 'password')
        }),
        ('Role & Department', {
            'fields': ('role', 'department')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_approved', 'is_staff', 'is_superuser')
        }),
        ('Important dates', {
            'fields': ('last_login', 'created_at', 'updated_at')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'password1', 'password2', 'role', 'department',
                'is_active', 'is_approved', 'is_staff'
            ),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'last_login']
    filter_horizontal = ()
    
    def approval_status(self, obj):
        """Display approval status with color coding"""
        if obj.is_approved:
            return mark_safe('<span style="color: green; font-weight: bold;">✓ Approved</span>')
        return mark_safe('<span style="color: orange; font-weight: bold;">⏳ Pending</span>')
    approval_status.short_description = 'Approval'
    
    def active_status(self, obj):
        """Display active status with color coding"""
        if obj.is_active:
            return mark_safe('<span style="color: green; font-weight: bold;">✓ Active</span>')
        return mark_safe('<span style="color: red; font-weight: bold;">✗ Inactive</span>')
    active_status.short_description = 'Status'
    
    def get_inline_instances(self, request, obj=None):
        """Return appropriate inline based on user role"""
        if not obj:
            return []
        
        inlines = []
        
        if obj.role == 'STUDENT':
            inlines.append(StudentProfileInline(self.model, self.admin_site))
        elif obj.role == 'COMPANY':
            inlines.append(CompanyProfileInline(self.model, self.admin_site))
        elif obj.role == 'ADVISOR':
            inlines.append(AdvisorProfileInline(self.model, self.admin_site))
        elif obj.role == 'DEPARTMENT_HEAD':
            inlines.append(DepartmentHeadProfileInline(self.model, self.admin_site))
        
        return inlines
    
    # BULK ACTIONS
    
    @admin.action(description='✅ Approve selected users')
    def approve_users(self, request, queryset):
        """
        Bulk approve selected users
        Only approves users that are not Admin or UIL
        """
        # Filter out Admin and UIL (they don't need approval)
        approvable_users = queryset.exclude(role__in=['ADMIN', 'UIL'])
        
        with transaction.atomic():
            updated = approvable_users.update(
                is_approved=True,
                is_active=True  # Also activate when approving
            )
        
        if updated > 0:
            self.message_user(
                request,
                f'✅ Successfully approved {updated} user(s).',
                level='success'
            )
        else:
            self.message_user(
                request,
                '⚠️ No users were approved. Admin and UIL accounts cannot be bulk approved.',
                level='warning'
            )
    
    @admin.action(description='❌ Reject selected users')
    def reject_users(self, request, queryset):
        """
        Bulk reject selected users
        Sets is_approved=False and is_active=False
        Only rejects users that are not Admin or UIL
        """
        # Filter out Admin and UIL
        rejectable_users = queryset.exclude(role__in=['ADMIN', 'UIL'])
        
        with transaction.atomic():
            updated = rejectable_users.update(
                is_approved=False,
                is_active=False
            )
        
        if updated > 0:
            self.message_user(
                request,
                f'❌ Successfully rejected {updated} user(s).',
                level='warning'
            )
        else:
            self.message_user(
                request,
                '⚠️ No users were rejected. Admin and UIL accounts cannot be bulk rejected.',
                level='warning'
            )
    
    @admin.action(description='🔓 Activate selected users')
    def activate_users(self, request, queryset):
        """Bulk activate selected users"""
        updated = queryset.update(is_active=True)
        
        self.message_user(
            request,
            f'🔓 Successfully activated {updated} user(s).',
            level='success'
        )
    
    @admin.action(description='🔒 Deactivate selected users')
    def deactivate_users(self, request, queryset):
        """
        Bulk deactivate selected users
        Does not deactivate superusers
        """
        # Don't deactivate superusers
        deactivatable = queryset.exclude(is_superuser=True)
        updated = deactivatable.update(is_active=False)
        
        skipped = queryset.filter(is_superuser=True).count()
        
        if updated > 0:
            self.message_user(
                request,
                f'🔒 Successfully deactivated {updated} user(s).',
                level='warning'
            )
        
        if skipped > 0:
            self.message_user(
                request,
                f'⚠️ Skipped {skipped} superuser(s). Superusers cannot be deactivated.',
                level='warning'
            )


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    """Admin configuration for StudentProfile"""
    
    list_display = [
        'full_name', 'university_id', 'user_email', 'gender',
        'phone_number', 'created_at'
    ]
    list_filter = ['gender', 'created_at', 'user__department']
    search_fields = ['full_name', 'university_id', 'user__email']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Personal Information', {
            'fields': ('full_name', 'phone_number', 'date_of_birth', 'gender')
        }),
        ('Academic Information', {
            'fields': ('university_id', 'skills')
        }),
        ('Document', {
            'fields': ('document',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'


@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    """Admin configuration for CompanyProfile"""
    
    list_display = [
        'company_name', 'city', 'user_email', 'contact_person_name',
        'phone_number', 'created_at'
    ]
    list_filter = ['city', 'created_at', 'user__department']
    search_fields = ['company_name', 'user__email', 'contact_person_name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Company Information', {
            'fields': ('company_name', 'phone_number', 'address', 'city', 'description')
        }),
        ('Contact Person', {
            'fields': ('contact_person_name', 'contact_person_title')
        }),
        ('Document', {
            'fields': ('document',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'


@admin.register(AdvisorProfile)
class AdvisorProfileAdmin(admin.ModelAdmin):
    """Admin configuration for AdvisorProfile"""
    
    list_display = [
        'full_name', 'staff_id', 'user_email', 'phone_number', 'created_at'
    ]
    list_filter = ['created_at', 'user__department']
    search_fields = ['full_name', 'staff_id', 'user__email']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Personal Information', {
            'fields': ('full_name', 'phone_number', 'staff_id')
        }),
        ('Document', {
            'fields': ('document',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'


@admin.register(DepartmentHeadProfile)
class DepartmentHeadProfileAdmin(admin.ModelAdmin):
    """Admin configuration for DepartmentHeadProfile"""
    
    list_display = ['user_email', 'user_department', 'created_at']
    list_filter = ['created_at', 'user__department']
    search_fields = ['user__email']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Document', {
            'fields': ('document',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'
    
    def user_department(self, obj):
        return obj.user.department.name if obj.user.department else 'N/A'
    user_department.short_description = 'Department'