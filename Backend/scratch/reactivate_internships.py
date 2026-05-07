import os
import django
import sys

# Add the current directory to sys.path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.internships.models import Internship

print("=== REACTIVATING OPEN INTERNSHIPS ===\n")

# Find all internships that are OPEN but NOT active
inactive_open = Internship.objects.filter(status='OPEN', is_active=False)

print(f"Found {inactive_open.count()} inactive OPEN internships.\n")

for i in inactive_open:
    print(f"Reactivating ID {i.id}: {i.title} ({i.get_company_name()})")
    i.is_active = True
    i.save()

print("\n✅ All open internships have been activated!")
