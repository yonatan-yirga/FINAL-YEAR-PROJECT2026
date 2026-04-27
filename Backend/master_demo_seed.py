import os
import django
import random
from datetime import date, timedelta
from django.utils import timezone

# ── 1. Setup Django Environment ──────────────────────────────────────────────
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.departments.models import Department
from apps.internships.models import Internship
from apps.applications.models import Application
from apps.accounts.models import StudentProfile, CompanyProfile, AdvisorProfile
from apps.reports.models import MonthlyReport, FinalReport, StudentFinalReport
from apps.certificates.models import Certificate
from apps.notifications.services import NotificationService

User = get_user_model()

def clear_data():
    print("🧹 Clearing existing demo data...")
    Certificate.objects.all().delete()
    FinalReport.objects.all().delete()
    StudentFinalReport.objects.all().delete()
    MonthlyReport.objects.all().delete()
    Application.objects.all().delete()
    Internship.objects.all().delete()
    # We keep users/departments to avoid orphan references unless specified
    print("✅ Data cleared.")

def create_user(email, role, name, dept=None):
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'role': role, 
            'is_approved': True, 
            'is_active': True,
            'department': dept
        }
    )
    user.set_password('password123')
    user.is_active = True
    user.is_approved = True
    user.department = dept
    if role == 'ADMIN':
        user.is_staff = True
        user.is_superuser = True
    user.save()
    
    if role == 'STUDENT':
        StudentProfile.objects.update_or_create(user=user, defaults={
            'full_name': name,
            'university_id': f'STUD/{random.randint(100,999)}/15',
            'phone_number': f'+2519{random.randint(10000000, 99999999)}',
            'date_of_birth': date.today() - timedelta(days=365 * 20)
        })
    elif role == 'COMPANY':
        CompanyProfile.objects.update_or_create(user=user, defaults={
            'company_name': name,
            'contact_person_name': 'Demo Manager',
            'address': 'Addis Ababa, Ethiopia'
        })
    elif role == 'ADVISOR':
        AdvisorProfile.objects.update_or_create(user=user, defaults={
            'full_name': name,
            'staff_id': f'AD-{random.randint(1000,9999)}'
        })
    return user

def seed_master_demo():
    print("🚀 Starting Master Demo Seeding...")
    clear_data()

    # 1. Departments
    soft_dept, _ = Department.objects.get_or_create(name='Software Engineering', defaults={'head_name': 'Dr. Software', 'email': 'se@example.com'})
    cs_dept, _   = Department.objects.get_or_create(name='Computer Science', defaults={'head_name': 'Dr. CS', 'email': 'cs@example.com'})

    # 2. Key Actors
    admin    = create_user('admin@example.com', 'ADMIN', 'System Admin')
    uil      = create_user('uil@example.com', 'UIL', 'UIL Coordinator')
    dept_head= create_user('depthead@example.com', 'DEPARTMENT_HEAD', 'Dr. Software', soft_dept)
    advisor  = create_user('advisor@example.com', 'ADVISOR', 'Dr. Solomon', soft_dept)
    company  = create_user('ethio@telecom.com', 'COMPANY', 'Ethio Telecom', soft_dept)
    company_cs = create_user('design@tech.com', 'COMPANY', 'Tech Design Studio', cs_dept)
    
    # ── SCENARIO 1: THE SUCCESS STORY (HANAN) ──────────────────────────────────
    print("🎓 Seeding Scenario: Hanan (COMPLETED)...")
    hanan = create_user('yobg234@gmail.com', 'STUDENT', 'Hanan Mohammed', soft_dept)
    
    # Internship
    intern_hanan = Internship.objects.create(
        title='Network Security Intern', company=company, department=soft_dept,
        status='OPEN', is_active=True, duration_months=4,
        description='Securing network infrastructure and testing vulnerabilities.',
        required_skills='Networking, Security, Linux', location='Addis Ababa',
        start_date=date.today()
    )
    
    # Application & Assignment
    app_hanan = Application.objects.create(student=hanan, internship=intern_hanan, status='ACCEPTED')

    Internship.objects.filter(pk=intern_hanan.pk).update(
        start_date=date.today() - timedelta(days=130),
        status='CLOSED', is_active=False
    )
    intern_hanan.refresh_from_db()
    from apps.advisors.models import AdvisorAssignment
    assignment_hanan = AdvisorAssignment.objects.create(
        student=hanan, advisor=advisor, internship=intern_hanan, 
        is_active=False, completed_at=timezone.now()
    )
    
    # 4 Months of Monthly Reports
    perf_labels = ['EXCELLENT', 'VERY_GOOD', 'GOOD', 'EXCELLENT']
    for i in range(1, 5):
        rep = MonthlyReport.objects.create(
            student=hanan, company=company, advisor_assignment=assignment_hanan,
            report_month=i, attendance_rate=random.randint(90, 100),
            performance_rating=perf_labels[i-1],
            comments=f"Working hard in Month {i}. Great progress.",
            tasks_completed="Completed all assigned tasks for the month.",
            submitted_by=company
        )
        MonthlyReport.objects.filter(pk=rep.pk).update(
            submitted_at=timezone.now() - timedelta(days=(5-i)*30)
        )
    
    # Final Reports
    StudentFinalReport.objects.create(
        student=hanan, advisor_assignment=assignment_hanan,
        summary="Completed all tasks successfully.", status='APPROVED'
    )
    
    final_rep = FinalReport.objects.create(
        student=hanan, company=company, advisor=advisor, advisor_assignment=assignment_hanan,
        company_score=48, advisor_score=47, overall_grade='A', 
        status='COMPLETED', company_recommendation='YES',
        internship_duration='4 Months', company_performance_assessment='Excellent work',
        company_submitted_at=timezone.now() - timedelta(days=10),
        advisor_submitted_at=timezone.now() - timedelta(days=5)
    )
    
    # Certificate
    Certificate.objects.create(
        student=hanan, final_report=final_rep, issued_by=dept_head,
        student_name=hanan.student_profile.full_name,
        student_university_id=hanan.student_profile.university_id,
        company_name=company.company_profile.company_name,
        internship_title=intern_hanan.title,
        department_name=soft_dept.name,
        advisor_name=advisor.advisor_profile.full_name,
        start_date=intern_hanan.start_date,
        end_date=date.today() - timedelta(days=5),
        duration_months=4, performance_grade='A',
        certificate_id=f"DMU-CERT-{random.randint(10000,99999)}",
        verification_code=f"V-{random.randint(1000,9999)}",
        is_generated=True
    )

    # ── SCENARIO 2: THE ACTIVE PULSE (YONAS) ───────────────────────────────────
    print("📡 Seeding Scenario: Yonas (ACTIVE - MONTH 2)...")
    yonas = create_user('yonas@example.com', 'STUDENT', 'Yonas Tesfaye', soft_dept)
    intern_yonas = Internship.objects.create(
        title='Software Developer', company=company, department=soft_dept,
        status='OPEN', is_active=True, duration_months=4,
        description='Developing web applications.',
        required_skills='Python, Django, React', location='Addis Ababa',
        start_date=date.today()
    )
    # create app so student is assigned
    Application.objects.create(student=yonas, internship=intern_yonas, status='ACCEPTED')

    Internship.objects.filter(pk=intern_yonas.pk).update(
        start_date=date.today() - timedelta(days=45),
        status='CLOSED'
    )
    intern_yonas.refresh_from_db()

    assignment_yonas = AdvisorAssignment.objects.create(
        student=yonas, advisor=advisor, internship=intern_yonas, is_active=True
    )
    # Month 1 submitted
    rep_yonas = MonthlyReport.objects.create(
        student=yonas, company=company, advisor_assignment=assignment_yonas,
        report_month=1, attendance_rate=95, performance_rating='VERY_GOOD',
        comments="Good start.", tasks_completed="Initial orientation and training.",
        submitted_by=company
    )
    MonthlyReport.objects.filter(pk=rep_yonas.pk).update(
        submitted_at=timezone.now() - timedelta(days=15)
    )

    # ── SCENARIO 3: THE RECRUITMENT HUB ────────────────────────────────────────
    print("💼 Seeding Scenario: Recruitment...")
    hana = create_user('hana@example.com', 'STUDENT', 'Hana Girma', cs_dept)
    intern_open = Internship.objects.create(
        title='UX/UI Design Intern', company=company_cs, department=cs_dept,
        status='OPEN', is_active=True, max_applicants=10, duration_months=3,
        description='Designing user interfaces and experiences.',
        required_skills='Figma, UI Design, UX Research', location='Addis Ababa',
        start_date=date.today() + timedelta(days=15)
    )
    Application.objects.create(student=hana, internship=intern_open, status='PENDING')
    
    # ── SCENARIO 4: FINAL EVALUATION PENDING ──────────────────────────────────
    print("⚖️ Seeding Scenario: Sara (PENDING EVALUATION)...")
    sara = create_user('sara@example.com', 'STUDENT', 'Sara Belay', soft_dept)
    intern_sara = Internship.objects.create(
        title='Database Admin', company=company, department=soft_dept,
        status='OPEN', is_active=True, duration_months=3,
        description='Managing databases and optimizing queries.',
        required_skills='SQL, PostgreSQL, Database Design', location='Addis Ababa',
        start_date=date.today()
    )
    # create app
    Application.objects.create(student=sara, internship=intern_sara, status='ACCEPTED')

    Internship.objects.filter(pk=intern_sara.pk).update(
        start_date=date.today() - timedelta(days=95),
        status='CLOSED'
    )
    intern_sara.refresh_from_db()

    assignment_sara = AdvisorAssignment.objects.create(
        student=sara, advisor=advisor, internship=intern_sara, is_active=True
    )
    # Both student and company submitted final reports
    StudentFinalReport.objects.create(
        student=sara, advisor_assignment=assignment_sara, 
        summary="Finished the database migration.", status='PENDING'
    )
    FinalReport.objects.create(
        student=sara, company=company, advisor=advisor, advisor_assignment=assignment_sara,
        company_score=45, status='PENDING_ADVISOR',
        company_recommendation='YES', internship_duration='3 Months',
        company_performance_assessment='Did a great job with DB migration.',
        company_submitted_at=timezone.now() - timedelta(days=2)
    )

    print("\n🏁 Master Demo Seeding Complete!")
    print(f"{'-'*40}")
    print("CREDENTIALS:")
    print("Admin:   admin@example.com / password123")
    print("UIL:     uil@example.com / password123")
    print("Dept:    depthead@example.com / password123")
    print("Advisor: advisor@example.com / password123")
    print("Company: ethio@telecom.com / password123")
    print("Student: yobg234@gmail.com / password123 (COMPLETED)")
    print(f"{'-'*40}")

if __name__ == "__main__":
    seed_master_demo()
