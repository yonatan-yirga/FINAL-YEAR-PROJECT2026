import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User

# Check the user you're trying to login with
email = input("Enter email to check: ")
user = User.objects.filter(email=email).first()

if user:
    print(f"\n✅ User found!")
    print(f"Email: {user.email}")
    print(f"Role: {user.role}")
    print(f"Has password: {bool(user.password)}")
    print(f"Password hash: {user.password[:50]}...")
    print(f"Is active: {user.is_active}")
    
    # Test password
    test_password = input("\nEnter password to test: ")
    if user.check_password(test_password):
        print("✅ Password is CORRECT!")
    else:
        print("❌ Password is INCORRECT!")
        print("\nResetting password to 'test123'...")
        user.set_password('test123')
        user.save()
        print("✅ Password reset! Try logging in with: test123")
else:
    print(f"\n❌ User with email '{email}' not found!")
    print("\nAvailable users:")
    for u in User.objects.all()[:10]:
        print(f"  - {u.email} ({u.role})")
