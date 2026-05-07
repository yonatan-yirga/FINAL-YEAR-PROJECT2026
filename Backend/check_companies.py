#!/usr/bin/env python
"""
Check all registered companies and their internship posts
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from apps.internships.models import Internship

print("=" * 60)
print("REGISTERED COMPANIES CHECK")
print("=" * 60)

# Get all companies
companies = User.objects.filter(role='COMPANY', is_active=True)
print(f"\nTotal registered companies: {companies.count()}\n")

for i, company in enumerate(companies, 1):
    print(f"{i}. Email: {company.email}")
    
    # Check if has profile
    if hasattr(company, 'company_profile') and company.company_profile:
        profile = company.company_profile
        print(f"   Company Name: {profile.company_name}")
        print(f"   City: {profile.city}")
        print(f"   Phone: {profile.phone_number}")
    else:
        print(f"   ⚠️  NO COMPANY PROFILE")
    
    # Check internships
    all_internships = Internship.objects.filter(company=company)
    open_internships = all_internships.filter(status='OPEN', is_active=True)
    
    print(f"   Total Internships: {all_internships.count()}")
    print(f"   Open Internships: {open_internships.count()}")
    
    if open_internships.exists():
        print(f"   ✅ WILL SHOW on landing page")
        for internship in open_internships:
            print(f"      - {internship.title} (ID: {internship.id})")
    else:
        print(f"   ❌ WILL NOT SHOW on landing page (no open internships)")
    
    print()

print("=" * 60)
print("SUMMARY")
print("=" * 60)

companies_with_posts = User.objects.filter(
    role='COMPANY',
    is_active=True,
    posted_internships__status='OPEN',
    posted_internships__is_active=True
).distinct()

print(f"Companies with open internships: {companies_with_posts.count()}")
print(f"Companies without open internships: {companies.count() - companies_with_posts.count()}")
print()
print("💡 TIP: Companies only appear on landing page if they have at least one OPEN internship")
print("=" * 60)
