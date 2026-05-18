"""
Create Test Data with Location-Based Advisor Overload
This script creates advisors at the same locations to test location filtering
"""
import os
import sys
import django
from datetime import timedelta
from django.utils import timezone

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.accounts.models import Department, AdvisorProfile, StudentProfile
from apps.internships.models import Internship, InternshipAssignment

User = get_user_model()

def clear_existing_data():
    """Clear existing test data"""
    print("\n🗑️  Clearing existing test data...")
    
    # Delete test users
    test_emails = [
        'overloaded.buildingA@test.edu',
        'overloaded.buildingB@test.edu',
        'available1.buildingA@test.edu',
        'available2.buildingA@test.edu',
        'available3.buildingA@test.edu',
        'available1.buildingB@test.edu',
        'available2.buildingB@test.edu',
    ]
    
    User.objects.filter(email__in=test_emails).delete()
    print("✅ Cleared existing test users")

def create_test_data():
    """Create comprehensive test data with location-based advisors"""
    
    print("\n" + "=" * 80)
    print("CREATING LOCATION-BASED ADVISOR OVERLOAD TEST DATA")
    print("=" * 80)
    
    # Clear existing data
    clear_existing_data()
    
    # Get or create department
    department, _ = Department.objects.get_or_create(
        name='Computer Science',
        defaults={'code': 'CS', 'description': 'Computer Science Department'}
    )
    print(f"\n✅ Using department: {department.name}")
    
    # Get or create a company for internships
    company, created = User.objects.get_or_create(
        email='testcompany@example.com',
        defaults={
            'username': 'testcompany@example.com',
            'user_type': 'COMPANY',
            'is_active': True,
            'is_approved': True
        }
    )
    if created:
        company.set_password('password123')
        company.save()
        print(f"✅ Created company: {company.email}")
    
    # Create or get internship
    internship, created = Internship.objects.get_or_create(
        title='Software Development Internship',
        company=company,
        defaults={
            'description': 'Full-stack development internship opportunity',
            'required_skills': 'Python, Django, React, JavaScript, PostgreSQL',
            'location': 'Addis Ababa',
            'duration_months': 6,
            'start_date': timezone.now() + timedelta(days=60),
            'max_applicants': 100,
            'status': 'OPEN',
            'is_active': True,
            'department': department
        }
    )
    print(f"✅ Using internship: {internship.title}")
    
    # Define advisor configurations with locations
    # Format: (email, name, staff_id, max_students, target_load, location)
    advisors_config = [
        # BUILDING A - OVERLOADED
        ('overloaded.buildingA@test.edu', 'Dr. Sarah Overloaded', 'ADV-BA-001', 15, 20, 'Building A, Room 101'),
        
        # BUILDING A - AVAILABLE (Same location as overloaded)
        ('available1.buildingA@test.edu', 'Dr. John Available', 'ADV-BA-002', 15, 8, 'Building A, Room 101'),
        ('available2.buildingA@test.edu', 'Dr. Mary Helper', 'ADV-BA-003', 15, 10, 'Building A, Room 101'),
        ('available3.buildingA@test.edu', 'Dr. James Ready', 'ADV-BA-004', 15, 5, 'Building A, Room 101'),
        
        # BUILDING B - OVERLOADED
        ('overloaded.buildingB@test.edu', 'Dr. Michael Critical', 'ADV-BB-001', 12, 18, 'Building B, Room 205'),
        
        # BUILDING B - AVAILABLE (Same location as overloaded)
        ('available1.buildingB@test.edu', 'Dr. Lisa Support', 'ADV-BB-002', 15, 7, 'Building B, Room 205'),
        ('available2.buildingB@test.edu', 'Dr. Robert Assist', 'ADV-BB-003', 15, 9, 'Building B, Room 205'),
    ]
    
    print("\n" + "=" * 80)
    print("CREATING ADVISORS")
    print("=" * 80)
    
    advisors = []
    
    for email, name, staff_id, max_students, target_load, location in advisors_config:
        # Create or get advisor user
        advisor, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'user_type': 'ADVISOR',
                'is_active': True,
                'is_approved': True,
                'department': department
            }
        )
        
        if created:
            advisor.set_password('password123')
            advisor.save()
        
        # Create or update advisor profile
        profile, prof_created = AdvisorProfile.objects.get_or_create(
            user=advisor,
            defaults={
                'full_name': name,
                'staff_id': staff_id,
                'max_students': max_students,
                'advising_location': location
            }
        )
        
        if not prof_created:
            profile.full_name = name
            profile.staff_id = staff_id
            profile.max_students = max_students
            profile.advising_location = location
            profile.save()
        
        advisors.append({
            'user': advisor,
            'profile': profile,
            'target_load': target_load,
            'location': location
        })
        
        status = "✅ Created" if created else "♻️  Updated"
        overload_status = f"🔴 OVERLOADED (+{target_load - max_students})" if target_load > max_students else f"🟢 AVAILABLE ({max_students - target_load} slots)"
        
        print(f"\n{status}: {name} {overload_status}")
        print(f"   Email: {email}")
        print(f"   Max: {max_students}, Target: {target_load}, Location: {location}")
    
    print("\n" + "=" * 80)
    print("CREATING STUDENTS AND ASSIGNMENTS")
    print("=" * 80)
    
    student_counter = 1
    
    for advisor_data in advisors:
        advisor = advisor_data['user']
        profile = advisor_data['profile']
        target_load = advisor_data['target_load']
        location = advisor_data['location']
        
        print(f"\n📋 Creating {target_load} students for {profile.full_name} at {location}")
        
        for i in range(target_load):
            # Create student
            student_email = f'student{student_counter}@test.edu'
            student, created = User.objects.get_or_create(
                email=student_email,
                defaults={
                    'username': student_email,
                    'user_type': 'STUDENT',
                    'is_active': True,
                    'is_approved': True,
                    'department': department
                }
            )
            
            if created:
                student.set_password('password123')
                student.save()
            
            # Create student profile
            student_profile, _ = StudentProfile.objects.get_or_create(
                user=student,
                defaults={
                    'full_name': f'Student {student_counter}',
                    'university_id': f'STU-{student_counter:04d}',
                    'batch': '2024',
                    'phone_number': f'+251911{student_counter:06d}'
                }
            )
            
            # Create internship assignment
            assignment, assign_created = InternshipAssignment.objects.get_or_create(
                student=student,
                internship=internship,
                defaults={
                    'advisor': advisor,
                    'status': 'ACCEPTED',
                    'assigned_date': timezone.now() - timedelta(days=30)
                }
            )
            
            if not assign_created and assignment.advisor != advisor:
                assignment.advisor = advisor
                assignment.save()
            
            if created or assign_created:
                print(f"   ✅ Student {student_counter}: {student_profile.full_name} → {profile.full_name}")
            
            student_counter += 1
    
    print("\n" + "=" * 80)
    print("TEST DATA SUMMARY")
    print("=" * 80)
    
    print("\n📍 BUILDING A, ROOM 101:")
    print("   🔴 Overloaded: Dr. Sarah Overloaded (20/15 students, +5 over)")
    print("   🟢 Available: Dr. John Available (8/15 students, 7 slots)")
    print("   🟢 Available: Dr. Mary Helper (10/15 students, 5 slots)")
    print("   🟢 Available: Dr. James Ready (5/15 students, 10 slots)")
    print("   📊 Total Available Capacity: 22 slots")
    
    print("\n📍 BUILDING B, ROOM 205:")
    print("   🔴 Overloaded: Dr. Michael Critical (18/12 students, +6 over)")
    print("   🟢 Available: Dr. Lisa Support (7/15 students, 8 slots)")
    print("   🟢 Available: Dr. Robert Assist (9/15 students, 6 slots)")
    print("   📊 Total Available Capacity: 14 slots")
    
    print("\n" + "=" * 80)
    print("TESTING INSTRUCTIONS")
    print("=" * 80)
    print("\n1. Login as department head")
    print("2. Navigate to Advisor Overload Resolution page")
    print("3. Click on 'Dr. Sarah Overloaded' (Building A, Room 101)")
    print("4. You should see ONLY 3 available advisors from Building A, Room 101:")
    print("   - Dr. John Available")
    print("   - Dr. Mary Helper")
    print("   - Dr. James Ready")
    print("\n5. Click on 'Dr. Michael Critical' (Building B, Room 205)")
    print("6. You should see ONLY 2 available advisors from Building B, Room 205:")
    print("   - Dr. Lisa Support")
    print("   - Dr. Robert Assist")
    
    print("\n" + "=" * 80)
    print("LOGIN CREDENTIALS")
    print("=" * 80)
    print("\n📧 All test accounts use password: password123")
    print("\nOverloaded Advisors:")
    print("   - overloaded.buildingA@test.edu (Building A)")
    print("   - overloaded.buildingB@test.edu (Building B)")
    print("\nAvailable Advisors:")
    print("   - available1.buildingA@test.edu (Building A)")
    print("   - available2.buildingA@test.edu (Building A)")
    print("   - available3.buildingA@test.edu (Building A)")
    print("   - available1.buildingB@test.edu (Building B)")
    print("   - available2.buildingB@test.edu (Building B)")
    
    print("\n" + "=" * 80)
    print("✅ TEST DATA CREATION COMPLETE!")
    print("=" * 80)

if __name__ == '__main__':
    create_test_data()
