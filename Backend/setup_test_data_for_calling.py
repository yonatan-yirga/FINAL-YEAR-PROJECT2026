"""
Complete Test Data Setup for Video Calling Feature
Creates users, profiles, internships, and advisor assignments
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User, StudentProfile, AdvisorProfile, CompanyProfile
from apps.advisors.models import AdvisorAssignment
from apps.internships.models import Internship
from django.utils import timezone

print("=" * 70)
print("Setting Up Complete Test Data for Video Calling Feature")
print("=" * 70)

# Step 1: Create or get users
print("\n📝 Step 1: Creating Users...")
student_user, created = User.objects.get_or_create(
    email='student@test.com',
    defaults={'role': 'STUDENT'}
)
if created or True:  # Always reset password
    student_user.set_password('test123')
    student_user.role = 'STUDENT'
    student_user.save()
    print(f"✅ Student: {student_user.email}")

advisor_user, created = User.objects.get_or_create(
    email='advisor@test.com',
    defaults={'role': 'ADVISOR'}
)
if created or True:
    advisor_user.set_password('test123')
    advisor_user.role = 'ADVISOR'
    advisor_user.save()
    print(f"✅ Advisor: {advisor_user.email}")

company_user, created = User.objects.get_or_create(
    email='company@test.com',
    defaults={'role': 'COMPANY'}
)
if created or True:
    company_user.set_password('test123')
    company_user.role = 'COMPANY'
    company_user.save()
    print(f"✅ Company: {company_user.email}")

# Step 2: Create profiles
print("\n📝 Step 2: Creating Profiles...")

student_profile, created = StudentProfile.objects.get_or_create(
    user=student_user,
    defaults={
        'full_name': 'John Doe',
        'university_id': 'STU001TEST',
        'phone_number': '+1234567890',
        'date_of_birth': '2000-01-01',
        'gender': 'MALE',
        'skills': 'Python, JavaScript, React',
        'headline': 'Computer Science Student',
        'about': 'Passionate about software development',
        'location': 'Test City, Test Country',
    }
)
if not created:
    student_profile.full_name = 'John Doe'
    student_profile.save()
print(f"✅ Student Profile: {student_profile.full_name}")

advisor_profile, created = AdvisorProfile.objects.get_or_create(
    user=advisor_user,
    defaults={
        'full_name': 'Jane Smith',
        'staff_id': 'ADV001TEST',
        'phone_number': '+1234567891',
        'document': 'uploads/advisors/test_doc.pdf',  # Placeholder
        'max_students': 15,
    }
)
if not created:
    advisor_profile.full_name = 'Jane Smith'
    advisor_profile.save()
print(f"✅ Advisor Profile: {advisor_profile.full_name}")

company_profile, created = CompanyProfile.objects.get_or_create(
    user=company_user,
    defaults={
        'company_name': 'Tech Corp',
        'phone_number': '+1234567892',
        'address': '456 Business Ave',
        'city': 'Tech City',
        'contact_person_name': 'Mike Johnson',
        'contact_person_title': 'HR Manager',
        'description': 'A leading technology company',
        'document': 'uploads/companies/test_doc.pdf',  # Placeholder
    }
)
if not created:
    company_profile.company_name = 'Tech Corp'
    company_profile.save()
print(f"✅ Company Profile: {company_profile.company_name}")

# Step 3: Create internship
print("\n📝 Step 3: Creating Internship...")
internship, created = Internship.objects.get_or_create(
    company=company_user,
    title='Software Engineering Internship',
    defaults={
        'description': 'Work on exciting projects with our development team',
        'requirements': 'Python, JavaScript, React',
        'location': 'Tech City',
        'duration': '3 months',
        'stipend': 1000.00,
        'application_deadline': timezone.now() + timezone.timedelta(days=30),
        'start_date': timezone.now() + timezone.timedelta(days=60),
        'is_active': True,
        'positions_available': 5,
    }
)
print(f"✅ Internship: {internship.title}")

# Step 4: Create advisor assignment
print("\n📝 Step 4: Creating Advisor Assignment...")
assignment, created = AdvisorAssignment.objects.get_or_create(
    student=student_user,
    advisor=advisor_user,
    internship=internship,
    defaults={
        'is_active': True,
    }
)
if not created:
    assignment.is_active = True
    assignment.save()
print(f"✅ Assignment: {student_profile.full_name} ↔ {advisor_profile.full_name}")

# Summary
print("\n" + "=" * 70)
print("✅ Setup Complete!")
print("=" * 70)
print("\n📊 Test Data Summary:")
print("-" * 70)
print(f"Student: {student_profile.full_name} ({student_user.email})")
print(f"Advisor: {advisor_profile.full_name} ({advisor_user.email})")
print(f"Company: {company_profile.company_name} ({company_user.email})")
print(f"Internship: {internship.title}")
print(f"Assignment ID: {assignment.id}")
print()
print("🔑 Login Credentials (All passwords: test123):")
print("-" * 70)
print("STUDENT:")
print(f"  Email: {student_user.email}")
print("  Password: test123")
print("  URL: http://localhost:5173/student/login")
print()
print("ADVISOR:")
print(f"  Email: {advisor_user.email}")
print("  Password: test123")
print("  URL: http://localhost:5173/advisor/login")
print()
print("COMPANY:")
print(f"  Email: {company_user.email}")
print("  Password: test123")
print("  URL: http://localhost:5173/company/login")
print()
print("=" * 70)
print("🎯 Next Steps:")
print("=" * 70)
print("1. Login as Student in Browser 1")
print("2. Go to Messages page")
print("3. You should see conversation with Jane Smith [ADVISOR]")
print()
print("4. Login as Advisor in Browser 2 (incognito mode)")
print("5. Go to Messages page")
print("6. You should see conversation with John Doe [STUDENT]")
print()
print("7. Click video/audio call button to test!")
print("=" * 70)
