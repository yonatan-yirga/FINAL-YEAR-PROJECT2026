import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User, DepartmentHeadProfile
from apps.registrations.models import RegistrationRequest

print("Syncing Department Head names...")

# Find all users with DEPARTMENT_HEAD role
heads = User.objects.filter(role='DEPARTMENT_HEAD')

for head in heads:
    profile, created = DepartmentHeadProfile.objects.get_or_create(user=head)
    
    # Try to find their registration request to get their real name
    reg = RegistrationRequest.objects.filter(email=head.email, request_type='DEPARTMENT').first()
    
    if reg and reg.department_head_name:
        profile.full_name = reg.department_head_name
        profile.phone_number = reg.department_phone
        profile.save()
        print(f"Updated {head.email} to name: {profile.full_name}")
    elif not profile.full_name and head.department:
        # Fallback to department head_name if no registration found and profile name is empty
        profile.full_name = head.department.head_name
        profile.save()
        print(f"Set fallback name for {head.email}: {profile.full_name}")

print("Sync completed.")
