#!/usr/bin/env python
"""
Final verification script for student dashboard API endpoints
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

def verify_student_dashboard():
    """Verify all student dashboard API endpoints work correctly"""
    User = get_user_model()
    client = Client()

    print("🔍 Student Dashboard API Verification")
    print("=" * 50)

    # Test with multiple students
    test_students = ['student1@test.com', 'student2@test.com', 'student3@test.com']
    
    for email in test_students:
        student = User.objects.filter(role='STUDENT', email=email).first()
        if not student:
            print(f'⚠️  Student {email} not found, skipping...')
            continue

        print(f'\n👤 Testing student: {student.get_full_name()} ({email})')
        
        # Get or create token
        token, _ = Token.objects.get_or_create(user=student)
        auth_header = f'Token {token.key}'

        # Test all three endpoints
        endpoints = [
            ('/api/applications/my-applications/', 'Applications'),
            ('/api/applications/my-feedback/', 'Feedback'),
            ('/api/reports/student-monthly/my-reports/', 'Reports'),
        ]

        all_success = True
        for endpoint, name in endpoints:
            response = client.get(endpoint, HTTP_AUTHORIZATION=auth_header)
            if response.status_code == 200:
                data = response.json()
                count = len(data.get('results', []))
                print(f'   ✅ {name}: {count} items')
            else:
                print(f'   ❌ {name}: Error {response.status_code}')
                all_success = False

        if all_success:
            print(f'   🎉 All endpoints working for {student.get_full_name()}')
        else:
            print(f'   ⚠️  Some endpoints failed for {student.get_full_name()}')

    print(f'\n🎯 Verification Complete!')
    print('   Student dashboard should now load without API errors.')
    print('   You can test in browser at: http://localhost:5174/login')
    print('   Use any student credentials: password123')

if __name__ == '__main__':
    verify_student_dashboard()