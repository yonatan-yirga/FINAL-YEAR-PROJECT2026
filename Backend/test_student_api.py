#!/usr/bin/env python
"""
Test script to verify student API endpoints work correctly
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

def test_student_apis():
    """Test the API endpoints that the student dashboard uses"""
    User = get_user_model()
    client = Client()

    # Get a test student
    student = User.objects.filter(role='STUDENT', email='student1@test.com').first()
    if not student:
        print('❌ No test student found')
        return

    print(f'🧪 Testing API endpoints for student: {student.email}')
    
    # Get or create token for the student
    token, created = Token.objects.get_or_create(user=student)
    print(f'🔐 Token {"created" if created else "retrieved"}: {token.key[:10]}...')
    
    # Set up authorization header
    auth_header = f'Token {token.key}'

    # Test applications endpoint
    response = client.get('/api/applications/my-applications/', HTTP_AUTHORIZATION=auth_header)
    print(f'📋 Applications API: {response.status_code}')
    if response.status_code == 200:
        data = response.json()
        results = data.get('results', [])
        print(f'   ✅ Success: Found {len(results)} applications')
        if results:
            print(f'   📝 Sample: {results[0].get("internship_title", "N/A")} at {results[0].get("company_name", "N/A")}')
    else:
        print(f'   ❌ Error: {response.status_code}')
        if hasattr(response, 'json'):
            try:
                print(f'   📄 Response: {response.json()}')
            except:
                print(f'   📄 Response: {response.content.decode()}')
    
    # Test advisor feedback endpoint - correct endpoint is in applications
    response = client.get('/api/applications/my-feedback/', HTTP_AUTHORIZATION=auth_header)
    print(f'💬 Advisor feedback API: {response.status_code}')
    if response.status_code == 200:
        data = response.json()
        results = data.get('results', [])
        print(f'   ✅ Success: Found {len(results)} feedback items')
    else:
        print(f'   ❌ Error: {response.status_code}')
        if hasattr(response, 'json'):
            try:
                print(f'   📄 Response: {response.json()}')
            except:
                print(f'   📄 Response: {response.content.decode()}')
    
    # Test student reports endpoint
    response = client.get('/api/reports/student-monthly/my-reports/', HTTP_AUTHORIZATION=auth_header)
    print(f'📊 Student reports API: {response.status_code}')
    if response.status_code == 200:
        data = response.json()
        results = data.get('results', [])
        print(f'   ✅ Success: Found {len(results)} reports')
    else:
        print(f'   ❌ Error: {response.status_code}')
        if hasattr(response, 'json'):
            try:
                print(f'   📄 Response: {response.json()}')
            except:
                print(f'   📄 Response: {response.content.decode()}')

    print('\n🎯 API Test Summary:')
    print('   All endpoints should return 200 status codes')
    print('   If any show errors, there may be authentication or permission issues')
    print('   Note: The advisor feedback endpoint may not exist and needs to be implemented')

if __name__ == '__main__':
    test_student_apis()