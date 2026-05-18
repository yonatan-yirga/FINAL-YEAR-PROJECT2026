"""
Script to fix internship status and create test student
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
print("CREATING TEST STUDENT WITH ACCEPTED APPLICATION")
print("=" * 60)

# Get Computer Science department
cs_dept = Department.objects.get(name="Computer Science")
print(f"\n✅ Found department: {cs_dept.name}")

# Get first OPEN internship
internship = Internship.objects.filter(department=cs_dept, status='OPEN').first()
if internship:
    print(f"\n📝 Found internship: {internship.title}")
    print(f"   Status: {internship.status}")
    print(f"   Company: {internship.get_company_name()}")
else:
    print("\n❌ No OPEN internships found!")
    exit(1)

# Create test student
student_email = f"test_student_{int(timezone.now().timestamp())}@test.com"

# Create user
student_user = User.objects.create_user(
    email=student_email,
    password='testpass123',
    role='STUDENT',
    is_approved=True,
    department=cs_dept
)

# Create student profile
import random
unique_id = random.randint(1000, 9999)
StudentProfile.objects.create(
    user=student_user,
    full_name="Test Student Needing Advisor",
    university_id=f"CS/TEST/{timezone.now().year}/{unique_id}",
    phone_number="+251911111111",
    date_of_birth="2000-01-01",
    year_of_study=3,
    is_eligible=True,
    batch=f"Batch {timezone.now().year}"
)

print(f"\n✅ Created student: Test Student Needing Advisor")
print(f"   Email: {student_email}")

# Create application directly using raw SQL to bypass validation
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("""
        INSERT INTO applications (student_id, internship_id, status, cover_letter, applied_at, reviewed_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    """, [
        student_user.id,
        internship.id,
        'ACCEPTED',
        'Test application for advisor assignment',
        timezone.now(),
        timezone.now(),
        timezone.now()
    ])
    app_id = cursor.fetchone()[0]

print(f"✅ Created ACCEPTED application (ID: {app_id})")

print("\n" + "=" * 60)
print("✅ SUCCESS!")
print("=" * 60)
print(f"\nNOW GO TO: http://localhost:5173/department/assign-advisor")
print(f"You should see 'Test Student Needing Advisor' in the list!")
print(f"\nStudent Email: {student_email}")
print(f"Password: testpass123")
print()
