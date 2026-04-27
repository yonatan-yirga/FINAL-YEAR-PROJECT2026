import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.departments.models import Department

User = get_user_model()

def setup():
    # 1. Create Admin
    admin_email = 'admin@example.com'
    admin_pass = 'admin12345'
    user, created = User.objects.get_or_create(email=admin_email)
    user.set_password(admin_pass)
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.is_approved = True
    user.role = 'ADMIN'
    user.save()
    print(f"SUCCESS: Admin updated/created: {admin_email} / {admin_pass}")

    # 2. Create UIL (ULM)
    uil_email = 'uil@example.com'
    uil_pass = 'uil12345'
    user, created = User.objects.get_or_create(email=uil_email)
    user.set_password(uil_pass)
    user.is_staff = True # UIL needs access to some admin views
    user.is_active = True
    user.is_approved = True
    user.role = 'UIL'
    user.save()
    print(f"SUCCESS: UIL User updated/created: {uil_email} / {uil_pass}")

if __name__ == '__main__':
    setup()
