"""
Script to check department head's department
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from apps.applications.models import Application
from apps.advisors.models import AdvisorAssignment

print("=" * 60)
print("DEPARTMENT HEAD ANALYSIS")
print("=" * 60)

# Get all department heads
dept_heads = User.objects.filter(role='DEPARTMENT_HEAD', is_approved=True)
print(f"\nTotal Department Heads: {dept_heads.count()}")

for dh in dept_heads:
    print(f"\n{dh.get_full_name()} ({dh.email})")
    print(f"  Department: {dh.department.name if dh.department else 'None'}")
    
    if dh.department:
        # Check unassigned students in this department
        dept = dh.department
        
        # Get accepted applications in this department
        accepted_apps = Application.objects.filter(
            status='ACCEPTED',
            internship__department=dept
        )
        
        # Exclude students with assignments
        assigned_student_ids = AdvisorAssignment.objects.values_list('student_id', flat=True)
        unassigned_apps = accepted_apps.exclude(student_id__in=assigned_student_ids)
        
        print(f"  Accepted applications in dept: {accepted_apps.count()}")
        print(f"  Unassigned students in dept: {unassigned_apps.count()}")
        
        if unassigned_apps.count() > 0:
            print(f"  Unassigned students:")
            for app in unassigned_apps:
                print(f"    - {app.student.get_full_name()} ({app.student.email})")
                print(f"      Internship: {app.internship.title}")
                print(f"      Company: {app.internship.get_company_name()}")

print("\n" + "=" * 60)
