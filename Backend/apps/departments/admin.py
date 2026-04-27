"""
Django Admin Configuration for Department Model
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from .models import Department


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    """Admin configuration for Department model"""
    
    list_display = [
        'name', 'head_name', 'email', 'phone_number',
        'user_count', 'student_count', 'advisor_count', 'company_count', 'created_at'
    ]
    list_filter = ['created_at']
    search_fields = ['name', 'head_name', 'email']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Department Information', {
            'fields': ('name', 'head_name')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone_number')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def user_count(self, obj):
        """Display total user count"""
        count = obj.get_user_count()
        return format_html(
            '<span style="font-weight: bold;">{}</span>', count
        )
    user_count.short_description = 'Total Users'
    
    def student_count(self, obj):
        """Display student count"""
        count = obj.get_student_count()
        return format_html(
            '<span style="color: blue; font-weight: bold;">{} students</span>', count
        )
    student_count.short_description = 'Students'
    
    def advisor_count(self, obj):
        """Display advisor count"""
        count = obj.get_advisor_count()
        return format_html(
            '<span style="color: green; font-weight: bold;">{} advisors</span>', count
        )
    advisor_count.short_description = 'Advisors'
    
    def company_count(self, obj):
        """Display company count"""
        count = obj.get_company_count()
        return format_html(
            '<span style="color: orange; font-weight: bold;">{} companies</span>', count
        )
    company_count.short_description = 'Companies'