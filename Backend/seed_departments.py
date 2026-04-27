import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.departments.models import Department

departments_data = [
    {
        'name': 'Software Engineering',
        'head_name': 'Dr. Abebe',
        'email': 'se@university.edu',
        'phone_number': '+251911123456'
    },
    {
        'name': 'Computer Science',
        'head_name': 'Dr. Kebede',
        'email': 'cs@university.edu',
        'phone_number': '+251911123457'
    },
    {
        'name': 'Information Technology',
        'head_name': 'Dr. Almaz',
        'email': 'it@university.edu',
        'phone_number': '+251911123458'
    },
    {
        'name': 'Electrical Engineering',
        'head_name': 'Dr. Dawit',
        'email': 'ee@university.edu',
        'phone_number': '+251911123459'
    }
]

for dept_data in departments_data:
    dept, created = Department.objects.get_or_create(
        name=dept_data['name'],
        defaults=dept_data
    )
    if created:
        print(f"Created department: {dept.name}")
    else:
        print(f"Department already exists: {dept.name}")

print("Department seeding completed successfully.")
