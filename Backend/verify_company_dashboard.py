#!/usr/bin/env python
"""
Company Dashboard Verification Script
Tests all company users and their applications endpoint
"""
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from apps.applications.models import Application

User = get_user_model()

def print_header(text):
    print(f"\n{'='*70}")
    print(f"  {text}")
    print(f"{'='*70}\n")

def print_success(text):
    print(f"✅ {text}")

def print_error(text):
    print(f"❌ {text}")

def print_info(text):
    print(f"ℹ️  {text}")

# Main verification
print_header("COMPANY DASHBOARD VERIFICATION")

# 1. Check database
companies = User.objects.filter(role='COMPANY')
print_info(f"Found {companies.count()} company users in database")

if companies.count() == 0:
    print_error("No company users found! Please run create_sample_data command.")
    sys.exit(1)

# 2. Check applications
total_apps = Application.objects.count()
print_info(f"Found {total_apps} total applications in database")

# 3. Test each company
print_header("TESTING COMPANY ENDPOINTS")

all_passed = True

for company in companies:
    print(f"\n📊 Testing: {company.email}")
    print(f"   Name: {company.get_full_name()}")
    
    # Get token
    token, created = Token.objects.get_or_create(user=company)
    if created:
        print_info(f"   Created new auth token")
    
    # Create API client
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    
    # Test endpoint
    try:
        response = client.get('/api/applications/company-applications/')
        
        if response.status_code == 200:
            data = response.json()
            results = data if isinstance(data, list) else data.get('results', data)
            app_count = len(results) if isinstance(results, list) else 0
            
            print_success(f"API returned 200 OK with {app_count} applications")
            
            # Show application details
            if app_count > 0:
                for app in results[:3]:  # Show first 3
                    print(f"      • {app.get('student_name', 'Unknown')} → {app.get('internship_title', 'Unknown')} [{app.get('status', 'Unknown')}]")
                if app_count > 3:
                    print(f"      ... and {app_count - 3} more")
        else:
            print_error(f"API returned {response.status_code}")
            print(f"   Response: {response.content.decode()[:200]}")
            all_passed = False
            
    except Exception as e:
        print_error(f"Exception occurred: {e}")
        import traceback
        traceback.print_exc()
        all_passed = False

# 4. Summary
print_header("VERIFICATION SUMMARY")

if all_passed:
    print_success("All company users can access their applications successfully!")
    print_success("Backend API is working correctly!")
    print()
    print_info("If you're still seeing 500 errors in the frontend:")
    print("   1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)")
    print("   2. Clear localStorage: localStorage.clear() in browser console")
    print("   3. Re-login to the application")
    print("   4. Check browser Network tab for actual error details")
else:
    print_error("Some tests failed. Please check the errors above.")
    sys.exit(1)

print()
print_header("TEST ACCOUNTS")
print("All accounts use password: password123\n")
for company in companies:
    apps_count = Application.objects.filter(internship__company=company).count()
    print(f"  • {company.email:30s} ({apps_count} applications)")

print()
