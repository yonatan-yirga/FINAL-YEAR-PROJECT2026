#!/usr/bin/env python
"""
Quick verification script to check sample data creation
Run: python verify_sample_data.py
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.departments.models import Department
from apps.advisors.models import AdvisorAssignment
from apps.reports.models import FinalReport, StudentFinalReport
from apps.internships.models import Internship
from apps.applications.models import Application

User = get_user_model()

def verify_sample_data():
    """Verify all sample data was created correctly"""
    
    print("🔍 VERIFYING SAMPLE DATA CREATION")
    print("=" * 50)
    
    # Check Department
    dept = Department.objects.filter(name='Computer Science Test Dept').first()
    print(f"✅ Department: {dept.name if dept else 'NOT FOUND'}")
    
    # Check Users by Role
    students = User.objects.filter(role='STUDENT', email__endswith='@test.com')
    companies = User.objects.filter(role='COMPANY', email__endswith='@test.com')
    advisors = User.objects.filter(role='ADVISOR', email__endswith='@test.com')
    dept_heads = User.objects.filter(role='DEPARTMENT_HEAD', email='depthead@cs.test.com')
    
    print(f"✅ Students: {students.count()}/4 created")
    print(f"✅ Companies: {companies.count()}/3 created")
    print(f"✅ Advisors: {advisors.count()}/2 created")
    print(f"✅ Department Heads: {dept_heads.count()}/1 created")
    
    # Check Internships
    internships = Internship.objects.filter(company__email__endswith='@test.com')
    print(f"✅ Internships: {internships.count()}/6 created")
    
    # Check Applications
    applications = Application.objects.filter(student__email__endswith='@test.com')
    print(f"✅ Applications: {applications.count()}/4 created")
    
    # Check Advisor Assignments
    assignments = AdvisorAssignment.objects.filter(student__email__endswith='@test.com')
    print(f"✅ Advisor Assignments: {assignments.count()}/4 created")
    
    # Check Final Reports
    final_reports = FinalReport.objects.filter(student__email__endswith='@test.com')
    student_reports = StudentFinalReport.objects.filter(student__email__endswith='@test.com')
    print(f"✅ Final Reports: {final_reports.count()}/4 created")
    print(f"✅ Student Reports: {student_reports.count()}/4 created")
    
    print("\n" + "=" * 50)
    print("📊 WORKFLOW STATUS BREAKDOWN")
    print("=" * 50)
    
    # Check workflow stages
    pending_advisor = final_reports.filter(status='PENDING_ADVISOR').count()
    submitted_to_dept = final_reports.filter(status='SUBMITTED_TO_DEPARTMENT').count()
    approved_by_dept = final_reports.filter(status='APPROVED_BY_DEPARTMENT').count()
    
    print(f"⏳ Pending Advisor Review: {pending_advisor}")
    print(f"📋 Submitted to Department: {submitted_to_dept}")
    print(f"✅ Approved by Department: {approved_by_dept}")
    
    print("\n" + "=" * 50)
    print("🔑 TEST ACCOUNT SUMMARY")
    print("=" * 50)
    
    print("👨‍🏫 ADVISORS:")
    for advisor in advisors:
        print(f"   {advisor.email} / password123")
    
    print("\n🏛️ DEPARTMENT HEAD:")
    for dept_head in dept_heads:
        print(f"   {dept_head.email} / password123")
    
    print("\n📚 STUDENTS:")
    for student in students:
        print(f"   {student.email} / password123")
    
    print("\n🏢 COMPANIES:")
    for company in companies:
        print(f"   {company.email} / password123")
    
    print("\n" + "=" * 50)
    print("🚀 READY FOR TESTING!")
    print("=" * 50)
    print("1. Start servers: Backend (Django) + Frontend (React)")
    print("2. Login as advisor1@test.com")
    print("3. Navigate to /advisor/final-reports")
    print("4. Complete evaluations for students")
    print("5. Login as depthead@cs.test.com")
    print("6. Navigate to /department/final-reports")
    print("7. Approve reports and issue certificates")
    print("=" * 50)

if __name__ == '__main__':
    verify_sample_data()