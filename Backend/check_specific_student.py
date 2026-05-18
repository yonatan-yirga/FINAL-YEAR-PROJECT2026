"""
Script to check if a specific student has an advisor
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from apps.advisors.models import AdvisorAssignment
from apps.applications.models import Application

print("=" * 60)
print("CHECKING STUDENT: Hana Grima")
print("=" * 60)

# Search for student by name
students = User.objects.filter(
    role='STUDENT',
    student_profile__full_name__icontains='hana'
)

if not students.exists():
    print("\n❌ No student found with name containing 'hana'")
    print("\nSearching all students...")
    all_students = User.objects.filter(role='STUDENT', is_approved=True)[:10]
    print(f"\nFirst 10 students:")
    for s in all_students:
        profile = getattr(s, 'student_profile', None)
        name = profile.full_name if profile else s.email
        print(f"  - {name} ({s.email})")
else:
    for student in students:
        profile = getattr(student, 'student_profile', None)
        name = profile.full_name if profile else student.email
        
        print(f"\n👤 Student: {name}")
        print(f"   Email: {student.email}")
        print(f"   ID: {student.id}")
        print(f"   Department: {student.department.name if student.department else 'None'}")
        
        # Check for advisor assignments
        assignments = AdvisorAssignment.objects.filter(student=student)
        active_assignments = assignments.filter(is_active=True)
        
        print(f"\n📋 Advisor Assignments:")
        print(f"   Total assignments: {assignments.count()}")
        print(f"   Active assignments: {active_assignments.count()}")
        
        if active_assignments.exists():
            for assignment in active_assignments:
                advisor = assignment.advisor
                advisor_profile = getattr(advisor, 'advisor_profile', None)
                advisor_name = advisor_profile.full_name if advisor_profile else advisor.email
                print(f"\n   ✅ HAS ACTIVE ADVISOR:")
                print(f"      Advisor: {advisor_name}")
                print(f"      Email: {advisor.email}")
                print(f"      Assigned: {assignment.assigned_at}")
        else:
            print(f"\n   ❌ NO ACTIVE ADVISOR")
        
        # Check for applications
        applications = Application.objects.filter(student=student)
        accepted_apps = applications.filter(status='ACCEPTED')
        
        print(f"\n📝 Applications:")
        print(f"   Total applications: {applications.count()}")
        print(f"   Accepted applications: {accepted_apps.count()}")
        
        if accepted_apps.exists():
            for app in accepted_apps:
                print(f"\n   Application ID: {app.id}")
                print(f"   Internship: {app.internship.title}")
                print(f"   Company: {app.internship.get_company_name()}")
                print(f"   Status: {app.status}")
        
        # Determine if student should appear in "Students Awaiting Assignment"
        print(f"\n🎯 SHOULD APPEAR IN 'STUDENTS AWAITING ASSIGNMENT'?")
        
        has_accepted_app = accepted_apps.exists()
        has_no_advisor = not active_assignments.exists()
        
        print(f"   Has accepted application: {'✅ YES' if has_accepted_app else '❌ NO'}")
        print(f"   Has no advisor: {'✅ YES' if has_no_advisor else '❌ NO'}")
        
        if has_accepted_app and has_no_advisor:
            print(f"\n   ✅ YES - This student SHOULD appear in the list")
        else:
            print(f"\n   ❌ NO - This student should NOT appear in the list")
            if not has_accepted_app:
                print(f"      Reason: No accepted application")
            if not has_no_advisor:
                print(f"      Reason: Already has an advisor assigned")

print("\n" + "=" * 60)
