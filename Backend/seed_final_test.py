import os
import django
import random
from django.utils import timezone

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.reports.models import FinalReport, StudentFinalReport
from apps.advisors.models import AdvisorAssignment

def seed_final_evaluation():
    # 1. Get an active assignment
    assignment = AdvisorAssignment.objects.filter(is_active=True).first()
    
    if not assignment:
        print("No active assignment found to seed.")
        return

    print(f"Seeding evaluation for Student: {assignment.student.get_full_name()} | Advisor: {assignment.advisor.get_full_name()}")

    # 2. Create Student Final Report (Mock upload)
    # Check if student report already exists
    student_report, created = StudentFinalReport.objects.update_or_create(
        advisor_assignment=assignment,
        student=assignment.student,
        defaults={
            'summary': "I have successfully completed my internship at " + assignment.internship.company.email + ". I developed several key modules and learned about professional software development.",
            'report_file': 'reports/final/test_report.pdf',
            'status': 'PENDING'
        }
    )
    if created:
        print(f"Created Student Final Report (Pending Advisor Review)")
    else:
        print(f"Student Final Report already exists")

    # 3. Create/Update FinalReport (Company Evaluation)
    # This represents Stage 1 completion
    report, created = FinalReport.objects.update_or_create(
        advisor_assignment=assignment,
        student=assignment.student,
        defaults={
            'company': assignment.internship.company,
            'advisor': assignment.advisor,
            'internship_duration': "3 Months",
            'company_performance_assessment': "The student demonstrated exceptional problem-solving skills and was a great asset to our team. They are highly recommended for future employment.",
            'company_recommendation': 'YES',
            'company_score': 85,
            'company_submitted_at': timezone.now(),
            'status': 'PENDING_ADVISOR'
        }
    )
    
    if created:
        print(f"Created Final Evaluation (Stage 1: Company Complete)")
    else:
        print(f"Updated existing Final Evaluation to Stage 1 Complete")

    print("\nSUCCESS: The Advisor dashboard should now show 1 Pending Report.")
    print(f"Go to: http://localhost:5173/advisor/final-reports")

if __name__ == "__main__":
    seed_final_evaluation()
