import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from django.contrib.auth import authenticate

print("=" * 70)
print("Login Diagnostic Tool")
print("=" * 70)

# Get user input
email = input("\nEnter the email you're trying to login with: ")

# Check if user exists
user = User.objects.filter(email=email).first()

if not user:
    print(f"\n❌ PROBLEM: User '{email}' does not exist in database!")
    print("\n📋 Available users:")
    for u in User.objects.all()[:15]:
        print(f"  - {u.email} ({u.role})")
    print("\n💡 Solution: Use one of the emails above")
    exit()

print(f"\n✅ User found in database")
print("=" * 70)
print("User Details:")
print(f"  Email: {user.email}")
print(f"  Role: {user.role}")
print(f"  Is Active: {user.is_active}")
print(f"  Is Approved: {user.is_approved}")
print(f"  Has Password: {bool(user.password)}")
print(f"  Department: {user.department}")
print("=" * 70)

# Check for issues
issues = []
if not user.is_active:
    issues.append("❌ User is INACTIVE")
if not user.is_approved and user.role not in ['ADMIN', 'UIL']:
    issues.append("❌ User is NOT APPROVED")
if not user.password:
    issues.append("❌ User has NO PASSWORD set")

if issues:
    print("\n🚨 PROBLEMS FOUND:")
    for issue in issues:
        print(f"  {issue}")
    
    print("\n🔧 FIXING ISSUES...")
    
    if not user.is_active:
        user.is_active = True
        print("  ✅ Set is_active = True")
    
    if not user.is_approved:
        user.is_approved = True
        print("  ✅ Set is_approved = True")
    
    if not user.password:
        user.set_password('test123')
        print("  ✅ Set password = 'test123'")
    
    user.save()
    print("\n✅ User fixed! Try logging in again.")
else:
    print("\n✅ No issues found with user account")

# Test password
print("\n" + "=" * 70)
password = input("Enter the password you're trying to use: ")

if user.check_password(password):
    print("✅ Password is CORRECT!")
else:
    print("❌ Password is INCORRECT!")
    print("\n🔧 Resetting password to 'test123'...")
    user.set_password('test123')
    user.save()
    print("✅ Password reset! Use 'test123' to login")
    password = 'test123'

# Test Django authenticate
print("\n" + "=" * 70)
print("Testing Django authenticate()...")
auth_user = authenticate(username=email, password=password)

if auth_user:
    print("✅ Django authenticate() SUCCESS!")
else:
    print("❌ Django authenticate() FAILED!")
    print("This means Django's authentication backend is rejecting the credentials.")

# Final summary
print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
print(f"Email: {email}")
print(f"Password to use: test123")
print(f"Is Active: {user.is_active}")
print(f"Is Approved: {user.is_approved}")
print(f"Can Login: {user.is_active and user.is_approved}")
print("=" * 70)

if user.is_active and user.is_approved:
    print("\n✅ User should be able to login now!")
    print(f"\n🔑 Login Credentials:")
    print(f"   Email: {email}")
    print(f"   Password: test123")
    print(f"\n🌐 Login URL:")
    if user.role == 'STUDENT':
        print(f"   http://localhost:5173/student/login")
    elif user.role == 'ADVISOR':
        print(f"   http://localhost:5173/advisor/login")
    elif user.role == 'COMPANY':
        print(f"   http://localhost:5173/company/login")
    elif user.role == 'ADMIN':
        print(f"   http://localhost:5173/admin/login")
    else:
        print(f"   http://localhost:5173/login")
else:
    print("\n❌ User still cannot login. Please run this script again.")
