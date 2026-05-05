"""
Check all internships in the database
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.internships.models import Internship

print("\n=== ALL INTERNSHIPS IN DATABASE ===\n")

internships = Internship.objects.all().select_related('company', 'company__company_profile')

if not internships.exists():
    print("No internships found in database")
else:
    for i in internships:
        company_name = "N/A"
        if hasattr(i.company, 'company_profile'):
            company_name = i.company.company_profile.company_name
        
        print(f"ID: {i.id}")
        print(f"Title: {i.title}")
        print(f"Company: {company_name}")
        print(f"Status: {i.status}")
        print(f"Active: {i.is_active}")
        print(f"Created: {i.created_at}")
        print("-" * 50)

print(f"\nTotal internships: {internships.count()}")
print(f"Open internships: {internships.filter(status='OPEN', is_active=True).count()}")
print(f"Closed internships: {internships.filter(status='CLOSED').count()}")
print(f"Filled internships: {internships.filter(status='FILLED').count()}")

print("\n=== COMPANIES WITH OPEN INTERNSHIPS ===\n")
open_internships = internships.filter(status='OPEN', is_active=True)
companies = {}
for i in open_internships:
    company_name = "N/A"
    if hasattr(i.company, 'company_profile'):
        company_name = i.company.company_profile.company_name
    
    if company_name not in companies:
        companies[company_name] = 0
    companies[company_name] += 1

for company, count in companies.items():
    print(f"{company}: {count} open internships")

print("\n=== COMPANIES WITHOUT OPEN INTERNSHIPS ===\n")
all_companies = set()
for i in internships:
    if hasattr(i.company, 'company_profile'):
        all_companies.add(i.company.company_profile.company_name)

companies_with_open = set(companies.keys())
companies_without_open = all_companies - companies_with_open

for company in companies_without_open:
    company_internships = internships.filter(company__company_profile__company_name=company)
    statuses = {}
    for i in company_internships:
        if i.status not in statuses:
            statuses[i.status] = 0
        statuses[i.status] += 1
    print(f"{company}: {statuses}")
