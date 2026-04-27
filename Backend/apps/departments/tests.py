"""
Department Tests 
Custom tests based on actual test data structure
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.departments.models import Department
from apps.accounts.models import StudentProfile, AdvisorProfile, CompanyProfile
from datetime import date

User = get_user_model()


class Phase33TestCase(TestCase):
    """
    Test suite matching the exact test data structure
    Creates same users as the test data script
    """
    
    def setUp(self):
        """Set up test data matching production test data"""
        
        # 1. Create Department
        self.dept = Department.objects.create(
            name='Computer Science',
            head_name='Dr. Smith',
            email='cs@test.edu',
            phone_number='+251911234567'
        )
        
        # 2. Create Department Head
        self.dept_head = User.objects.create_user(
            email='depthead@test.com',
            password='password123',
            role='DEPARTMENT_HEAD',
            department=self.dept,
            is_active=True,
            is_approved=True
        )
        
        # 3. Create Advisor
        self.advisor = User.objects.create_user(
            email='advisor@test.com',
            password='password123',
            role='ADVISOR',
            department=self.dept,
            is_active=True,
            is_approved=True
        )
        AdvisorProfile.objects.create(
            user=self.advisor,
            full_name='Dr. John Advisor',
            phone_number='+251911111111',
            staff_id='ADV001'
        )
        
        # 4. Create Company
        self.company = User.objects.create_user(
            email='techcorp@test.com',
            password='password123',
            role='COMPANY',
            department=self.dept,
            is_active=True,
            is_approved=True
        )
        CompanyProfile.objects.create(
            user=self.company,
            company_name='Tech Corp',
            phone_number='+251922222222',
            address='123 Tech Street',
            city='Addis Ababa',
            contact_person_name='Jane Manager',
            contact_person_title='HR Director',
            description='Leading tech company in Ethiopia'
        )
        
        # 5. Create Students
        self.student1 = User.objects.create_user(
            email='student1@test.com',
            password='password123',
            role='STUDENT',
            department=self.dept,
            is_active=True,
            is_approved=True
        )
        StudentProfile.objects.create(
            user=self.student1,
            full_name='Alice Student',
            phone_number='+251933333333',
            date_of_birth=date(2000, 1, 15),
            gender='FEMALE',
            university_id='CS2020001',
            skills='Python, Django, React'
        )
        
        self.student2 = User.objects.create_user(
            email='student2@test.com',
            password='password123',
            role='STUDENT',
            department=self.dept,
            is_active=True,
            is_approved=True
        )
        StudentProfile.objects.create(
            user=self.student2,
            full_name='Bob Student',
            phone_number='+251944444444',
            date_of_birth=date(2001, 3, 20),
            gender='MALE',
            university_id='CS2020002',
            skills='Java, Spring Boot, Angular'
        )
        
        self.student3 = User.objects.create_user(
            email='student3@test.com',
            password='password123',
            role='STUDENT',
            department=self.dept,
            is_active=True,
            is_approved=True
        )
        StudentProfile.objects.create(
            user=self.student3,
            full_name='Charlie Student',
            phone_number='+251955555555',
            date_of_birth=date(1999, 7, 10),
            gender='MALE',
            university_id='CS2020003',
            skills='JavaScript, Node.js, Vue.js'
        )
        
        # Setup API client
        self.client = APIClient()
        self.client.force_authenticate(user=self.dept_head)
    
    # ========================================================================
    # TEST 1: STATISTICS ENDPOINT
    # ========================================================================
    
    def test_01_statistics_structure(self):
        """Test statistics endpoint returns correct structure"""
        response = self.client.get('/api/departments/statistics/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_students', response.data)
        self.assertIn('total_advisors', response.data)
        self.assertIn('total_companies', response.data)
        self.assertIn('active_internships', response.data)
        self.assertIn('pending_assignments', response.data)
        self.assertIn('completed_internships', response.data)
        self.assertIn('monthly_placements', response.data)
        self.assertIn('completion_rate', response.data)
    
    def test_02_statistics_counts(self):
        """Test statistics returns correct counts"""
        response = self.client.get('/api/departments/statistics/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_students'], 3)
        self.assertEqual(response.data['total_advisors'], 1)
        self.assertEqual(response.data['total_companies'], 1)
    
    # ========================================================================
    # TEST 2: STUDENTS LIST
    # ========================================================================
    
    def test_03_students_list(self):
        """Test students list returns all 3 students"""
        response = self.client.get('/api/departments/students/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 3)
    
    def test_04_students_search_by_name(self):
        """Test student search by name (Alice)"""
        response = self.client.get('/api/departments/students/?search=Alice')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertIn('Alice', response.data[0]['full_name'])
    
    def test_05_students_search_by_id(self):
        """Test student search by university ID"""
        response = self.client.get('/api/departments/students/?search=CS2020002')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    # ========================================================================
    # TEST 3: ADVISORS LIST
    # ========================================================================
    
    def test_06_advisors_list(self):
        """Test advisors list returns 1 advisor"""
        response = self.client.get('/api/departments/advisors/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
    
    def test_07_advisor_workload_annotations(self):
        """Test advisor has workload annotations"""
        response = self.client.get('/api/departments/advisors/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        advisor_data = response.data[0]
        self.assertIn('total_assignments', advisor_data)  # Correct field name
        self.assertIn('active_students', advisor_data)    # Correct field name
        self.assertIn('completed_students', advisor_data) # Correct field name
    
    # ========================================================================
    # TEST 4: COMPANIES LIST
    # ========================================================================
    
    def test_08_companies_list(self):
        """Test companies list returns 1 company"""
        response = self.client.get('/api/departments/companies/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
    
    def test_09_company_has_tech_corp(self):
        """Test company name is 'Tech Corp'"""
        response = self.client.get('/api/departments/companies/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['company_name'], 'Tech Corp')
    
    # ========================================================================
    # TEST 5: ACTIVITY FEED (NEW - PHASE 3.3)
    # ========================================================================
    
    def test_10_activity_feed_returns_list(self):
        """Test activity feed returns a list (empty initially)"""
        response = self.client.get('/api/departments/activity/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
    
    def test_11_activity_feed_unauthorized(self):
        """Test activity feed blocks students"""
        self.client.force_authenticate(user=self.student1)
        response = self.client.get('/api/departments/activity/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    # ========================================================================
    # TEST 6: ADVISOR WORKLOAD (NEW - PHASE 3.3)
    # ========================================================================
    
    def test_12_advisor_workload_structure(self):
        """Test advisor workload endpoint structure"""
        response = self.client.get('/api/advisors/workload/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_advisors', response.data)
        self.assertIn('advisors', response.data)
        self.assertIn('average_workload', response.data)
    
    def test_13_advisor_workload_count(self):
        """Test advisor workload shows 1 advisor"""
        response = self.client.get('/api/advisors/workload/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_advisors'], 1)
        self.assertEqual(len(response.data['advisors']), 1)
    
    def test_14_advisor_workload_details(self):
        """Test advisor workload includes Dr. John Advisor"""
        response = self.client.get('/api/advisors/workload/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        advisor = response.data['advisors'][0]
        self.assertEqual(advisor['full_name'], 'Dr. John Advisor')
        self.assertEqual(advisor['staff_id'], 'ADV001')
    
    # ========================================================================
    # TEST 7: STUDENT PROFILE PROPERTIES (NEW - PHASE 3.3)
    # ========================================================================
    
    def test_15_student_profile_properties_exist(self):
        """Test StudentProfile has new properties"""
        student = self.student1
        sp = student.student_profile
        
        # Test properties exist and return correct values
        # advisor is None initially (no assignment yet)
        self.assertIsNone(sp.advisor)  # Property returns None when no advisor assigned
        self.assertEqual(sp.internship_status, 'NOT_APPLIED')  # Default status
        self.assertIsNone(sp.completion_date)  # None initially
    
    def test_16_student_profile_methods_exist(self):
        """Test StudentProfile has new methods"""
        sp = self.student1.student_profile
        
        # Test methods exist and return correct types
        self.assertFalse(sp.has_active_internship())
        self.assertFalse(sp.has_completed_internship())
        self.assertIsNotNone(sp.get_active_assignment)  # Method exists
    
    # ========================================================================
    # TEST 8: PERMISSIONS
    # ========================================================================
    
    def test_17_statistics_requires_department_role(self):
        """Test statistics endpoint requires department head role"""
        self.client.force_authenticate(user=self.student1)
        response = self.client.get('/api/departments/statistics/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_18_company_cannot_access_statistics(self):
        """Test company cannot access department statistics"""
        self.client.force_authenticate(user=self.company)
        response = self.client.get('/api/departments/statistics/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_19_advisor_cannot_access_statistics(self):
        """Test advisor cannot access department statistics"""
        self.client.force_authenticate(user=self.advisor)
        response = self.client.get('/api/departments/statistics/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    # ========================================================================
    # TEST 9: UNASSIGNED STUDENTS
    # ========================================================================
    
    def test_20_unassigned_students_list(self):
        """Test unassigned students endpoint returns empty list initially"""
        response = self.client.get('/api/departments/unassigned-students/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        # Should be empty as no students have accepted applications yet
        self.assertEqual(len(response.data), 0)
    
    # ========================================================================
    # TEST 10: REPORTS LIST
    # ========================================================================
    
    def test_21_reports_list(self):
        """Test reports list endpoint"""
        response = self.client.get('/api/departments/reports/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        # Should be empty initially
        self.assertEqual(len(response.data), 0)


class AuthenticationTestCase(TestCase):
    """Test authentication with test data users"""
    
    def setUp(self):
        """Create basic test users"""
        self.dept = Department.objects.create(
            name='Computer Science',
            head_name='Dr. Smith',
            email='cs@test.edu',
            phone_number='+251911234567'
        )
        
        self.dept_head = User.objects.create_user(
            email='depthead@test.com',
            password='password123',
            role='DEPARTMENT_HEAD',
            department=self.dept,
            is_active=True,
            is_approved=True
        )
    
    def test_22_unauthenticated_access_blocked(self):
        """Test endpoints require authentication"""
        client = APIClient()
        response = client.get('/api/departments/statistics/')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_23_authenticated_access_allowed(self):
        """Test authenticated department head can access endpoints"""
        client = APIClient()
        client.force_authenticate(user=self.dept_head)
        response = client.get('/api/departments/statistics/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

