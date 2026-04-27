"""
Django Management Command: Create Sample Data for Testing Advisor Evaluation Workflow
Usage: python manage.py create_sample_data
"""
import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from apps.accounts.models import (
    StudentProfile, CompanyProfile, AdvisorProfile, DepartmentHeadProfile
)
from apps.departments.models import Department
from apps.internships.models import Internship
from apps.advisors.models import AdvisorAssignment
from apps.reports.models import FinalReport, StudentFinalReport
from apps.applications.models import Application

User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample data for testing the advisor evaluation workflow'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clean',
            action='store_true',
            help='Clean existing sample data before creating new data',
        )

    def handle(self, *args, **options):
        if options['clean']:
            self.stdout.write('Cleaning existing sample data...')
            self.clean_sample_data()

        self.stdout.write('Creating sample data for advisor evaluation workflow...')
        
        # Create departments
        cs_dept = self.create_department()
        
        # Create users and profiles
        students = self.create_students(cs_dept)
        companies = self.create_companies()
        advisors = self.create_advisors(cs_dept)
        dept_head = self.create_department_head(cs_dept)
        
        # Create internships and applications
        internships = self.create_internships(companies)
        applications = self.create_applications(students, internships)
        
        # Create advisor assignments
        assignments = self.create_advisor_assignments(students, advisors, internships)
        
        # Create sample reports in different stages
        self.create_sample_reports(assignments)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created sample data:\n'
                f'- {len(students)} students\n'
                f'- {len(companies)} companies\n'
                f'- {len(advisors)} advisors\n'
                f'- 1 department head\n'
                f'- {len(internships)} internships\n'
                f'- {len(assignments)} advisor assignments\n'
                f'- Sample reports in various stages'
            )
        )
        
        self.stdout.write('\n' + '='*60)
        self.stdout.write('TEST ACCOUNTS CREATED:')
        self.stdout.write('='*60)
        
        # Display login credentials
        self.stdout.write('\n📚 STUDENTS:')
        for i, student in enumerate(students, 1):
            self.stdout.write(f'  Student {i}: {student.email} / password123')
            
        self.stdout.write('\n🏢 COMPANIES:')
        for i, company in enumerate(companies, 1):
            self.stdout.write(f'  Company {i}: {company.email} / password123')
            
        self.stdout.write('\n👨‍🏫 ADVISORS:')
        for i, advisor in enumerate(advisors, 1):
            self.stdout.write(f'  Advisor {i}: {advisor.email} / password123')
            
        self.stdout.write(f'\n🏛️ DEPARTMENT HEAD:')
        self.stdout.write(f'  Dept Head: {dept_head.email} / password123')
        
        self.stdout.write('\n' + '='*60)
        self.stdout.write('WORKFLOW TESTING GUIDE:')
        self.stdout.write('='*60)
        self.stdout.write('1. Login as advisor1@test.com')
        self.stdout.write('2. Go to /advisor/final-reports')
        self.stdout.write('3. Complete evaluations for students')
        self.stdout.write('4. Login as depthead@cs.test.com')
        self.stdout.write('5. Go to /department/final-reports')
        self.stdout.write('6. Approve reports and issue certificates')
        self.stdout.write('='*60)

    def clean_sample_data(self):
        """Clean existing sample data"""
        # Delete test users (this will cascade to related objects)
        User.objects.filter(email__endswith='@test.com').delete()
        
        # Clean up any orphaned data
        Department.objects.filter(name__startswith='Computer Science Test').delete()

    def create_department(self):
        """Create a test department"""
        dept, created = Department.objects.get_or_create(
            name='Computer Science Test Dept',
            defaults={
                'head_name': 'Dr. Michael Thompson',
                'email': 'cs-dept@test.com',
                'phone_number': '+1234567890'
            }
        )
        return dept

    def create_students(self, department):
        """Create test students"""
        students = []
        student_data = [
            {'name': 'John Doe', 'email': 'student1@test.com', 'student_id': 'CS2021001'},
            {'name': 'Jane Smith', 'email': 'student2@test.com', 'student_id': 'CS2021002'},
            {'name': 'Mike Johnson', 'email': 'student3@test.com', 'student_id': 'CS2021003'},
            {'name': 'Sarah Wilson', 'email': 'student4@test.com', 'student_id': 'CS2021004'},
        ]
        
        for data in student_data:
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'role': 'STUDENT',
                    'is_approved': True,
                    'is_active': True,
                    'department': department
                }
            )
            if created:
                user.set_password('password123')
                user.save()
                
                StudentProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'full_name': data['name'],
                        'university_id': data['student_id'],
                        'phone_number': '+1234567890',
                        'date_of_birth': '2000-01-01',
                        'gender': 'MALE',
                        'skills': 'Python, JavaScript, React, Django, SQL',
                        'headline': 'Computer Science Student',
                        'about': f'Computer Science student interested in software development.',
                        'location': 'Test City, Test Country',
                        'experience': 'Various programming projects and coursework',
                        'education': 'Bachelor of Computer Science',
                        'is_eligible': True
                    }
                )
            students.append(user)
        
        return students

    def create_companies(self):
        """Create test companies"""
        companies = []
        company_data = [
            {'name': 'TechCorp Solutions', 'email': 'company1@test.com'},
            {'name': 'InnovateSoft Ltd', 'email': 'company2@test.com'},
            {'name': 'DataDrive Systems', 'email': 'company3@test.com'},
        ]
        
        # Get the department to assign to companies
        dept = Department.objects.filter(name='Computer Science Test Dept').first()
        
        for data in company_data:
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'role': 'COMPANY',
                    'is_approved': True,
                    'is_active': True,
                    'department': dept
                }
            )
            if created:
                user.set_password('password123')
                user.save()
                
                CompanyProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'company_name': data['name'],
                        'phone_number': '+1234567890',
                        'address': 'Test Address, Test City',
                        'city': 'Test City',
                        'contact_person_name': 'John Manager',
                        'contact_person_title': 'HR Manager',
                        'description': f'{data["name"]} is a leading technology company.'
                    }
                )
            companies.append(user)
        
        return companies

    def create_advisors(self, department):
        """Create test advisors"""
        advisors = []
        advisor_data = [
            {'name': 'Dr. Alice Brown', 'email': 'advisor1@test.com'},
            {'name': 'Prof. Robert Davis', 'email': 'advisor2@test.com'},
        ]
        
        for data in advisor_data:
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'role': 'ADVISOR',
                    'is_approved': True,
                    'is_active': True,
                    'department': department
                }
            )
            if created:
                user.set_password('password123')
                user.save()
                
                AdvisorProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'full_name': data['name'],
                        'phone_number': '+1234567890',
                        'staff_id': f'STAFF{random.randint(1000, 9999)}',
                        'max_students': 10
                    }
                )
            advisors.append(user)
        
        return advisors

    def create_department_head(self, department):
        """Create test department head"""
        user, created = User.objects.get_or_create(
            email='depthead@cs.test.com',
            defaults={
                'role': 'DEPARTMENT_HEAD',
                'is_approved': True,
                'is_active': True,
                'department': department
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            
            DepartmentHeadProfile.objects.get_or_create(
                user=user,
                defaults={
                    'full_name': 'Dr. Michael Thompson',
                    'phone_number': '+1-555-0123'
                }
            )
        
        return user

    def create_internships(self, companies):
        """Create test internships"""
        internships = []
        internship_titles = [
            'Software Developer Intern',
            'Full Stack Developer Intern', 
            'Data Analyst Intern',
            'Frontend Developer Intern',
            'Backend Developer Intern',
            'Mobile App Developer Intern'
        ]
        
        title_index = 0
        for i, company in enumerate(companies):
            for j in range(2):  # 2 internships per company
                title = internship_titles[title_index % len(internship_titles)]
                title_index += 1
                
                internship, created = Internship.objects.get_or_create(
                    title=title,
                    company=company,
                    defaults={
                        'description': f'Exciting internship opportunity in {title.lower()}.',
                        'required_skills': 'Programming skills, good communication, team player',
                        'location': random.choice(['Remote', 'On-site', 'Hybrid']),
                        'duration_months': 3,
                        'start_date': timezone.now().date() + timedelta(days=60),
                        'end_date': timezone.now().date() + timedelta(days=150),
                        'application_deadline': timezone.now().date() + timedelta(days=30),
                        'max_applicants': random.randint(3, 8),
                        'is_active': True,
                        'status': 'OPEN',
                        'department': company.department
                    }
                )
                internships.append(internship)
        
        return internships

    def create_applications(self, students, internships):
        """Create test applications"""
        applications = []
        
        for i, student in enumerate(students):
            # Each student applies to one internship only
            internship = internships[i % len(internships)]
            
            application, created = Application.objects.get_or_create(
                student=student,
                internship=internship,
                defaults={
                    'cover_letter': f'I am very interested in the {internship.title} position...',
                    'status': 'ACCEPTED',  # Make them accepted for assignment
                    'applied_at': timezone.now() - timedelta(days=random.randint(30, 90))
                }
            )
            applications.append(application)
        
        return applications

    def create_advisor_assignments(self, students, advisors, internships):
        """Create advisor assignments"""
        assignments = []
        
        for i, student in enumerate(students):
            # Find an accepted application for this student
            accepted_app = Application.objects.filter(
                student=student, 
                status='ACCEPTED'
            ).first()
            
            if accepted_app:
                advisor = advisors[i % len(advisors)]  # Distribute students among advisors
                
                assignment, created = AdvisorAssignment.objects.get_or_create(
                    student=student,
                    advisor=advisor,
                    internship=accepted_app.internship,
                    defaults={
                        'application': accepted_app,
                        'assigned_at': timezone.now() - timedelta(days=random.randint(60, 120)),
                        'is_active': True
                    }
                )
                assignments.append(assignment)
        
        return assignments

    def create_sample_reports(self, assignments):
        """Create sample reports in different stages"""
        if not assignments:
            return
            
        # Scenario 1: Student has submitted report, company has evaluated, ready for advisor
        assignment1 = assignments[0]
        self.create_complete_scenario(assignment1, 'PENDING_ADVISOR')
        
        # Scenario 2: Company has submitted, no student report yet, advisor can initiate
        if len(assignments) > 1:
            assignment2 = assignments[1]
            self.create_company_only_scenario(assignment2)
        
        # Scenario 3: Advisor has completed, sent to department head
        if len(assignments) > 2:
            assignment3 = assignments[2]
            self.create_complete_scenario(assignment3, 'SUBMITTED_TO_DEPARTMENT')
        
        # Scenario 4: Department head approved, ready for certificate
        if len(assignments) > 3:
            assignment4 = assignments[3]
            self.create_complete_scenario(assignment4, 'APPROVED_BY_DEPARTMENT')

    def create_complete_scenario(self, assignment, final_status):
        """Create a complete scenario with student report and company evaluation"""
        # Create student final report
        student_report, created = StudentFinalReport.objects.get_or_create(
            student=assignment.student,
            advisor_assignment=assignment,
            defaults={
                'summary': 'This report summarizes my internship experience and learning outcomes.',
                'status': 'APPROVED',
                'submitted_at': timezone.now() - timedelta(days=10),
                'advisor_feedback': 'Good work on the report structure and content.'
            }
        )
        
        # Create final report with company evaluation
        final_report, created = FinalReport.objects.get_or_create(
            advisor_assignment=assignment,
            defaults={
                'student': assignment.student,
                'company': assignment.internship.company,
                'advisor': assignment.advisor,
                'status': final_status,
                'internship_duration': '3 months',
                'company_performance_assessment': 'Excellent performance throughout the internship. Showed strong technical skills and professional attitude.',
                'company_recommendation': 'YES',
                'company_score': random.randint(75, 95),
                'company_submitted_at': timezone.now() - timedelta(days=8),
            }
        )
        
        # If advisor has completed, add advisor evaluation
        if final_status in ['SUBMITTED_TO_DEPARTMENT', 'APPROVED_BY_DEPARTMENT']:
            final_report.advisor_score = random.randint(80, 95)
            final_report.advisor_evaluation = 'Student demonstrated excellent academic understanding and applied theoretical knowledge effectively during the internship.'
            final_report.criteria_scores = {
                'technical_competency': random.randint(80, 95),
                'professional_behavior': random.randint(85, 95),
                'learning_attitude': random.randint(80, 90),
                'communication_skills': random.randint(75, 90),
                'problem_solving': random.randint(80, 95)
            }
            final_report.advisor_submitted_at = timezone.now() - timedelta(days=5)
            final_report.save()
        
        # If department head approved
        if final_status == 'APPROVED_BY_DEPARTMENT':
            # Find the department head user
            dept_head_user = User.objects.filter(
                role='DEPARTMENT_HEAD',
                department=assignment.student.department
            ).first()
            
            final_report.department_approved = True
            final_report.department_head = dept_head_user
            final_report.department_reviewed_at = timezone.now() - timedelta(days=2)
            final_report.department_review_comments = 'Report approved. Student has successfully completed all requirements.'
            final_report.save()

    def create_company_only_scenario(self, assignment):
        """Create scenario where only company has submitted evaluation"""
        final_report, created = FinalReport.objects.get_or_create(
            advisor_assignment=assignment,
            defaults={
                'student': assignment.student,
                'company': assignment.internship.company,
                'advisor': assignment.advisor,
                'status': 'PENDING_ADVISOR',
                'internship_duration': '3 months',
                'company_performance_assessment': 'Good performance with room for improvement in some technical areas.',
                'company_recommendation': 'CONDITIONAL',
                'company_score': random.randint(70, 85),
                'company_submitted_at': timezone.now() - timedelta(days=5),
            }
        )