"""
Test script to check advisor students endpoint
Run with: python manage.py shell < test_advisor_students.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from apps.advisors.models import AdvisorAssignment

print("\n=== Testing Advisor Students Endpoint ===\n")

# Find advisors
advisors = User.objects.filter(role='ADVISOR', is_approved=True)
print(f"Found {advisors.count()} advisors")

for advisor in advisors[:3]:  # Test first 3 advisors
    print(f"\n--- Advisor: {advisor.email} (ID: {advisor.id}) ---")
    
    # Check if advisor has profile
    if hasattr(advisor, 'advisor_profile'):
        print(f"  Name: {advisor.advisor_profile.full_name}")
        print(f"  Staff ID: {advisor.advisor_profile.staff_id}")
    else:
        print("  WARNING: No advisor_profile found!")
    
    # Get assignments
    assignments = AdvisorAssignment.objects.filter(advisor=advisor)
    print(f"  Total assignments: {assignments.count()}")
    
    for i, assignment in enumerate(assignments[:2], 1):  # Show first 2
        print(f"\n  Assignment {i}:")
        print(f"    Student: {assignment.student.email}")
        print(f"    Active: {assignment.is_active}")
        print(f"    Assigned at: {assignment.assigned_at}")
        
        # Check student profile
        if hasattr(assignment.student, 'student_profile'):
            print(f"    Student name: {assignment.student.student_profile.full_name}")
        else:
            print(f"    WARNING: Student has no profile!")
        
        # Check internship
        if assignment.internship:
            print(f"    Internship: {assignment.internship.title}")
            if assignment.internship.company:
                if hasattr(assignment.internship.company, 'company_profile'):
                    print(f"    Company: {assignment.internship.company.company_profile.company_name}")
                else:
                    print(f"    WARNING: Company has no profile!")
        else:
            print(f"    WARNING: No internship linked!")
            if assignment.application and assignment.application.internship:
                print(f"    Internship via application: {assignment.application.internship.title}")

print("\n=== Test Complete ===\n")
