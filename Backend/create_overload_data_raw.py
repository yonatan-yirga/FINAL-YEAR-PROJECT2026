"""
Create overload test data using raw SQL to bypass validations
"""
import os
import django
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from apps.accounts.models import User, AdvisorProfile, StudentProfile
from apps.departments.models import Department
from apps.internships.models import Internship
from apps.advisors.models import AdvisorAssignment
from django.contrib.auth.hashers import make_password

print("=" * 70)
print("CREATING OVERLOAD TEST DATA (RAW SQL)")
print("=" * 70)

# Get department
dept = Department.objects.filter(name='Computer Science').first()
if not dept:
    print("✗ Computer Science department not found!")
    exit(1)

print(f"\n✓ Department: {dept.name} (ID: {dept.id})")

# Get internship
internship = Internship.objects.filter(department=dept).first()
if not internship:
    print("✗ No internship found!")
    exit(1)

print(f"✓ Internship: {internship.title} (ID: {internship.id})")

print("\n" + "=" * 70)
print("CREATING ADVISORS")
print("=" * 70)

advisors_config = [
    ('overloaded.advisor@university.edu', 'Dr. Overloaded Smith', 'ADV-OVL-001', 15, 18),
    ('highload.advisor@university.edu', 'Dr. HighLoad Johnson', 'ADV-HIGH-002', 15, 13),
    ('available.advisor@university.edu', 'Dr. Available Williams', 'ADV-AVL-003', 15, 5),
]

advisors = []

for email, name, staff_id, max_students, target_load in advisors_config:
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
    print(f"✓ {name} (ID: {advisor.id})")

print("\n" + "=" * 70)
print("CREATING STUDENTS AND ASSIGNMENTS (RAW SQL)")
print("=" * 70)

cursor = connection.cursor()
student_num = 0

for advisor, profile, target_load in advisors:
    # Check current count
    current = AdvisorAssignment.objects.filter(advisor=advisor, is_active=True).count()
    needed = target_load - current
    
    if needed <= 0:
        print(f"\n✓ {profile.full_name}: Already has {current}/{target_load}")
        continue
    
    print(f"\n→ Creating {needed} students for {profile.full_name}")
    
    for i in range(needed):
        student_num += 1
        email = f'overload.student{student_num:03d}@university.edu'
        
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
        
        # Create profile
        if created:
            StudentProfile.objects.create(
                user=student,
                full_name=f'Test Student {student_num:03d}',
                phone_number=f'+25191100{student_num:04d}',
                date_of_birth='2000-01-01',
                gender='MALE' if student_num % 2 == 0 else 'FEMALE',
                university_id=f'OVL{student_num:05d}',
                skills='Python, Django, React',
                is_eligible=True,
                year_of_study=4,
                batch='2024'
            )
        
        # Use raw SQL to create application (bypass validation)
        cursor.execute("""
            INSERT INTO applications (student_id, internship_id, status, cover_letter, applied_at, reviewed_at, updated_at)
            VALUES (%s, %s, %s, %s, NOW(), NOW(), NOW())
            ON CONFLICT (student_id, internship_id) 
            DO UPDATE SET status = 'ACCEPTED', reviewed_at = NOW()
            RETURNING id
        """, [student.id, internship.id, 'ACCEPTED', 'Test application'])
        
        app_id = cursor.fetchone()[0]
        
        # Use raw SQL to create assignment (bypass validation)
        cursor.execute("""
            INSERT INTO advisor_assignments (student_id, advisor_id, internship_id, application_id, is_active, assigned_at, created_at, updated_at)
            VALUES (%s, %s, %s, %s, TRUE, NOW(), NOW(), NOW())
            ON CONFLICT (application_id) WHERE is_active = TRUE
            DO UPDATE SET advisor_id = %s, is_active = TRUE
        """, [student.id, advisor.id, internship.id, app_id, advisor.id])
        
        if student_num % 5 == 0:
            print(f"  ✓ {student_num} students...")

connection.commit()
print(f"\n✓ Created {student_num} students total")

print("\n" + "=" * 70)
print("VERIFICATION")
print("=" * 70)

for advisor, profile, target_load in advisors:
    count = AdvisorAssignment.objects.filter(advisor=advisor, is_active=True).count()
    pct = (count / profile.max_students * 100) if profile.max_students > 0 else 0
    excess = count - profile.max_students
    
    if count > profile.max_students:
        icon = "🔴"
        status = "OVERLOADED"
    elif count >= 12:
        icon = "🟠"
        status = "HIGH LOAD"
    else:
        icon = "🟢"
        status = "NORMAL"
    
    print(f"\n{icon} {profile.full_name} - {status}")
    print(f"   Load: {count}/{profile.max_students} ({pct:.1f}%)")
    if excess > 0:
        print(f"   Excess: +{excess} students")

print("\n" + "=" * 70)
print("✅ DONE!")
print("=" * 70)

print("\n🚀 NEXT STEPS:")
print("   1. Restart Django server")
print("   2. Go to: http://localhost:5173/department/advisor-overload")
print("   3. Login as Department Head")

print("\n🔑 CREDENTIALS (password: password123):")
for email, _, _, _, _ in advisors_config:
    print(f"   • {email}")

print("\n" + "=" * 70)
