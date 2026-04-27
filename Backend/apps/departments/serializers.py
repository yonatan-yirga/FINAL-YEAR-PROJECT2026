"""
Department Serializers
Serializers for department management dashboard
"""
from rest_framework import serializers
from apps.accounts.models import User, StudentProfile, CompanyProfile, AdvisorProfile
from apps.advisors.models import AdvisorAssignment
from apps.reports.models import FinalReport
from apps.departments.models import Department, Escalation, DepartmentCycle


class DepartmentStatisticsSerializer(serializers.Serializer):
    """Serializer for department statistics"""
    total_students = serializers.IntegerField()
    total_advisors = serializers.IntegerField()
    total_companies = serializers.IntegerField()
    active_internships = serializers.IntegerField()
    pending_assignments = serializers.IntegerField()
    completed_internships = serializers.IntegerField()
    monthly_placements = serializers.IntegerField()
    completion_rate = serializers.FloatField()


class DepartmentStudentSerializer(serializers.ModelSerializer):
    """
    Serializer for students in department dashboard
    Includes internship status and advisor info
    """
    full_name = serializers.SerializerMethodField()
    university_id = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    internship_status = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    advisor_name = serializers.SerializerMethodField()
    start_date = serializers.SerializerMethodField()
    is_eligible = serializers.BooleanField(source='student_profile.is_eligible', read_only=True)
    year_of_study = serializers.IntegerField(source='student_profile.year_of_study', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'university_id',
            'phone_number',
            'department_name',
            'internship_status',
            'company_name',
            'advisor_name',
            'start_date',
            'is_eligible',
            'year_of_study',
            'is_active',
            'created_at',
        ]
    
    def get_full_name(self, obj):
        """Get student full name from profile"""
        try:
            return obj.student_profile.full_name
        except Exception:
            return obj.email
    
    def get_university_id(self, obj):
        """Get university ID"""
        try:
            return obj.student_profile.university_id
        except Exception:
            return None
    
    def get_phone_number(self, obj):
        """Get phone number"""
        try:
            return obj.student_profile.phone_number
        except Exception:
            return None
    
    def get_department_name(self, obj):
        """Get department name"""
        return obj.department.name if obj.department else None
    
    def get_internship_status(self, obj):
        """
        Determine student's internship status
        - NOT_APPLIED: No applications
        - APPLIED: Has pending applications
        - ACTIVE: Has active internship
        - COMPLETED: Completed internship
        """
        # Check for active assignment
        active_assignment = obj.student_advisor_assignments.filter(is_active=True).first()
        if active_assignment:
            return 'ACTIVE'
        
        # Check for completed assignment
        if obj.student_advisor_assignments.filter(is_active=False).exists():
            return 'COMPLETED'
        
        # Check for pending applications
        if obj.student_applications.filter(status='PENDING').exists():
            return 'APPLIED'
        
        return 'NOT_APPLIED'
    
    def get_company_name(self, obj):
        """Get company name if student has active internship"""
        active_assignment = obj.student_advisor_assignments.filter(is_active=True).first()
        if active_assignment:
            try:
                return active_assignment.internship.get_company_name()
            except Exception:
                return None
        return None
    
    def get_advisor_name(self, obj):
        """Get advisor name if assigned"""
        active_assignment = obj.student_advisor_assignments.filter(is_active=True).first()
        if active_assignment:
            try:
                return active_assignment.advisor.get_full_name()
            except Exception:
                return None
        return None
    
    def get_start_date(self, obj):
        """Get internship start date if active"""
        active_assignment = obj.student_advisor_assignments.filter(is_active=True).first()
        if active_assignment:
            try:
                return active_assignment.internship.start_date
            except Exception:
                return None
        return None


class DepartmentAdvisorSerializer(serializers.ModelSerializer):
    """
    Serializer for advisors in department dashboard
    Includes workload statistics
    """
    full_name = serializers.SerializerMethodField()
    staff_id = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    total_assignments = serializers.IntegerField(source='assignments_count', read_only=True)
    active_students = serializers.IntegerField(source='active_count', read_only=True)
    completed_students = serializers.IntegerField(source='completed_count', read_only=True)
    max_students = serializers.IntegerField(source='advisor_profile.max_students', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'staff_id',
            'phone_number',
            'department_name',
            'total_assignments',
            'active_students',
            'completed_students',
            'max_students',
            'is_active',
            'created_at',
        ]
    
    def get_full_name(self, obj):
        """Get advisor full name from profile"""
        try:
            return obj.advisor_profile.full_name
        except Exception:
            return obj.email
    
    def get_staff_id(self, obj):
        """Get staff ID"""
        try:
            return obj.advisor_profile.staff_id
        except Exception:
            return None
    
    def get_phone_number(self, obj):
        """Get phone number"""
        try:
            return obj.advisor_profile.phone_number
        except Exception:
            return None
    
    def get_department_name(self, obj):
        """Get department name"""
        return obj.department.name if obj.department else None


class DepartmentCompanySerializer(serializers.ModelSerializer):
    """
    Serializer for companies in department dashboard
    Includes activity statistics
    """
    company_name = serializers.SerializerMethodField()
    contact_person = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    posted_internships = serializers.IntegerField(source='internships_count', read_only=True)
    active_interns = serializers.IntegerField(source='active_interns_count', read_only=True)
    completed_interns = serializers.IntegerField(source='completed_interns_count', read_only=True)
    is_blacklisted = serializers.BooleanField(source='company_profile.is_blacklisted', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'company_name',
            'contact_person',
            'phone_number',
            'city',
            'department_name',
            'posted_internships',
            'active_interns',
            'completed_interns',
            'is_blacklisted',
            'is_active',
            'created_at',
        ]
    
    def get_company_name(self, obj):
        """Get company name from profile"""
        try:
            return obj.company_profile.company_name
        except Exception:
            return obj.email
    
    def get_contact_person(self, obj):
        """Get contact person name"""
        try:
            return obj.company_profile.contact_person_name
        except Exception:
            return None
    
    def get_phone_number(self, obj):
        """Get phone number"""
        try:
            return obj.company_profile.phone_number
        except Exception:
            return None
    
    def get_city(self, obj):
        """Get city"""
        try:
            return obj.company_profile.city
        except Exception:
            return None
    
    def get_department_name(self, obj):
        """Get department name"""
        return obj.department.name if obj.department else None


class AdvisorAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for advisor assignments"""
    student_name = serializers.SerializerMethodField()
    advisor_name = serializers.SerializerMethodField()
    internship_title = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    assigned_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = AdvisorAssignment
        fields = [
            'id',
            'student',
            'student_name',
            'advisor',
            'advisor_name',
            'internship',
            'internship_title',
            'company_name',
            'assigned_by',
            'assigned_by_name',
            'assigned_at',
            'is_active',
            'completed_at',
        ]
        read_only_fields = ['id', 'assigned_at', 'completed_at']
    
    def get_student_name(self, obj):
        """Get student name"""
        return obj.student.get_full_name()
    
    def get_advisor_name(self, obj):
        """Get advisor name"""
        return obj.advisor.get_full_name()

    def get_internship_title(self, obj):
        """Get internship title"""
        return obj.internship.title
    
    def get_company_name(self, obj):
        """Get company name"""
        return obj.internship.get_company_name()
    
    def get_assigned_by_name(self, obj):
        """Get name of user who assigned"""
        return obj.assigned_by.get_full_name() if obj.assigned_by else None

class EscalationSerializer(serializers.ModelSerializer):
    """Serializer for tracking formal authority interventions"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    advisor_name = serializers.CharField(source='advisor.get_full_name', read_only=True)
    company_name = serializers.CharField(source='company.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    issue_type_display = serializers.CharField(source='get_issue_type_display', read_only=True)

    class Meta:
        model = Escalation
        fields = [
            'id', 'issue_type', 'issue_type_display', 'title', 'description',
            'status', 'status_display', 'student', 'student_name',
            'advisor', 'advisor_name', 'company', 'company_name',
            'resolution_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class DepartmentCycleSerializer(serializers.ModelSerializer):
    """Serializer for managing internship seasons"""
    class Meta:
        model = DepartmentCycle
        fields = ['id', 'year', 'semester', 'is_active', 'start_date', 'end_date']

class DecisionIntelligenceSerializer(serializers.Serializer):
    """
    Strategic Data Serializer:
    Provides analytical trends and risk markers for the Department Head.
    """
    placement_rate = serializers.FloatField()
    completion_rate = serializers.FloatField()
    avg_performance_score = serializers.FloatField()
    
    # Trends (Monthly counts)
    placement_trends = serializers.ListField(child=serializers.DictField())
    
    # Risk Markers
    overloaded_advisors_count = serializers.IntegerField()
    failing_students_count = serializers.IntegerField()
    missing_reports_count = serializers.IntegerField()
    
    # Lists for quick action
    critical_escalations = EscalationSerializer(many=True)
    at_risk_students = serializers.ListField(child=serializers.DictField())
    
    def get_at_risk_students(self, obj):
        # ... logic if any ...
        pass


class FinalReportListSerializer(serializers.ModelSerializer):
    """Serializer for final reports list"""
    student_name = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    advisor_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    # pdf_file is overridden as a method field so we can return a full absolute URL.
    # A raw FileField returns only the relative path (e.g. 'reports/final/21/final_report.pdf').
    # window.open() on a relative path resolves against localhost:5173 → React Router catches it → 404.
    pdf_file = serializers.SerializerMethodField()

    class Meta:
        model = FinalReport
        fields = [
            'id',
            'student',
            'student_name',
            'company',
            'company_name',
            'advisor',
            'advisor_name',
            'status',
            'status_display',
            'company_submitted_at',
            'advisor_submitted_at',
            'pdf_file',
            'created_at',
        ]

    def get_pdf_file(self, obj):
        """Return full absolute media URL so window.open() goes to the backend, not React Router."""
        if not obj.pdf_file:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.pdf_file.url)
        # Fallback: construct URL from settings
        from django.conf import settings
        return '{}{}'.format(
            settings.MEDIA_URL.rstrip('/'),
            obj.pdf_file.url,
        )

    def get_student_name(self, obj):
        """Get student name"""
        return obj.student.get_full_name()

    def get_company_name(self, obj):
        """Get company name"""
        return obj.company.get_full_name()

    def get_advisor_name(self, obj):
        """Get advisor name"""
        return obj.advisor.get_full_name()