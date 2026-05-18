"""
Enhanced Overload Test Data Creator
Creates realistic test data for advisor overload resolution feature
"""
import os
import django
from django.utils import timezone
from datetime import timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User, AdvisorProfile, StudentProfile, CompanyProfile
from apps.departments.models import Department
from apps.internships.models import Internship
from apps.applications.models import Application
from apps.advisors.models import AdvisorAssignment
from django.contrib.auth.hashers import make_password

print("=" * 80)
print("🎯 CREATING COMPREHENSIVE OVERLOAD TEST DATA")
print("=" * 80)

# Get or create Computer Science department
dept, dept_created = Department.objects.get_or_create(
    name='Computer Science',
    defaults={
        'code': 'CS',
        'description': 'Computer Science Department'
    }
)
print(f"\n{'✓ Created' if dept_created else '✓ Using'} department: {dept.name}")

# Get or create test company
company, comp_created = User.objects.get_or_create(
    email='testcompany@example.com',
    defaults={
        'role': 'COMPANY',
        'is_approved': True,
        'is_active': True,
        'department': dept,  # Assign department to company
        'password': make_password('password123')
    }
)

# Update department if company already exists
if not comp_created and company.department != dept:
    company.department = dept
    company.save()

# Create company profile if needed
if comp_created:
    CompanyProfile.objects.create(
        user=company,
        company_name='Test Company Ltd',
        phone_number='+251911000000',
        address='123 Tech Street',
        city='Addis Ababa',
        contact_person_name='John Doe',
        contact_person_title='HR Manager',
        description='A test company for internship data',
        website='https://testcompany.com'
    )

print(f"{'✓ Created' if comp_created else '✓ Using'} company: {company.email}")

# Get or create active internship
internship, int_created = Internship.objects.get_or_create(
    title='Software Development Internship',
    company=company,
    department=dept,
    defaults={
        'description': 'Full-stack development internship opportunity',
        'required_skills': 'Python, Django, React, JavaScript, PostgreSQL',
        'location': 'Addis Ababa',
        'duration_months': 6,
        'start_date': timezone.now() + timedelta(days=60),
        'is_active': True,
        'status': 'OPEN'  # Make sure it's open for applications
    }
)

# Update status if internship already exists
if not int_created:
    internship.status = 'OPEN'
    internship.is_active = True
    internship.save()

print(f"{'✓ Created' if int_created else '✓ Using'} internship: {internship.title}")

print("\n" + "=" * 80)
print("👨‍🏫 CREATING ADVISORS")
print("=" * 80)

advisors_config = [
    # (email, name, staff_id, max_students, target_load, location)
    ('dr.overloaded@university.edu', 'Dr. Sarah Overloaded', 'ADV-001', 15, 22, 'Building A, Room 101'),
    ('dr.critical@university.edu', 'Dr. John Critical', 'ADV-002', 12, 18, 'Building A, Room 102'),
    ('dr.highload@university.edu', 'Dr. Mary Highload', 'ADV-003', 15, 16, 'Building B, Room 201'),
    ('dr.moderate@university.edu', 'Dr. James Moderate', 'ADV-004', 15, 13, 'Building B, Room 202'),
    ('dr.available@university.edu', 'Dr. Emily Available', 'ADV-005', 20, 8, 'Building C, Room 301'),
    ('dr.capacity@university.edu', 'Dr. Michael Capacity', 'ADV-006', 18, 5, 'Building C, Room 302'),
    ('dr.ready@university.edu', 'Dr. Lisa Ready', 'ADV-007', 15, 3, 'Building D, Room 401'),
]

advisors = []

for email, name, staff_id, max_students, target_load, location in advisors_config:
    # Create or get advisor user
    advisor, created = User.objects.get_or_create(
        email=email,
        defaults={
            'role': 'ADVISOR',
            'is_approved': True,
            'is_active': True,
            'department': dept,
            'password': make_password('password123')
        }
    )
    
    # Create or update advisor profile
    profile, _ = AdvisorProfile.objects.update_or_create(
        user=advisor,
        defaults={
            'full_name': name,
            'phone_number': f'+251911{random.randint(100000, 999999)}',
            'staff_id': staff_id,
            'max_students': max_students,
            'advising_location': location
        }
    )
    
    advisors.append((advisor, profile, target_load))
    
    status = "🆕 Created" if created else "♻️  Updated"
    overload_status = "🔴 OVERLOADED" if target_load > max_students else "🟢 NORMAL"
    print(f"\n{status}: {name} {overload_status}")
    print(f"   Email: {email}")
    print(f"   Max: {max_students}, Target: {target_load}, Location: {location}")

print("\n" + "=" * 80)
print("👨‍🎓 CREATING STUDENTS AND ASSIGNMENTS")
print("=" * 80)

# Student names for realistic data
first_names = [
    'Abebe', 'Almaz', 'Bekele', 'Chaltu', 'Daniel', 'Eden', 'Fikadu', 'Genet',
    'Haile', 'Hanna', 'Kebede', 'Liya', 'Meron', 'Nahom', 'Ruth', 'Samuel',
    'Sara', 'Tadesse', 'Tigist', 'Yohannes', 'Zewdu', 'Amanuel', 'Bethlehem',
    'Dawit', 'Elias', 'Fasika', 'Girma', 'Helen', 'Isaac', 'Jerusalem'
]

last_names = [
    'Tesfaye', 'Alemayehu', 'Bekele', 'Gebre', 'Hailu', 'Kebede', 'Lemma',
    'Mengistu', 'Negash', 'Tadesse', 'Wolde', 'Yilma', 'Abera', 'Desta',
    'Fanta', 'Girma', 'Haile', 'Kassa', 'Mulugeta', 'Tekle'
]

companies_list = [
    'TechCorp Ethiopia', 'Digital Solutions Ltd', 'Innovation Hub',
    'Software Factory', 'Cloud Systems Inc', 'Data Analytics Co',
    'Mobile Apps Studio', 'Web Development Agency', 'AI Research Lab',
    'Cyber Security Firm'
]

internship_titles = [
    'Backend Developer', 'Frontend Developer', 'Full Stack Developer',
    'Mobile App Developer', 'Data Analyst', 'DevOps Engineer',
    'UI/UX Designer', 'QA Engineer', 'System Administrator',
    'Database Administrator'
]

student_num = 0
total_created = 0
total_updated = 0

for advisor, profile, target_load in advisors:
    # Get current assignments
    current_count = AdvisorAssignment.objects.filter(
        advisor=advisor,
        is_active=True
    ).count()
    
    needed = target_load - current_count
    
    if needed <= 0:
        print(f"\n✓ {profile.full_name}: Already has {current_count} students (target: {target_load})")
        continue
    
    print(f"\n→ Creating {needed} students for {profile.full_name}")
    
    for i in range(needed):
        student_num += 1
        
        # Generate realistic student data
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        full_name = f"{first_name} {last_name}"
        email = f'student{student_num:03d}@university.edu'
        university_id = f'UU/CS/{2020 + (student_num % 5)}/{student_num:04d}'
        
        # Create student user
        student, created = User.objects.get_or_create(
            email=email,
            defaults={
                'role': 'STUDENT',
                'is_approved': True,
                'is_active': True,
                'department': dept,
                'password': make_password('password123')
            }
        )
        
        if created:
            total_created += 1
        else:
            total_updated += 1
        
        # Create or update student profile
        StudentProfile.objects.update_or_create(
            user=student,
            defaults={
                'full_name': full_name,
                'phone_number': f'+251{random.randint(900000000, 999999999)}',
                'date_of_birth': f'{1998 + random.randint(0, 4)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}',
                'gender': random.choice(['MALE', 'FEMALE']),
                'university_id': university_id,
                'skills': ', '.join(random.sample([
                    'Python', 'Django', 'React', 'JavaScript', 'TypeScript',
                    'Node.js', 'PostgreSQL', 'MongoDB', 'Docker', 'Git',
                    'AWS', 'Azure', 'Machine Learning', 'Data Analysis'
                ], k=random.randint(3, 6))),
                'is_eligible': True,
                'year_of_study': random.randint(3, 5),
                'batch': str(2020 + (student_num % 5))
            }
        )
        
        # Create application
        application, _ = Application.objects.update_or_create(
            student=student,
            internship=internship,
            defaults={
                'status': 'ACCEPTED',
                'cover_letter': f'I am {full_name}, a passionate student interested in this internship opportunity.',
                'applied_at': timezone.now() - timedelta(days=random.randint(10, 60)),
                'reviewed_at': timezone.now() - timedelta(days=random.randint(1, 10))
            }
        )
        
        # Create advisor assignment
        assignment, _ = AdvisorAssignment.objects.update_or_create(
            student=student,
            internship=internship,
            defaults={
                'advisor': advisor,
                'application': application,
                'is_active': True,
                'assigned_at': timezone.now() - timedelta(days=random.randint(1, 30))
            }
        )
        
        if student_num % 10 == 0:
            print(f"   ✓ Processed {student_num} students...")

print(f"\n✓ Total students created: {total_created}")
print(f"✓ Total students updated: {total_updated}")
print(f"✓ Total students processed: {student_num}")

print("\n" + "=" * 80)
print("📊 VERIFICATION & STATISTICS")
print("=" * 80)

overloaded_count = 0
high_load_count = 0
normal_count = 0

for advisor, profile, target_load in advisors:
    active_count = AdvisorAssignment.objects.filter(
        advisor=advisor,
        is_active=True
    ).count()
    
    percentage = (active_count / profile.max_students * 100) if profile.max_students > 0 else 0
    excess = active_count - profile.max_students
    available = profile.max_students - active_count
    
    if active_count > profile.max_students:
        status = "🔴 OVERLOADED"
        overloaded_count += 1
    elif percentage >= 80:
        status = "🟠 HIGH LOAD"
        high_load_count += 1
    else:
        status = "🟢 AVAILABLE"
        normal_count += 1
    
    print(f"\n{status} {profile.full_name}")
    print(f"   Current: {active_count}/{profile.max_students} students ({percentage:.1f}%)")
    
    if excess > 0:
        print(f"   ⚠️  Excess: +{excess} students over limit")
    else:
        print(f"   ✅ Available: {available} slots remaining")
    
    print(f"   📍 Location: {profile.advising_location}")

print("\n" + "=" * 80)
print("📈 SUMMARY")
print("=" * 80)
print(f"🔴 Overloaded Advisors: {overloaded_count}")
print(f"🟠 High Load Advisors: {high_load_count}")
print(f"🟢 Available Advisors: {normal_count}")
print(f"👥 Total Advisors: {len(advisors)}")
print(f"👨‍🎓 Total Students: {student_num}")

print("\n" + "=" * 80)
print("✅ TEST DATA CREATION COMPLETE!")
print("=" * 80)

print("\n🚀 NEXT STEPS:")
print("   1. Start Django server:")
print("      python manage.py runserver 0.0.0.0:8000")
print("\n   2. Start Frontend:")
print("      cd Frontend && npm run dev")
print("\n   3. Login as Department Head and visit:")
print("      http://localhost:5173/department/advisor-overload")

print("\n🔑 TEST CREDENTIALS (password: password123):")
print("\n   📋 Overloaded Advisors:")
for email, name, _, max_students, target_load, _ in advisors_config:
    if target_load > max_students:
        print(f"   • {email} ({name})")

print("\n   ✅ Available Advisors:")
for email, name, _, max_students, target_load, _ in advisors_config:
    if target_load < max_students * 0.8:
        print(f"   • {email} ({name})")

print("\n   👨‍🎓 Sample Students:")
print("   • student001@university.edu")
print("   • student002@university.edu")
print("   • ... (all use password: password123)")

print("\n" + "=" * 80)
print("💡 TIP: You can run this script multiple times to adjust data")
print("=" * 80)
