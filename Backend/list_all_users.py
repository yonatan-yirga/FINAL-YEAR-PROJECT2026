import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User

print("=" * 80)
print("ALL REGISTERED USERS")
print("=" * 80)

# Get all users
users = User.objects.all().order_by('role', 'email')
print(f"\nTotal users in database: {users.count()}")

# Group by role
roles = ['ADMIN', 'UIL', 'DEPARTMENT_HEAD', 'ADVISOR', 'STUDENT', 'COMPANY']

for role in roles:
    users_of_role = User.objects.filter(role=role).order_by('email')
    if users_of_role.exists():
        print(f"\n{'=' * 80}")
        print(f"{role}S ({users_of_role.count()} users)")
        print(f"{'=' * 80}")
        for user in users_of_role:
            status = "✅ Active" if user.is_active else "❌ Inactive"
            approved = "✅ Approved" if user.is_approved else "⚠️ Not Approved"
            print(f"  📧 {user.email:<40} {status:<15} {approved}")

print("\n" + "=" * 80)
print("RESETTING ALL PASSWORDS TO 'test1234'")
print("=" * 80)

# Reset all passwords
for user in User.objects.all():
    user.set_password('test1234')
    user.is_active = True
    user.is_approved = True
    user.save()

print("\n✅ All passwords have been reset to: test1234")
print("✅ All users have been activated and approved")

print("\n" + "=" * 80)
print("LOGIN CREDENTIALS")
print("=" * 80)
print("\n🔑 Password for ALL users: test1234")
print("\n📧 User Emails by Role:")

for role in roles:
    users_of_role = User.objects.filter(role=role).order_by('email')
    if users_of_role.exists():
        print(f"\n{role}S:")
        for user in users_of_role:
            print(f"  • {user.email}")

print("\n" + "=" * 80)
print("🌐 LOGIN URLS")
print("=" * 80)
print("  Student:  http://localhost:5173/student/login")
print("  Advisor:  http://localhost:5173/advisor/login")
print("  Company:  http://localhost:5173/company/login")
print("  Admin:    http://localhost:5173/admin/login")
print("=" * 80)
