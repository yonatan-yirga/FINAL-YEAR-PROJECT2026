import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.internships.serializers import InternshipSerializer
from apps.accounts.models import User
from apps.departments.models import Department

# Get a company user and their department
company = User.objects.filter(role='COMPANY').first()
department = company.department

data = {
    'title': 'Test Internship Creation',
    'description': 'A very long description that is at least 50 characters long to pass validation.',
    'required_skills': 'Python, Django',
    'location': 'Test City',
    'duration_months': 3,
    'start_date': '2026-07-01',
    'max_applicants': 5,
    'application_deadline': '2026-06-01',
}

serializer = InternshipSerializer(data=data)
if serializer.is_valid():
    # This is what perform_create does
    instance = serializer.save(company=company, department=department)
    print(f"Created Internship ID: {instance.id}")
    print(f"Is Active: {instance.is_active}")
    # Clean up
    instance.delete()
else:
    print(f"Validation Errors: {serializer.errors}")
