"""
Script to show unassigned students grouped by department
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.applications.models import Application
from apps.advisors.models import AdvisorAssignment
from collections import defaultdict

print("=" * 60)
print("UNASSIGNED STUDENTS BY DEPARTMENT")
print("=" * 60)

# Get accepted applications
accepted_apps = Application.objects.filter(status='ACCEPTED').select_related(
    'student', 'internship__company', 'internship__department'
)

# Exclude students with assignments
assigned_student_ids = set(AdvisorAssignment.objects.values_list('student_id', flat=True))

# Group by department
by_dept = defaultdict(list)

for app in accepted_apps:
    if app.student.id not in assigned_student_ids:
        dept_name = app.internship.department.name if app.internship.department else "No Department"
        by_dept[dept_name].append(app)

if not by_dept:
    print("\n✅ No unassigned students found!")
    print("   All students with accepted applications have advisors.")
else:
    for dept_name, apps in by_dept.items():
        print(f"\n📁 {dept_name}")
        print(f"   Unassigned students: {len(apps)}")
        print()
        for app in apps:
            print(f"   👤 {app.student.get_full_name()}")
            print(f"      Email: {app.student.email}")
            print(f"      Application ID: {app.id}")
            print(f"      Internship: {app.internship.title}")
            print(f"      Company: {app.internship.get_company_name()}")
            print()

print("=" * 60)
print("SOLUTION:")
print("=" * 60)
print("\nTo assign advisors to these students:")
print("1. Log in as a Department Head for the respective department")
print("2. Go to /department/assign-advisor")
print("3. Select student and advisor, then assign")
print("\nOR")
print("\nIf you're logged in as the wrong department head:")
print("- Log out and log in as the correct department head")
print("- Or create a department head for the missing department")
print()
