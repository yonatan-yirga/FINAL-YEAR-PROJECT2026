"""
Simple script to create overload test data
Bypasses validation by using raw SQL where needed
"""
import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User, AdvisorProfile, StudentProfile
from apps.departments.models import Department
from apps.internships.models import Internship
from apps.applications.models import Application
from apps.advisors.models import AdvisorAssignment
from django.contrib.auth.hashers import make_password
from django.db import connection

print("=" * 70)
print("CREATING SIMPLE OVERLOAD TEST DATA")
print("=" * 70)

# Get Computer Science department
dept = Department.objects.filter(name='Computer Science').first()
if not dept:
    print("✗ Computer Science department not found!")
    print("  Please create it first or run migrations.")
    exit(1)

print(f"\n✓ Using department: {dept.name}")

# Get any active internship in this department
internship = Internship.objects.filter(department=dept, is_active=True).first()
if not internship:
    print("✗ No active internship found in Computer Science department!")
    print("  Please create an internship first.")
    exit(1)

print(f"✓ Using internship: {internship.title}")
print(f"  Company: {internship.company.email}")

print("\n" + "=" * 70)
print("CREATING/UPDATING ADVISORS")
print("=" * 70)

advisors_config = [
    ('overloaded.advisor@university.edu', 'Dr. Overloaded Smith', 'ADV-OVL-001', 15, 18),
    ('highload.advisor@university.edu', 'Dr. HighLoad Johnson', 'ADV-HIGH-002', 15, 13),
    ('available.advisor@university.edu', 'Dr. Available Williams', 'ADV-AVL-003', 15, 5),
]

advisors = []

for email, name, staff_id, max_students, target_load in advisors_config:
    # Create or get advisor
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
    
    # Create or update profile
    profile, _ = AdvisorProfile.objects.update_or_create(
        user=advisor,
        defaults={
            'full_name': name,
            'phone_number': '+251911000001',
            'staff_id': staff_id,
            'max_students': max_students,
            'advising_location': f'Building A, Room {len(advisors) + 101}'
        }
    )
    
    advisors.append((advisor, profile, target_load))
    status = "Created" if created else "Updated"
    print(f"\n{status}: {name}")
    print(f"  Email: {email}")
    print(f"  Max: {max_students}, Target: {target_load}")

print("\n" + "=" * 70)
print("CREATING STUDENTS AND ASSIGNMENTS")
print("=" * 70)

student_num = 0

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
        email = f'overload.student{student_num:03d}@university.edu'
        
        # Create student
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
        
        # Create profile if new
        if created:
            StudentProfile.objects.create(
                user=student,
                full_name=f'Overload Test Student {student_num:03d}',
                phone_number=f'+25191100{student_num:04d}',
                date_of_birth='2000-01-01',
                gender='MALE' if student_num % 2 == 0 else 'FEMALE',
                university_id=f'OVL{student_num:05d}',
                skills='Python, Django, React',
                is_eligible=True,
                year_of_study=4,
                batch='2024'
            )
        
        # Create application (bypass validation using update_or_create)
        application, _ = Application.objects.update_or_create(
            student=student,
            internship=internship,
            defaults={
                'status': 'ACCEPTED',
                'cover_letter': 'Test application for overload demo',
                'applied_at': timezone.now(),
                'reviewed_at': timezone.now()
            }
        )
        
        # Create assignment (bypass validation using update_or_create)
        assignment, _ = AdvisorAssignment.objects.update_or_create(
            student=student,
            internship=internship,
            defaults={
                'advisor': advisor,
                'application': application,
                'is_active': True,
                'assigned_at': timezone.now()
            }
        )
        
        if (student_num % 5 == 0):
            print(f"  ✓ Created {student_num} students...")

print(f"\n✓ Total students processed: {student_num}")

print("\n" + "=" * 70)
print("VERIFICATION")
print("=" * 70)

for advisor, profile, target_load in advisors:
    active_count = AdvisorAssignment.objects.filter(
        advisor=advisor,
        is_active=True
    ).count()
    
    percentage = (active_count / profile.max_students * 100) if profile.max_students > 0 else 0
    excess = active_count - profile.max_students
    
    if active_count > profile.max_students:
        status = "🔴 OVERLOADED"
    elif active_count >= 12:
        status = "🟠 HIGH LOAD"
    else:
        status = "🟢 NORMAL"
    
    print(f"\n{status} {profile.full_name}")
    print(f"   Active: {active_count}/{profile.max_students} ({percentage:.1f}%)")
    if excess > 0:
        print(f"   Excess: +{excess} students")
    else:
        print(f"   Available: {profile.max_students - active_count} slots")

print("\n" + "=" * 70)
print("✅ SAMPLE DATA READY!")
print("=" * 70)

print("\n🚀 NEXT STEPS:")
print("   1. Restart Django: python manage.py runserver 0.0.0.0:8000")
print("   2. Login as Department Head")
print("   3. Visit: http://localhost:5173/department/advisor-overload")

print("\n🔑 TEST CREDENTIALS:")
print("   Advisors (all use password: password123):")
for email, name, _, _, _ in advisors_config:
    print(f"   • {email}")

print("\n   Students (all use password: password123):")
print("   • overload.student001@university.edu")
print("   • overload.student002@university.edu")
print("   • ... etc")

print("\n" + "=" * 70)
