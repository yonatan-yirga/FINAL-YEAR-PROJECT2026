"""
Fix navigated.tec internships - reactivate them
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.internships.models import Internship

print("\n=== FIXING NAVIGATED.TEC INTERNSHIPS ===\n")

# Find all navigated.tec internships
navigated_internships = Internship.objects.filter(
    company__company_profile__company_name='navigated.tec'
)

print(f"Found {navigated_internships.count()} navigated.tec internships\n")

for internship in navigated_internships:
    print(f"ID {internship.id}: {internship.title}")
    print(f"  Before: status={internship.status}, is_active={internship.is_active}")
    
    # Reactivate the internship
    internship.is_active = True
    internship.save()
    
    print(f"  After:  status={internship.status}, is_active={internship.is_active}")
    print()

print("✅ All navigated.tec internships have been reactivated!")

# Verify the fix
print("\n=== VERIFICATION ===\n")
open_active = Internship.objects.filter(status='OPEN', is_active=True)
print(f"Total open & active internships: {open_active.count()}")

companies = {}
for i in open_active:
    if hasattr(i.company, 'company_profile'):
        company_name = i.company.company_profile.company_name
        if company_name not in companies:
            companies[company_name] = 0
        companies[company_name] += 1

print("\nCompanies with open & active internships:")
for company, count in companies.items():
    print(f"  {company}: {count} internships")

print("\n✅ navigated.tec should now appear on the landing page!")
