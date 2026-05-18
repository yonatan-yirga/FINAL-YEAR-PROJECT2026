"""
Bypass validation to create test data for advisor overload
Uses raw SQL where needed to bypass Django model validation
"""
import os
import django
from django.utils import timezone
from datetime import timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User, AdvisorProfile, StudentProfile
from apps.departments.models import Department
from apps.internships.models import Internship
from apps.applications.models import Application
from apps.advisors.models import AdvisorAssignment
from django.contrib.auth.hashers import make_password
from django.db import connection

print("=" * 80)
print("🎯 CREATING TEST DATA (BYPASS VALIDATION)")
print("=" * 80)

# Get department
dept = Department.objects.filter(name='Computer Science').first()
if not dept:
    print("✗ Computer Science department not found!")
    exit(1)

print(f"\n✓ Using department: {dept.name}")

# Get company
company = User.objects.filter(role='COMPANY', email='testcompany@example.com').first()
if not company:
    print("✗ Test company not found!")
    exit(1)

# Get or update internship
internship = Internship.objects.filter(company=company, department=dept).first()
if internship:
    # Bypass validation by using update
    Internship.objects.filter(id=internship.id).update(
        status='OPEN',
        is_active=True
    )
    print(f"✓ Updated internship: {internship.title}")
else:
    print("✗ No internship found!")
    exit(1)

print("\n" + "=" * 80)
print("👨‍🏫 CREATING ADVISORS")
print("=" * 80)

advisors_config = [
    ('dr.overloaded@university.edu', 'Dr. Sarah Overloaded', 'ADV-001', 15, 22),
    ('dr.critical@university.edu', 'Dr. John Critical', 'ADV-002', 12, 18),
    ('dr.highload@university.edu', 'Dr. Mary Highload', 'ADV-003', 15, 16),
    ('dr.available@university.edu', 'Dr. Emily Available', 'ADV-005', 20, 8),
    ('dr.capacity@university.edu', 'Dr. Michael Capacity', 'ADV-006', 18, 5),
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
            'phone_number': f'+251911{random.randint(100000, 999999)}',
            'staff_id': staff_id,
            'max_students': max_students,
            'advising_location': f'Building {chr(65 + len(advisors))}, Room {101 + len(advisors)}'
        }
    )
    
    advisors.append((advisor, profile, target_load))
    status = "🆕" if created else "♻️"
    print(f"{status} {name} (Max: {max_students}, Target: {target_load})")

print("\n" + "=" * 80)
print("👨‍🎓 CREATING STUDENTS")
print("=" * 80)

first_names = ['Abebe', 'Almaz', 'Bekele', 'Chaltu', 'Daniel', 'Eden', 'Fikadu', 'Genet']
last_names = ['Tesfaye', 'Alemayehu', 'Bekele', 'Gebre', 'Hailu', 'Kebede']

student_num = 0

for advisor, profile, target_load in advisors:
    current_count = AdvisorAssignment.objects.filter(advisor=advisor, is_active=True).count()
    needed = target_load - current_count
    
    if needed <= 0:
        print(f"✓ {profile.full_name}: Already has {current_count} students")
        continue
    
    print(f"\n→ Creating {needed} students for {profile.full_name}")
    
    for i in range(needed):
        student_num += 1
        
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        full_name = f"{first_name} {last_name} {student_num}"
        email = f'student{student_num:03d}@university.edu'
        university_id = f'UU/CS/2024/{student_num:04d}'
        
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
        
        if created:
            StudentProfile.objects.create(
                user=student,
                full_name=full_name,
                phone_number=f'+251{random.randint(900000000, 999999999)}',
                date_of_birth='2000-01-01',
                gender=random.choice(['MALE', 'FEMALE']),
                university_id=university_id,
                skills='Python, Django, React',
                is_eligible=True,
                year_of_study=4,
                batch='2024'
            )
        
        # Create application using raw SQL to bypass validation
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO applications 
                (student_id, internship_id, status, cover_letter, applied_at, reviewed_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (student_id, internship_id) DO UPDATE
                SET status = EXCLUDED.status,
                    updated_at = EXCLUDED.updated_at
                RETURNING id
            """, [
                student.id,
                internship.id,
                'ACCEPTED',
                f'Test application for {full_name}',
                timezone.now(),
                timezone.now(),
                timezone.now()
            ])
            app_id = cursor.fetchone()[0]
        
        # Create assignment using raw SQL
        with connection.cursor() as cursor:
            # Check if assignment exists first
            cursor.execute("""
                SELECT id FROM advisor_assignments 
                WHERE student_id = %s AND internship_id = %s
            """, [student.id, internship.id])
            
            existing = cursor.fetchone()
            
            if existing:
                # Update existing
                cursor.execute("""
                    UPDATE advisor_assignments 
                    SET advisor_id = %s, is_active = %s, updated_at = %s
                    WHERE id = %s
                """, [advisor.id, True, timezone.now(), existing[0]])
            else:
                # Insert new
                cursor.execute("""
                    INSERT INTO advisor_assignments 
                    (student_id, advisor_id, internship_id, application_id, is_active, assigned_at, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, [
                    student.id,
                    advisor.id,
                    internship.id,
                    app_id,
                    True,
                    timezone.now(),
                    timezone.now(),
                    timezone.now()
                ])
        
        if student_num % 10 == 0:
            print(f"   ✓ Created {student_num} students...")

print(f"\n✓ Total students: {student_num}")

print("\n" + "=" * 80)
print("📊 VERIFICATION")
print("=" * 80)

for advisor, profile, target_load in advisors:
    active_count = AdvisorAssignment.objects.filter(advisor=advisor, is_active=True).count()
    percentage = (active_count / profile.max_students * 100) if profile.max_students > 0 else 0
    excess = active_count - profile.max_students
    
    if active_count > profile.max_students:
        status = "🔴 OVERLOADED"
    elif percentage >= 80:
        status = "🟠 HIGH LOAD"
    else:
        status = "🟢 AVAILABLE"
    
    print(f"\n{status} {profile.full_name}")
    print(f"   Current: {active_count}/{profile.max_students} ({percentage:.1f}%)")
    if excess > 0:
        print(f"   ⚠️  Excess: +{excess} students")
    else:
        print(f"   ✅ Available: {profile.max_students - active_count} slots")

print("\n" + "=" * 80)
print("✅ TEST DATA READY!")
print("=" * 80)

print("\n🚀 NEXT STEPS:")
print("   1. Visit: http://localhost:5173/department/advisor-overload")
print("   2. Login as Department Head")
print("   3. Test the modern redesigned interface!")

print("\n🔑 TEST CREDENTIALS (password: password123):")
print("   Overloaded Advisors:")
for email, name, _, max_students, target_load in advisors_config:
    if target_load > max_students:
        print(f"   • {email}")

print("\n" + "=" * 80)
