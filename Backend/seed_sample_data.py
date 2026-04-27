import os
import django
import random
from datetime import date, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.departments.models import Department
from apps.internships.models import Internship
from apps.applications.models import Application
from apps.accounts.models import StudentProfile, CompanyProfile, AdvisorProfile

User = get_user_model()

def seed_data():
    print("Starting sample data seeding (Fixing Active Status)...")
    
    # 1. Ensure Departments exist
    dept_names = ['Software Engineering', 'Computer Science', 'Information Technology']
    departments = []
    for name in dept_names:
        dept, _ = Department.objects.get_or_create(name=name, defaults={
            'head_name': f'Dr. {name.split()[0]}',
            'email': f'{name.lower().replace(" ", "")}@university.edu',
            'phone_number': '+251911122233'
        })
        departments.append(dept)
    print(f"Verified {len(departments)} departments.")

    # 2. Create Users
    password = 'password123'
    
    user_roles = [
        ('student@example.com', 'STUDENT'),
        ('company@example.com', 'COMPANY'),
        ('advisor@example.com', 'ADVISOR'),
        ('admin@example.com', 'ADMIN'),
    ]

    for email, role in user_roles:
        user, created = User.objects.get_or_create(
            email=email,
            defaults={'role': role, 'is_approved': True, 'department': departments[0], 'is_active': True}
        )
        # FORCE status to active and approved, and RESET password
        user.role = role
        user.is_active = True
        user.is_approved = True
        user.set_password(password)
        if role == 'ADMIN':
            user.is_staff = True
            user.is_superuser = True
        user.save()
        print(f"Updated user: {email} (Active=True)")

    # Ensure Profiles exist
    student_user = User.objects.get(email='student@example.com')
    StudentProfile.objects.update_or_create(user=student_user, defaults={
        'full_name': 'Abebe Kebe',
        'phone_number': '+251911000002',
        'date_of_birth': date(2002, 1, 1),
        'gender': 'MALE',
        'university_id': 'STUD/123/15',
        'skills': 'Python, JavaScript, Django'
    })

    company_user = User.objects.get(email='company@example.com')
    CompanyProfile.objects.update_or_create(user=company_user, defaults={
        'company_name': 'Tech Solutions Inc.',
        'phone_number': '+251911000001',
        'address': 'Bole, Addis Ababa',
        'city': 'Addis Ababa',
        'contact_person_name': 'John Smith',
        'contact_person_title': 'HR Manager',
        'description': 'A leading software development firm.'
    })

    advisor_user = User.objects.get(email='advisor@example.com')
    AdvisorProfile.objects.update_or_create(user=advisor_user, defaults={
        'full_name': 'Dr. Solomon',
        'phone_number': '+251911000003',
        'staff_id': 'STAFF/456'
    })

    # 3. Create Internships
    Internship.objects.filter(company=company_user).delete()
    internships = []
    titles = [('Web Developer Intern', 'React + Django'), ('Backend Engineering Intern', 'Python APIs')]
    for title, desc in titles:
        intern = Internship.objects.create(
            title=title, company=company_user, description=desc, department=departments[0],
            required_skills='Python, React', location='Addis Ababa', duration_months=3,
            start_date=date.today() + timedelta(days=30), max_applicants=5, status='OPEN', is_active=True
        )
        internships.append(intern)

    # 4. Create Applications (Correct Order)
    Application.objects.filter(student=student_user).delete()
    Application.objects.create(student=student_user, internship=internships[1], status='PENDING')
    Application.objects.create(student=student_user, internship=internships[0], status='ACCEPTED',
                               reviewed_by=company_user, reviewed_at=timezone.now())

    print("\nSUCCESS: Sample data seeding completed and users are ACTIVE.")
    print("-" * 30)
    print(f"Credentials: student@example.com / password123")
    print("-" * 30)

if __name__ == "__main__":
    from django.utils import timezone
    seed_data()
