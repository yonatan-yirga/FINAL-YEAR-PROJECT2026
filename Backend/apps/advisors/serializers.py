"""
Advisor Serializers
Serializers for advisor assignment and student management
"""
from rest_framework import serializers
from apps.accounts.models import User, StudentProfile
from apps.advisors.models import AdvisorAssignment, Feedback
from apps.internships.models import Internship
from apps.applications.models import Application


class StudentDetailSerializer(serializers.ModelSerializer):
    """
    Detailed student information for advisor view
    """
    full_name = serializers.CharField(source='student_profile.full_name', read_only=True)
    university_id = serializers.CharField(source='student_profile.university_id', read_only=True)
    phone_number = serializers.CharField(source='student_profile.phone_number', read_only=True)
    skills = serializers.CharField(source='student_profile.skills', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'university_id',
            'phone_number',
            'skills',
            'department_name',
        ]
        read_only_fields = fields


class InternshipDetailSerializer(serializers.ModelSerializer):
    """
    Internship information for advisor view
    """
    company_name = serializers.SerializerMethodField()
    company_email = serializers.CharField(source='company.email', read_only=True)
    company_phone = serializers.SerializerMethodField()
    
    class Meta:
        model = Internship
        fields = [
            'id',
            'title',
            'description',
            'required_skills',
            'location',
            'duration_months',
            'start_date',
            'end_date',
            'company_name',
            'company_email',
            'company_phone',
        ]
        read_only_fields = fields
    
    def get_company_name(self, obj):
        """Get company name"""
        return obj.get_company_name()
    
    def get_company_phone(self, obj):
        """Get company phone"""
        try:
            return obj.company.company_profile.phone_number
        except Exception:
            return None


class FeedbackSerializer(serializers.ModelSerializer):
    """
    Serializer for feedback
    """
    advisor_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    student_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Feedback
        fields = [
            'id',
            'advisor_assignment',
            'created_by',
            'advisor_name',
            'student_name',
            'feedback_text',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def get_student_name(self, obj):
        """Get student name"""
        return obj.get_student().get_full_name()
    
    def validate_feedback_text(self, value):
        """Validate feedback text"""
        if not value or not value.strip():
            raise serializers.ValidationError('Feedback cannot be empty.')
        
        if len(value.strip()) < 10:
            raise serializers.ValidationError('Feedback must be at least 10 characters long.')
        
        if len(value) > 5000:
            raise serializers.ValidationError('Feedback cannot exceed 5000 characters.')
        
        return value


class AdvisorAssignmentDetailSerializer(serializers.ModelSerializer):
    """
    Detailed advisor assignment with all related information
    """
    student = StudentDetailSerializer(read_only=True)
    internship = InternshipDetailSerializer(read_only=True)
    advisor_name = serializers.CharField(source='advisor.get_full_name', read_only=True)
    assigned_by_name = serializers.SerializerMethodField()
    feedbacks = FeedbackSerializer(many=True, read_only=True)
    feedback_count = serializers.IntegerField(source='get_feedback_count', read_only=True)
    duration_days = serializers.IntegerField(source='get_duration_days', read_only=True)
    
    class Meta:
        model = AdvisorAssignment
        fields = [
            'id',
            'student',
            'advisor',
            'advisor_name',
            'internship',
            'application',
            'assigned_by',
            'assigned_by_name',
            'assigned_at',
            'is_active',
            'completed_at',
            'feedback_count',
            'duration_days',
            'feedbacks',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields
    
    def get_assigned_by_name(self, obj):
        """Get name of user who assigned"""
        return obj.assigned_by.get_full_name() if obj.assigned_by else None


class MyStudentSerializer(serializers.ModelSerializer):
    """
    Student information for advisor's 'My Students' list
    Includes key information without full details
    """
    student_id = serializers.IntegerField(source='student.id', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    student_phone = serializers.SerializerMethodField()
    university_id = serializers.SerializerMethodField()
    
    internship_id = serializers.IntegerField(source='internship.id', read_only=True)
    internship_title = serializers.CharField(source='internship.title', read_only=True)
    company_name = serializers.SerializerMethodField()
    
    start_date = serializers.DateField(source='internship.start_date', read_only=True)
    duration_months = serializers.IntegerField(source='internship.duration_months', read_only=True)
    duration_days = serializers.IntegerField(source='get_duration_days', read_only=True)
    feedback_count = serializers.IntegerField(source='get_feedback_count', read_only=True)
    
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = AdvisorAssignment
        fields = [
            'id',
            'student_id',
            'student_name',
            'student_email',
            'student_phone',
            'university_id',
            'internship_id',
            'internship_title',
            'company_name',
            'start_date',
            'duration_months',
            'duration_days',
            'feedback_count',
            'status',
            'is_active',
            'assigned_at',
            'completed_at',
        ]
        read_only_fields = fields
    
    def get_student_phone(self, obj):
        """Get student phone"""
        try:
            return obj.student.student_profile.phone_number
        except Exception:
            return None
    
    def get_university_id(self, obj):
        """Get university ID"""
        try:
            return obj.student.student_profile.university_id
        except Exception:
            return None
    
    def get_company_name(self, obj):
        """Get company name"""
        return obj.get_company_name()
    
    def get_status(self, obj):
        """Get current status"""
        if obj.is_active:
            return 'ACTIVE'
        return 'COMPLETED'


class UnassignedStudentSerializer(serializers.Serializer):
    """
    Serializer for unassigned students (accepted applications without advisor)
    Used by Department Head in assignment interface
    """
    application_id = serializers.IntegerField(source='id')
    student_id = serializers.IntegerField(source='student.id')
    student_name = serializers.CharField(source='student.get_full_name')
    student_email = serializers.CharField(source='student.email')
    university_id = serializers.SerializerMethodField()
    
    internship_id = serializers.IntegerField(source='internship.id')
    internship_title = serializers.CharField(source='internship.title')
    company_name = serializers.SerializerMethodField()
    
    start_date = serializers.DateField(source='internship.start_date')
    accepted_at = serializers.DateTimeField(source='reviewed_at')
    days_since_acceptance = serializers.SerializerMethodField()
    
    def get_university_id(self, obj):
        """Get university ID"""
        try:
            return obj.student.student_profile.university_id
        except Exception:
            return None
    
    def get_company_name(self, obj):
        """Get company name"""
        return obj.get_company_name()
    
    def get_days_since_acceptance(self, obj):
        """Calculate days since application was accepted"""
        from django.utils import timezone
        if obj.reviewed_at:
            delta = timezone.now() - obj.reviewed_at
            return delta.days
        return 0


class AvailableAdvisorSerializer(serializers.ModelSerializer):
    """
    Serializer for available advisors with workload information
    Used by Department Head when assigning advisors
    """
    full_name = serializers.CharField(source='advisor_profile.full_name', read_only=True)
    staff_id = serializers.CharField(source='advisor_profile.staff_id', read_only=True)
    phone_number = serializers.CharField(source='advisor_profile.phone_number', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    current_workload = serializers.SerializerMethodField()
    active_students = serializers.SerializerMethodField()
    total_assignments = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'staff_id',
            'phone_number',
            'department_name',
            'current_workload',
            'active_students',
            'total_assignments',
        ]
        read_only_fields = fields
    
    def get_current_workload(self, obj):
        """Get number of active assignments"""
        return AdvisorAssignment.objects.get_current_workload(obj)
    
    def get_active_students(self, obj):
        """Get list of active student names"""
        assignments = AdvisorAssignment.objects.filter(
            advisor=obj,
            is_active=True
        ).select_related('student', 'student__student_profile')[:5]
        
        return [a.get_student_name() for a in assignments]
    
    def get_total_assignments(self, obj):
        """Get total number of assignments (active + completed)"""
        return obj.supervised_students.count()


class AssignAdvisorSerializer(serializers.Serializer):
    """
    Serializer for assigning advisor to student
    Used by Department Head
    """
    application_id = serializers.IntegerField(required=True)
    advisor_id = serializers.IntegerField(required=True)
    
    def validate_application_id(self, value):
        """Validate application exists and is accepted"""
        try:
            application = Application.objects.get(id=value)
            if application.status != 'ACCEPTED':
                raise serializers.ValidationError('Can only assign advisor to accepted applications.')
            return value
        except Application.DoesNotExist:
            raise serializers.ValidationError('Application not found.')
    
    def validate_advisor_id(self, value):
        """Validate advisor exists and has correct role"""
        try:
            advisor = User.objects.get(id=value, role='ADVISOR')
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError('Advisor not found or invalid role.')
    
    def validate(self, data):
        """Cross-field validation"""
        try:
            application = Application.objects.get(id=data['application_id'])
            advisor = User.objects.get(id=data['advisor_id'])
            
            # Validate same department
            if application.student.department != advisor.department:
                raise serializers.ValidationError({
                    'advisor_id': 'Advisor must be in the same department as the student.'
                })
            
            # Validate not already assigned
            existing = AdvisorAssignment.objects.filter(
                application=application,
                is_active=True
            ).exists()
            
            if existing:
                raise serializers.ValidationError({
                    'application_id': 'This student already has an active advisor assigned.'
                })
            
        except Application.DoesNotExist:
            raise serializers.ValidationError({'application_id': 'Application not found.'})
        except User.DoesNotExist:
            raise serializers.ValidationError({'advisor_id': 'Advisor not found.'})
        
        return data


class CreateFeedbackSerializer(serializers.ModelSerializer):
    """
    Serializer for creating feedback
    """
    class Meta:
        model = Feedback
        fields = ['advisor_assignment', 'feedback_text']
    
    def validate_feedback_text(self, value):
        """Validate feedback text"""
        if not value or not value.strip():
            raise serializers.ValidationError('Feedback cannot be empty.')
        
        if len(value.strip()) < 10:
            raise serializers.ValidationError('Feedback must be at least 10 characters long.')
        
        if len(value) > 5000:
            raise serializers.ValidationError('Feedback cannot exceed 5000 characters.')
        
        return value
    
    def validate_advisor_assignment(self, value):
        """Validate advisor assignment"""
        request = self.context.get('request')
        
        if not request or not request.user:
            raise serializers.ValidationError('Authentication required.')
        
        # Validate advisor owns this assignment
        if value.advisor != request.user:
            raise serializers.ValidationError('You can only add feedback to your own assignments.')
        
        # Validate assignment is active
        if not value.is_active:
            raise serializers.ValidationError('Cannot add feedback to a completed assignment.')
        
        return value
    
    def create(self, validated_data):
        """Create feedback with created_by from request user"""
        request = self.context.get('request')
        validated_data['created_by'] = request.user
        return super().create(validated_data)