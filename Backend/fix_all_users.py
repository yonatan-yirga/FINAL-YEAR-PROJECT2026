import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User

print("=" * 70)
print("Fixing All Users for Testing")
print("=" * 70)

# Get all users
users = User.objects.all()
print(f"\nTotal users in database: {users.count()}")

fixed_count = 0
for user in users:
    needs_fix = False
    
    if not user.is_active:
        user.is_active = True
        needs_fix = True
    
    if not user.is_approved:
        user.is_approved = True
        needs_fix = True
    
    if needs_fix:
        user.save()
        fixed_count += 1
        print(f"✅ Fixed: {user.email} ({user.role})")

print(f"\n✅ Fixed {fixed_count} users")
print("\n" + "=" * 70)
print("Setting password 'test1234' for first 5 users of each role...")
print("=" * 70)

# Set password for test users
roles = ['STUDENT', 'ADVISOR', 'COMPANY', 'ADMIN']
for role in roles:
    users_of_role = User.objects.filter(role=role)[:5]
    print(f"\n{role}S:")
    for user in users_of_role:
        user.set_password('test1234')
        user.save()
        print(f"  ✅ {user.email} - password: test1234")

print("\n" + "=" * 70)
print("✅ All Done!")
print("=" * 70)
print("\n🔑 You can now login with any of the above emails")
print("   Password: test1234")
print("\n🌐 Login URLs:")
print("   Student: http://localhost:5173/student/login")
print("   Advisor: http://localhost:5173/advisor/login")
print("   Company: http://localhost:5173/company/login")
print("   Admin: http://localhost:5173/admin/login")
print("=" * 70)
