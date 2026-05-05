#!/usr/bin/env python
"""
Test script to verify Partner Organizations API
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from django.db.models import Count, Q
import json

def test_partner_organizations():
    print("=== Testing Partner Organizations API ===\n")
    
    # Test the same query as the API
    companies = User.objects.filter(
        role='COMPANY',
        is_approved=True,
        is_active=True
    ).select_related('company_profile').annotate(
        total_internships=Count('posted_internships'),
        active_internships=Count(
            'posted_internships',
            filter=Q(posted_internships__status='OPEN')
        ),
        total_applications=Count('posted_internships__applications')
    ).order_by('-created_at')
    
    print(f"Found {companies.count()} approved companies:")
    print("-" * 50)
    
    partners = []
    for company in companies:
        try:
            if hasattr(company, 'company_profile'):
                profile = company.company_profile
                partner_data = {
                    'id': company.id,
                    'company_name': profile.company_name,
                    'email': company.email,
                    'phone_number': profile.phone_number,
                    'city': profile.city,
                    'address': profile.address,
                    'description': profile.description,
                    'total_internships': company.total_internships,
                    'active_internships': company.active_internships,
                    'total_applications': company.total_applications,
                    'joined_date': company.created_at.strftime('%B %Y'),
                    'is_active': company.is_active,
                }
                partners.append(partner_data)
                
                print(f"✅ {profile.company_name}")
                print(f"   Email: {company.email}")
                print(f"   City: {profile.city}")
                print(f"   Total Internships: {company.total_internships}")
                print(f"   Active Internships: {company.active_internships}")
                print(f"   Total Applications: {company.total_applications}")
                print(f"   Joined: {company.created_at.strftime('%B %Y')}")
                print()
            else:
                print(f"❌ Company {company.email} has no profile")
        except Exception as e:
            print(f"❌ Error processing company {company.email}: {e}")
    
    print(f"\nTotal partners to return: {len(partners)}")
    
    # Test statistics
    print("\n=== Testing Statistics ===")
    total_partners = companies.count()
    total_internships = sum(c.total_internships for c in companies)
    active_internships = sum(c.active_internships for c in companies)
    total_applications = sum(c.total_applications for c in companies)
    
    stats = {
        'total_partners': total_partners,
        'total_internships': total_internships,
        'active_internships': active_internships,
        'total_applications': total_applications,
    }
    
    print(f"Stats: {json.dumps(stats, indent=2)}")
    
    return partners, stats

if __name__ == '__main__':
    test_partner_organizations()