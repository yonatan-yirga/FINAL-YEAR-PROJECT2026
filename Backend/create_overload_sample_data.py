"""
Create Sample Data for Advisor Overload Resolution Testing

This script creates:
- 3 advisors with different workloads
- 1 overloaded advisor (18 students)
- 1 high-load advisor (13 students)
- 1 underutilized advisor (5 students)
- Students with accepted applications and active assignments
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

print("=" * 70)
print("CREATING SAMPLE DATA FOR ADVISOR OVERLOAD RESOLUTION")
print("=" * 70)

# Get or create Computer Science department
try:
    dept = Department.objects.get(name='Computer Science')
    print(f"\n✓ Using existing department: {dept.name}")
except Department.DoesNotExist:
    dept = Department.objects.create(
        name='Computer Science',
        code='CS',
        head_name='Dr. Department Head',
        head_email='cs.head@university.edu'
    )
    print(f"\n✓ Created department: {dept.name}")

# Get or create a company for internships
try:
    company = User.objects.filter(role='COMPANY', is_approved=True, department=dept).first()
    if not company:
        raise User.DoesNotExist
    print(f"✓ Using existing company: {company.email}")
except:
    company = User.objects.create(
        email='techcorp@company.com',
        role='COMPANY',
        is_approved=True,
        is_active=True,
        department=dept,
        password=make_password('password123')
    )
    from apps.accounts.models import CompanyProfile
    CompanyProfile.objects.create(
        user=company,
        company_name='Tech Corp',
        phone_number='+251911000000',
        address='123 Tech Street',
        city='Addis Ababa',
        contact_person_name='John Manager',
        contact_person_title='HR Manager',
        description='Leading tech company'
    )
    print(f"✓ Created company: {company.email}")

# Create or get internship
try:
    internship = Internship.objects.filter(company=company, department=dept, is_active=True).first()
    if not internship:
        raise Internship.DoesNotExist
    # Make sure it's accepting applications
    internship.is_active = True
    internship.save()
    print(f"✓ Using existing internship: {internship.title}")
except:
    internship = Internship.objects.create(
        company=company,
        department=dept,
        title='Software Engineering Intern',
        description='Full-stack development internship',
        required_skills='Python, Django, React',
        location='Addis Ababa',
        duration_months=6,
        start_date=timezone.now().date(),
        end_date=(timezone.now() + timedelta(days=180)).date(),
        is_active=True
    )
    print(f"✓ Created internship: {internship.title}")

print("\n" + "=" * 70)
print("CREATING ADVISORS")
print("=" * 70)

advisors_data = [
    {
        'email': 'overloaded.advisor@university.edu',
        'name': 'Dr. Overloaded Smith',
        'staff_id': 'ADV001',
        'max_students': 15,
        'target_students': 18,  # Overloaded
        'location': 'Building A, Room 101'
    },
    {
        'email': 'highload.advisor@university.edu',
        'name': 'Dr. HighLoad Johnson',
        'staff_id': 'ADV002',
        'max_students': 15,
        'target_students': 13,  # High load
        'location': 'Building A, Room 102'
    },
    {
        'email': 'available.advisor@university.edu',
        'name': 'Dr. Available Williams',
        'staff_id': 'ADV003',
        'max_students': 15,
        'target_students': 5,  # Underutilized
        'location': 'Building A, Room 103'
    },
]

created_advisors = []

for adv_data in advisors_data:
    # Create or get advisor user
    advisor, created = User.objects.get_or_create(
        email=adv_data['email'],
        defaults={
            'role': 'ADVISOR',
            'is_approved': True,
            'is_active': True,
            'department': dept,
            'password': make_password('password123')
        }
    )
    
    # Create or update advisor profile
    profile, prof_created = AdvisorProfile.objects.get_or_create(
        user=advisor,
        defaults={
            'full_name': adv_data['name'],
            'phone_number': '+251911000001',
            'staff_id': adv_data['staff_id'],
            'max_students': adv_data['max_students'],
            'advising_location': adv_data['location']
        }
    )
    
    if not prof_created:
        profile.max_students = adv_data['max_students']
        profile.advising_location = adv_data['location']
        profile.save()
    
    created_advisors.append({
        'user': advisor,
        'profile': profile,
        'target': adv_data['target_students']
    })
    
    status = "Created" if created else "Updated"
    print(f"\n{status}: {adv_data['name']}")
    print(f"  Email: {adv_data['email']}")
    print(f"  Max Students: {adv_data['max_students']}")
    print(f"  Target Load: {adv_data['target_students']}")

print("\n" + "=" * 70)
print("CREATING STUDENTS AND ASSIGNMENTS")
print("=" * 70)

total_students_needed = sum(adv['target'] for adv in created_advisors)
print(f"\nTotal students needed: {total_students_needed}")

student_count = 0

for advisor_data in created_advisors:
    advisor = advisor_data['user']
    target = advisor_data['target']
    
    print(f"\n→ Assigning {target} students to {advisor.advisor_profile.full_name}")
    
    for i in range(target):
        student_count += 1
        student_email = f'student.overload{student_count:03d}@university.edu'
        
        # Create student user
        student, created = User.objects.get_or_create(
            email=student_email,
            defaults={
                'role': 'STUDENT',
                'is_approved': True,
                'is_active': True,
                'department': dept,
                'password': make_password('password123')
            }
        )
        
        # Create student profile
        if created:
            StudentProfile.objects.create(
                user=student,
                full_name=f'Test Student {student_count:03d}',
                phone_number=f'+25191100{student_count:04d}',
                date_of_birth='2000-01-01',
                gender='MALE' if student_count % 2 == 0 else 'FEMALE',
                university_id=f'STU{student_count:05d}',
                skills='Python, Django, React',
                is_eligible=True,
                year_of_study=4,
                batch='2024'
            )
        
        # Create application
        application, app_created = Application.objects.get_or_create(
            student=student,
            internship=internship,
            defaults={
                'status': 'ACCEPTED',
                'cover_letter': 'Sample cover letter',
                'applied_at': timezone.now(),
                'reviewed_at': timezone.now()
            }
        )
        
        if not app_created and application.status != 'ACCEPTED':
            application.status = 'ACCEPTED'
            application.reviewed_at = timezone.now()
            application.save()
        
        # Create advisor assignment
        assignment, assign_created = AdvisorAssignment.objects.get_or_create(
            student=student,
            advisor=advisor,
            internship=internship,
            defaults={
                'application': application,
                'is_active': True,
                'assigned_at': timezone.now()
            }
        )
        
        if not assign_created and not assignment.is_active:
            assignment.is_active = True
            assignment.save()
        
        if student_count % 5 == 0:
            print(f"  ✓ Created {student_count} students...")

print(f"\n✓ Total students created/updated: {student_count}")

print("\n" + "=" * 70)
print("VERIFICATION")
print("=" * 70)

for advisor_data in created_advisors:
    advisor = advisor_data['user']
    profile = advisor_data['profile']
    
    active_count = AdvisorAssignment.objects.filter(
        advisor=advisor,
        is_active=True
    ).count()
    
    percentage = (active_count / profile.max_students * 100) if profile.max_students > 0 else 0
    excess = active_count - profile.max_students
    
    status_icon = "🔴" if active_count > profile.max_students else "🟠" if active_count >= 12 else "🟢"
    status_text = "OVERLOADED" if active_count > profile.max_students else "HIGH LOAD" if active_count >= 12 else "NORMAL"
    
    print(f"\n{status_icon} {profile.full_name}")
    print(f"   Email: {advisor.email}")
    print(f"   Active Students: {active_count}/{profile.max_students} ({percentage:.1f}%)")
    print(f"   Status: {status_text}")
    if excess > 0:
        print(f"   Excess: +{excess} students over limit")
    else:
        print(f"   Available: {profile.max_students - active_count} slots")

print("\n" + "=" * 70)
print("SAMPLE DATA CREATION COMPLETE!")
print("=" * 70)

print("\n📋 SUMMARY:")
print(f"   • Created/Updated {len(created_advisors)} advisors")
print(f"   • Created/Updated {student_count} students")
print(f"   • Created {student_count} applications (ACCEPTED)")
print(f"   • Created {student_count} advisor assignments (ACTIVE)")

print("\n🚀 NEXT STEPS:")
print("   1. Restart Django server: python manage.py runserver 0.0.0.0:8000")
print("   2. Login as Department Head")
print("   3. Go to: http://localhost:5173/department/advisor-overload")
print("   4. You should see:")
print("      • 1 overloaded advisor (18/15 students)")
print("      • 1 high-load advisor (13/15 students)")
print("      • 1 available advisor (5/15 students)")

print("\n🔑 TEST CREDENTIALS:")
print("   Advisors:")
for adv_data in advisors_data:
    print(f"   • {adv_data['email']} / password123")
print("\n   Students:")
print("   • student.overload001@university.edu / password123")
print("   • student.overload002@university.edu / password123")
print("   • ... (up to student.overload036@university.edu)")

print("\n✅ Ready to test advisor overload resolution!")
print("=" * 70)
