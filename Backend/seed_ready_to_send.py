import os
import django
import random
from django.utils import timezone
from datetime import timedelta, date

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.advisors.models import AdvisorAssignment
from apps.internships.models import Internship
from apps.applications.models import Application
from apps.reports.models import StudentMonthlyReport, MonthlyReport, FinalReport, StudentFinalReport
from apps.departments.models import Department

User = get_user_model()

def seed_ready_to_send():
    print("Seeding a 'Finished' student for Final Evaluation walkthrough...")

    # 1. Setup/Get Users
    dept = Department.objects.first()
    if not dept:
        print("No department found. Please seed departments first.")
        return

    # Student
    student, _ = User.objects.get_or_create(
        email='ready_student@example.com',
        defaults={
            'username': 'ready_student',
            'first_name': 'Ready',
            'last_name': 'Student',
            'role': 'STUDENT',
            'department': dept
        }
    )
    student.set_password('password123')
    student.save()
    
    # Advisor
    advisor, _ = User.objects.get_or_create(
        email='advisor@example.com',
        defaults={
            'username': 'advisor_eval',
            'first_name': 'Evaluation',
            'last_name': 'Advisor',
            'role': 'ADVISOR',
            'department': dept
        }
    )
    advisor.set_password('password123')
    advisor.save()
    
    # Company
    company, _ = User.objects.get_or_create(
        email='company@example.com',
        defaults={
            'username': 'demo_company',
            'first_name': 'Demo',
            'last_name': 'Company',
            'role': 'COMPANY',
            'department': dept
        }
    )
    company.set_password('password123')
    company.save()

    # 2. Setup Internship & Application
    internship, _ = Internship.objects.get_or_create(
        company=company,
        title='Full Stack Developer',
        defaults={
            'description': 'Working on production apps.',
            'required_skills': 'React, Django',
            'department': dept,
            'location': 'Addis Ababa',
            'internship_type': 'FULL_TIME',
            'start_date': date.today() - timedelta(days=95),
            'end_date': date.today() - timedelta(days=5),
            'application_deadline': date.today() - timedelta(days=100),
            'max_applicants': 10
        }
    )

    app, _ = Application.objects.get_or_create(
        student=student,
        internship=internship,
        defaults={
            'status': 'ACCEPTED',
            'about_me': 'I am ready.',
            'experience': 'None.',
        }
    )

    # 3. Setup Advisor Assignment
    assignment, _ = AdvisorAssignment.objects.get_or_create(
        student=student,
        advisor=advisor,
        internship=internship,
        defaults={
            'internship_title': internship.title,
            'company_name': company.username,
            'internship_location': internship.location,
            'internship_duration': '3 months',
            'start_date': internship.start_date,
            'end_date': internship.end_date,
            'is_active': True
        }
    )

    # 4. Create 3 Monthly Reports (Student & Company)
    for month in range(1, 4):
        # Student Monthly
        StudentMonthlyReport.objects.get_or_create(
            student=student,
            advisor_assignment=assignment,
            report_month=month,
            defaults={
                'tasks_performed': f'Completed all coding tasks for month {month}.',
                'skills_learned': 'React, Django, and System Design.',
                'challenges_faced': 'Time management.',
                'hours_worked': 160,
                'submitted_at': timezone.now() - timedelta(days=100 - (month * 30))
            }
        )
        # Company Monthly
        MonthlyReport.objects.get_or_create(
            student=student,
            company=company,
            advisor_assignment=assignment,
            report_month=month,
            defaults={
                'attendance_rate': 98.5,
                'performance_rating': 'EXCELLENT',
                'tasks_completed': f'Successful delivery of features for month {month}.',
                'comments': 'Great work!',
                'submitted_at': timezone.now() - timedelta(days=95 - (month * 30))
            }
        )

    # 5. Create Student Final Report (Upload)
    StudentFinalReport.objects.get_or_create(
        student=student,
        advisor_assignment=assignment,
        defaults={
            'summary': 'This internship was transformative. I built a production-ready application.',
            'report_file': 'reports/final/demo_report.pdf',
            'status': 'APPROVED'
        }
    )

    # 6. Create FinalReport Container (Ready for Advisor)
    FinalReport.objects.get_or_create(
        student=student,
        company=company,
        advisor=advisor,
        advisor_assignment=assignment,
        defaults={
            'internship_duration': '3 months',
            'company_performance_assessment': 'Ready Student has been an exceptional addition to our dev team. Highly recommended.',
            'company_recommendation': 'YES',
            'company_score': 92,
            'company_submitted_at': timezone.now() - timedelta(days=2),
            'status': 'PENDING_ADVISOR'
        }
    )

    print("\nSUCCESS!")
    print(f"Student: ready_student@example.com / password123")
    print(f"Advisor: advisor@example.com / password123")
    print(f"Login as Advisor to see the 'Complete Evaluation' button.")
    print(f"URL: http://localhost:5173/advisor/final-reports")

if __name__ == "__main__":
    seed_ready_to_send()
