"""
Script to create a test student with accepted application but no advisor
This will allow testing the assign advisor feature
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User, StudentProfile
from apps.departments.models import Department
from apps.internships.models import Internship
from apps.applications.models import Application
from django.utils import timezone

print("=" * 60)
print("CREATING TEST UNASSIGNED STUDENT")
print("=" * 60)

# Get Computer Science department
try:
    cs_dept = Department.objects.get(name="Computer Science")
    print(f"\n✅ Found department: {cs_dept.name}")
except Department.DoesNotExist:
    print("\n❌ Computer Science department not found!")
    exit(1)

# Get an active internship in CS department
internship = Internship.objects.filter(
    department=cs_dept,
    status='ACTIVE'
).first()

if not internship:
    print("\n❌ No active internships found in Computer Science department!")
    print("   Please create an internship first.")
    exit(1)

print(f"✅ Found internship: {internship.title} at {internship.get_company_name()}")

# Create a test student
student_email = f"test_student_{timezone.now().timestamp()}@test.com"

try:
    # Create user
    student_user = User.objects.create_user(
        email=student_email,
        password='testpass123',
        role='STUDENT',
        is_approved=True,
        department=cs_dept
    )
    
    # Create student profile
    StudentProfile.objects.create(
        user=student_user,
        full_name="Test Student for Advisor Assignment",
        university_id=f"CS/TEST/{timezone.now().year}/001",
        phone_number="+251911111111",
        year_of_study=3,
        is_eligible=True
    )
    
    print(f"\n✅ Created student: {student_user.email}")
    
    # Create an accepted application
    application = Application.objects.create(
        student=student_user,
        internship=internship,
        status='ACCEPTED',
        cover_letter="Test application for advisor assignment",
        reviewed_at=timezone.now()
    )
    
    print(f"✅ Created ACCEPTED application (ID: {application.id})")
    
    print("\n" + "=" * 60)
    print("SUCCESS!")
    print("=" * 60)
    print(f"\nTest student created successfully!")
    print(f"  Email: {student_email}")
    print(f"  Department: {cs_dept.name}")
    print(f"  Internship: {internship.title}")
    print(f"  Application Status: ACCEPTED")
    print(f"\nNow go to /department/assign-advisor to see this student!")
    print()
    
except Exception as e:
    print(f"\n❌ Error creating test student: {str(e)}")
    import traceback
    traceback.print_exc()
