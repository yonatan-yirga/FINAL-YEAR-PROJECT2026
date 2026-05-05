"""
Simple Test Setup - Just creates users and uses existing data
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from apps.advisors.models import AdvisorAssignment

print("=" * 70)
print("Simple Test Setup for Video Calling")
print("=" * 70)

# Create test users
print("\n📝 Creating Test Users...")
student_user, _ = User.objects.get_or_create(
    email='student@test.com',
    defaults={'role': 'STUDENT'}
)
student_user.set_password('test123')
student_user.save()
print(f"✅ Student: {student_user.email}")

advisor_user, _ = User.objects.get_or_create(
    email='advisor@test.com',
    defaults={'role': 'ADVISOR'}
)
advisor_user.set_password('test123')
advisor_user.save()
print(f"✅ Advisor: {advisor_user.email}")

company_user, _ = User.objects.get_or_create(
    email='company@test.com',
    defaults={'role': 'COMPANY'}
)
company_user.set_password('test123')
company_user.save()
print(f"✅ Company: {company_user.email}")

# Check for existing assignments
print("\n📊 Checking Existing Data...")
assignments = AdvisorAssignment.objects.all()[:5]
print(f"Total assignments in database: {AdvisorAssignment.objects.count()}")

if assignments:
    print("\nExisting assignments:")
    for a in assignments:
        student_name = getattr(a.student, 'student_profile', None)
        student_name = student_name.full_name if student_name else a.student.email
        
        advisor_name = getattr(a.advisor, 'advisor_profile', None)
        advisor_name = advisor_name.full_name if advisor_name else a.advisor.email
        
        internship_title = a.internship.title if a.internship else 'No internship'
        
        print(f"  - {student_name} ↔ {advisor_name} ({internship_title})")

print("\n" + "=" * 70)
print("✅ Test Users Created!")
print("=" * 70)
print("\n🔑 Login Credentials (All passwords: test123):")
print("-" * 70)
print("STUDENT:")
print("  Email: student@test.com")
print("  Password: test123")
print("  URL: http://localhost:5173/student/login")
print()
print("ADVISOR:")
print("  Email: advisor@test.com")
print("  Password: test123")
print("  URL: http://localhost:5173/advisor/login")
print()
print("COMPANY:")
print("  Email: company@test.com")
print("  Password: test123")
print("  URL: http://localhost:5173/company/login")
print()
print("=" * 70)
print("🎯 Next Steps:")
print("=" * 70)
print("1. Login with one of the EXISTING users that have assignments")
print("2. Or use the test users if they have profiles and assignments")
print("3. Go to Messages page")
print("4. Test video calling!")
print("=" * 70)
