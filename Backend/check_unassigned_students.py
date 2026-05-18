"""
Script to check unassigned students status
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.applications.models import Application
from apps.advisors.models import AdvisorAssignment
from apps.accounts.models import User

print("=" * 60)
print("CHECKING UNASSIGNED STUDENTS STATUS")
print("=" * 60)

# Check accepted applications
accepted_apps = Application.objects.filter(status='ACCEPTED')
print(f"\n1. Total ACCEPTED applications: {accepted_apps.count()}")

if accepted_apps.count() > 0:
    print("\nAccepted Applications:")
    for app in accepted_apps[:5]:  # Show first 5
        print(f"  - Student: {app.student.get_full_name()} ({app.student.email})")
        print(f"    Internship: {app.internship.title}")
        print(f"    Company: {app.internship.get_company_name()}")
        print(f"    Department: {app.internship.department.name if app.internship.department else 'None'}")
        print()

# Check advisor assignments
assignments = AdvisorAssignment.objects.all()
print(f"\n2. Total advisor assignments: {assignments.count()}")
print(f"   - Active assignments: {AdvisorAssignment.objects.filter(is_active=True).count()}")
print(f"   - Completed assignments: {AdvisorAssignment.objects.filter(is_active=False).count()}")

# Check students with assignments
assigned_student_ids = AdvisorAssignment.objects.values_list('student_id', flat=True)
print(f"\n3. Students with ANY assignment (active or completed): {len(set(assigned_student_ids))}")

# Check unassigned students (students with accepted apps but no assignment)
unassigned_apps = accepted_apps.exclude(student_id__in=assigned_student_ids)
print(f"\n4. Students with ACCEPTED apps but NO advisor: {unassigned_apps.count()}")

if unassigned_apps.count() > 0:
    print("\nUnassigned Students:")
    for app in unassigned_apps[:10]:  # Show first 10
        print(f"  - {app.student.get_full_name()} ({app.student.email})")
        print(f"    Application ID: {app.id}")
        print(f"    Internship: {app.internship.title}")
        print(f"    Company: {app.internship.get_company_name()}")
        print()
else:
    print("\n⚠️  NO UNASSIGNED STUDENTS FOUND!")
    print("\nPossible reasons:")
    print("  1. All students with accepted applications already have advisors")
    print("  2. No students have accepted applications yet")
    print("  3. Students need to apply and get accepted first")

# Check all applications by status
print("\n5. Applications by status:")
from django.db.models import Count
status_counts = Application.objects.values('status').annotate(count=Count('id'))
for item in status_counts:
    print(f"   - {item['status']}: {item['count']}")

# Check students by role
print("\n6. Users by role:")
role_counts = User.objects.filter(is_approved=True).values('role').annotate(count=Count('id'))
for item in role_counts:
    print(f"   - {item['role']}: {item['count']}")

print("\n" + "=" * 60)
print("RECOMMENDATIONS:")
print("=" * 60)

if accepted_apps.count() == 0:
    print("\n❌ No accepted applications found!")
    print("   → Students need to apply for internships")
    print("   → Companies need to accept applications")
elif unassigned_apps.count() == 0:
    print("\n✅ All students with accepted applications have advisors!")
    print("   → System is working correctly")
    print("   → Wait for more students to get accepted")
else:
    print(f"\n✅ Found {unassigned_apps.count()} students ready for advisor assignment!")
    print("   → Go to /department/assign-advisor to assign advisors")

print()
