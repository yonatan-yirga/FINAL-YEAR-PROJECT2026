"""
Test script to verify overload endpoints are working
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.departments.views import DepartmentViewSet

# Check if methods exist
print("=" * 70)
print("CHECKING OVERLOAD RESOLUTION METHODS")
print("=" * 70)

methods = ['overloaded_advisors', 'available_advisors', 'reassign_students']

for method_name in methods:
    if hasattr(DepartmentViewSet, method_name):
        method = getattr(DepartmentViewSet, method_name)
        print(f"✓ {method_name}: EXISTS")
        print(f"  Docstring: {method.__doc__[:100] if method.__doc__ else 'None'}...")
    else:
        print(f"✗ {method_name}: NOT FOUND")

print("\n" + "=" * 70)
print("URL PATTERNS CHECK")
print("=" * 70)

from apps.departments import urls as dept_urls

url_patterns = [
    'advisors/overloaded/',
    'advisors/available/',
    'advisors/reassign/',
]

for pattern in url_patterns:
    found = any(pattern in str(p.pattern) for p in dept_urls.urlpatterns)
    status = "✓ REGISTERED" if found else "✗ NOT FOUND"
    print(f"{status}: {pattern}")

print("\n" + "=" * 70)
print("TESTING ENDPOINT ACCESS")
print("=" * 70)

from django.test import RequestFactory
from django.contrib.auth import get_user_model

User = get_user_model()

# Create a test request
factory = RequestFactory()
request = factory.get('/api/departments/advisors/overloaded/')

# Try to find a department head user
try:
    dept_head = User.objects.filter(role='DEPARTMENT_HEAD', is_approved=True).first()
    if dept_head:
        request.user = dept_head
        print(f"✓ Test user found: {dept_head.email}")
        
        # Try to call the method
        viewset = DepartmentViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        
        try:
            response = viewset.overloaded_advisors(request)
            print(f"✓ Endpoint callable: Status {response.status_code}")
            if response.status_code == 200:
                print(f"  Response data keys: {list(response.data.keys())}")
        except Exception as e:
            print(f"✗ Error calling endpoint: {str(e)}")
    else:
        print("✗ No department head user found in database")
except Exception as e:
    print(f"✗ Error: {str(e)}")

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
print("If all checks pass, restart the Django server:")
print("  1. Stop the current server (Ctrl+C)")
print("  2. Run: python manage.py runserver 0.0.0.0:8000")
print("  3. Try accessing the frontend again")
print("=" * 70)
