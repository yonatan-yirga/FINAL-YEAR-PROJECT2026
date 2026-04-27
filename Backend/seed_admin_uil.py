import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print("🧹 Flushing database...")
from django.core.management import call_command
call_command('flush', '--no-input')

print("✅ Database cleared. Creating Admin and UIL users...")

# Create Admin
admin = User.objects.create(email='admin@example.com', role='ADMIN', is_active=True, is_approved=True)
admin.set_password('password123')
admin.is_staff = True
admin.is_superuser = True
admin.save()

# Create UIL
uil = User.objects.create(email='uil@example.com', role='UIL', is_active=True, is_approved=True)
uil.set_password('password123')
uil.save()

print("\n🏁 Setup Complete!")
print("-" * 40)
print("CREDENTIALS:")
print("Admin:   admin@example.com / password123")
print("UIL:     uil@example.com / password123")
print("-" * 40)
