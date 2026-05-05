"""
Create Test Users for Video Calling Feature Testing
Run this script to create test users with known passwords
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User

print("=" * 60)
print("Creating Test Users for Video Calling")
print("=" * 60)

# Test users configuration
users = [
    {'email': 'student@test.com', 'password': 'test123', 'role': 'STUDENT'},
    {'email': 'advisor@test.com', 'password': 'test123', 'role': 'ADVISOR'},
    {'email': 'company@test.com', 'password': 'test123', 'role': 'COMPANY'},
]

created_count = 0
updated_count = 0

for user_data in users:
    user, created = User.objects.get_or_create(
        email=user_data['email'],
        defaults={'role': user_data['role']}
    )
    
    if created:
        user.set_password(user_data['password'])
        user.save()
        print(f"✅ Created: {user.email} ({user.role})")
        created_count += 1
    else:
        # Update password for existing user
        user.set_password(user_data['password'])
        user.role = user_data['role']
        user.save()
        print(f"🔄 Updated: {user.email} ({user.role}) - password reset")
        updated_count += 1

print("\n" + "=" * 60)
print("✅ Test Users Ready!")
print("=" * 60)
print(f"\nCreated: {created_count} | Updated: {updated_count}")
print("\nLogin Credentials:")
print("-" * 60)
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
print("=" * 60)
print("Next Steps:")
print("1. Login as Student in Browser 1")
print("2. Login as Advisor in Browser 2 (incognito)")
print("3. Test video calling feature!")
print("=" * 60)
