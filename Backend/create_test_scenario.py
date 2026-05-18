"""
Script to create a complete test scenario for advisor assignment
Creates: Company -> Internship -> Student -> Accepted Application
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User, StudentProfile, CompanyProfile
from apps.departments.models import Department
from apps.internships.models import Internship
from apps.applications.models import Application
from django.utils import timezone
from datetime import timedelta

print("=" * 60)
print("CREATING COMPLETE TEST SCENARIO")
print("=" * 60)

# Get Computer Science department
try:
    cs_dept = Department.objects.get(name="Computer Science")
    print(f"\n✅ Found department: {cs_dept.name}")
except Department.DoesNotExist:
    print("\n❌ Computer Science department not found!")
    exit(1)

# Check for existing internships
existing_internships = Internship.objects.filter(department=cs_dept)
print(f"\n📊 Existing internships in {cs_dept.name}: {existing_internships.count()}")

if existing_internships.exists():
    print("\nExisting internships:")
    for intern in existing_internships[:5]:
        print(f"  - {intern.title} ({intern.status}) at {intern.get_company_name()}")
    
    # Use first internship
    internship = existing_internships.first()
    print(f"\n✅ Using existing internship: {internship.title}")
else:
    # Create a test company and internship
    print("\n📝 Creating test company and internship...")
    
    # Create company user
    company_email = f"test_company_{int(timezone.now().timestamp())}@test.com"
    company_user = User.objects.create_user(
        email=company_email,
        password='testpass123',
        role='COMPANY',
        is_approved=True,
        department=cs_dept
    )
    
    # Create company profile
    CompanyProfile.objects.create(
        user=company_user,
        company_name="Test Tech Company",
        contact_person_name="John Manager",
        phone_number="+251922222222",
        city="Addis Ababa",
        address="Test Address 123"
    )
    
    print(f"✅ Created company: {company_email}")
    
    # Create internship
    internship = Internship.objects.create(
        company=company_user,
        department=cs_dept,
        title="Software Developer Intern",
        description="Test internship for advisor assignment testing",
        requirements="Basic programming skills",
        location="Addis Ababa",
        duration_months=6,
        stipend_amount=5000.00,
        available_slots=5,
        start_date=timezone.now().date(),
        end_date=(timezone.now() + timedelta(days=180)).date(),
        application_deadline=(timezone.now() + timedelta(days=30)).date(),
        status='ACTIVE'
    )
    
    print(f"✅ Created internship: {internship.title}")

# Create test student
student_email = f"test_student_{int(timezone.now().timestamp())}@test.com"

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
        full_name="Test Student Needing Advisor",
        university_id=f"CS/TEST/{timezone.now().year}/001",
        phone_number="+251911111111",
        date_of_birth="2000-01-01",
        year_of_study=3,
        is_eligible=True,
        batch=f"Batch {timezone.now().year}"
    )
    
    print(f"\n✅ Created student: Test Student Needing Advisor")
    print(f"   Email: {student_email}")
    
    # Create an accepted application
    application = Application.objects.create(
        student=student_user,
        internship=internship,
        status='ACCEPTED',
        cover_letter="Test application for advisor assignment feature testing",
        applied_at=timezone.now(),
        reviewed_at=timezone.now()
    )
    
    print(f"✅ Created ACCEPTED application (ID: {application.id})")
    
    print("\n" + "=" * 60)
    print("✅ SUCCESS! TEST SCENARIO CREATED")
    print("=" * 60)
    print(f"\nStudent Details:")
    print(f"  Name: Test Student Needing Advisor")
    print(f"  Email: {student_email}")
    print(f"  Password: testpass123")
    print(f"  Department: {cs_dept.name}")
    print(f"  University ID: CS/TEST/{timezone.now().year}/001")
    print(f"\nInternship Details:")
    print(f"  Title: {internship.title}")
    print(f"  Company: {internship.get_company_name()}")
    print(f"  Status: {internship.status}")
    print(f"\nApplication Details:")
    print(f"  ID: {application.id}")
    print(f"  Status: ACCEPTED")
    print(f"\n🎯 NOW GO TO: http://localhost:5173/department/assign-advisor")
    print(f"   You should see 'Test Student Needing Advisor' in the list!")
    print()
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
