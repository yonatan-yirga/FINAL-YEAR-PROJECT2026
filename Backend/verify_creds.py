import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

emails = ['student@example.com', 'company@example.com', 'admin@example.com']
password = 'password123'

print("-" * 30)
for email in emails:
    try:
        u = User.objects.get(email=email)
        check = u.check_password(password)
        print(f"User: {u.email}")
        print(f"  Role: {u.role}")
        print(f"  Active: {u.is_active}")
        print(f"  Approved: {u.is_approved}")
        print(f"  Password Check: {check}")
    except User.DoesNotExist:
        print(f"User {email} NOT FOUND")
    print("-" * 30)
