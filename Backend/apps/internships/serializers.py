"""
Internship Serializers
"""
from rest_framework import serializers
from django.utils import timezone
from datetime import date
from .models import Internship


class InternshipSerializer(serializers.ModelSerializer):
    """
    Complete serializer for creating and updating internships
    Includes all fields with comprehensive validation
    """
    
    # Read-only computed fields
    company_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    available_slots = serializers.ReadOnlyField()
    is_deadline_passed = serializers.ReadOnlyField()
    is_accepting_applications = serializers.ReadOnlyField()
    
    class Meta:
        model = Internship
        fields = [
            'id',
            # company and department excluded - auto-set, shown via computed fields
            'title',
            'description',
            'required_skills',
            'location',
            'duration_months',
            'start_date',
            'end_date',
            'is_active',
            'max_applicants',
            'application_deadline',
            'status',
            'created_at',
            'updated_at',
            # Read-only computed fields
            'company_name',
            'department_name',
            'available_slots',
            'is_deadline_passed',
            'is_accepting_applications',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_company_name(self, obj):
        """Get company name from company profile"""
        return obj.get_company_name()
    
    def get_department_name(self, obj):
        """Get department name"""
        return obj.department.name if obj.department else None
    
    def validate_required_skills(self, value):
        """Validate that at least 2 skills are provided"""
        if not value or not value.strip():
            raise serializers.ValidationError('Required skills cannot be empty.')
        
        skills_list = [s.strip() for s in value.split(',') if s.strip()]
        if len(skills_list) < 2:
            raise serializers.ValidationError(
                'At least 2 skills are required. Separate skills with commas (e.g., "Python, Django").'
            )
        
        return value
    
    def validate_duration_months(self, value):
        """Validate duration is between 1-12 months"""
        if value < 1 or value > 12:
            raise serializers.ValidationError('Duration must be between 1 and 12 months.')
        return value
    
    def validate_start_date(self, value):
        """Validate start date is not in the past"""
        # Only validate on creation
        if not self.instance and value < date.today():
            raise serializers.ValidationError('Start date cannot be in the past.')
        return value
    
    def validate_max_applicants(self, value):
        """Validate max applicants is reasonable"""
        if value < 1 or value > 50:
            raise serializers.ValidationError('Maximum applicants must be between 1 and 50.')
        return value
    
    def validate(self, data):
        """Cross-field validation"""
        # Validate end_date is after start_date
        start_date = data.get('start_date') or (self.instance.start_date if self.instance else None)
        end_date = data.get('end_date') or (self.instance.end_date if self.instance else None)
        
        if start_date and end_date:
            if end_date <= start_date:
                raise serializers.ValidationError({
                    'end_date': 'End date must be after start date.'
                })
        
        # Validate application_deadline
        application_deadline = data.get('application_deadline')
        if application_deadline:
            # Only check past-date on creation, or on edit if the deadline actually changed.
            # Without this guard, editing any other field on an internship whose deadline
            # has already passed would be rejected even though the deadline wasn't touched.
            original_deadline = self.instance.application_deadline if self.instance else None
            deadline_changed = (original_deadline is None) or (application_deadline != original_deadline)
            if deadline_changed and application_deadline < date.today():
                raise serializers.ValidationError({
                    'application_deadline': 'Application deadline cannot be in the past.'
                })
            if start_date and application_deadline >= start_date:
                raise serializers.ValidationError({
                    'application_deadline': 'Application deadline must be before start date.'
                })
        
        return data


class InternshipListSerializer(serializers.ModelSerializer):
    """
    Minimal serializer for list views
    Used in search results and company's internship list
    """
    
    company_name = serializers.SerializerMethodField()
    available_slots = serializers.ReadOnlyField()
    application_count = serializers.SerializerMethodField()
    match_percentage = serializers.FloatField(required=False, read_only=True)
    
    class Meta:
        model = Internship
        fields = [
            'id',
            'title',
            'company_name',
            'location',
            'duration_months',
            'start_date',
            'status',
            'available_slots',
            'application_count',
            'is_active',
            'match_percentage',  # Added by recommendation engine
            'created_at',
        ]
    
    def get_company_name(self, obj):
        """Get company name"""
        return obj.get_company_name()
    
    def get_application_count(self, obj):
        """Get total application count"""
        return obj.get_application_count()


class InternshipDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for single internship view
    Includes company contact info and application statistics
    """
    
    # Company information
    company_name = serializers.SerializerMethodField()
    company_email = serializers.SerializerMethodField()
    company_phone = serializers.SerializerMethodField()
    company_address = serializers.SerializerMethodField()
    company_city = serializers.SerializerMethodField()
    contact_person_name = serializers.SerializerMethodField()
    contact_person_title = serializers.SerializerMethodField()
    
    # Department information
    department_name = serializers.SerializerMethodField()
    
    # Application statistics
    application_count = serializers.SerializerMethodField()
    accepted_count = serializers.SerializerMethodField()
    pending_count = serializers.SerializerMethodField()
    available_slots = serializers.ReadOnlyField()
    
    # Status flags
    is_deadline_passed = serializers.ReadOnlyField()
    is_accepting_applications = serializers.ReadOnlyField()
    
    # Skills as list
    skills_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Internship
        fields = [
            'id',
            'title',
            'description',
            'required_skills',
            'skills_list',
            'location',
            'duration_months',
            'start_date',
            'end_date',
            'max_applicants',
            'application_deadline',
            'status',
            'is_active',
            # Company info
            'company_name',
            'company_email',
            'company_phone',
            'company_address',
            'company_city',
            'contact_person_name',
            'contact_person_title',
            # Department
            'department_name',
            # Statistics
            'application_count',
            'accepted_count',
            'pending_count',
            'available_slots',
            # Flags
            'is_deadline_passed',
            'is_accepting_applications',
            # Timestamps
            'created_at',
            'updated_at',
        ]
    
    # Company information methods
    
    def get_company_name(self, obj):
        """Get company name"""
        return obj.get_company_name()
    
    def get_company_email(self, obj):
        """Get company email"""
        return obj.company.email
    
    def get_company_phone(self, obj):
        """Get company phone"""
        try:
            return obj.company.company_profile.phone_number
        except Exception:
            return None
    
    def get_company_address(self, obj):
        """Get company address"""
        try:
            return obj.company.company_profile.address
        except Exception:
            return None
    
    def get_company_city(self, obj):
        """Get company city"""
        try:
            return obj.company.company_profile.city
        except Exception:
            return None
    
    def get_contact_person_name(self, obj):
        """Get contact person name"""
        try:
            return obj.company.company_profile.contact_person_name
        except Exception:
            return None
    
    def get_contact_person_title(self, obj):
        """Get contact person title"""
        try:
            return obj.company.company_profile.contact_person_title
        except Exception:
            return None
    
    # Department information
    
    def get_department_name(self, obj):
        """Get department name"""
        return obj.department.name if obj.department else None
    
    # Application statistics
    
    def get_application_count(self, obj):
        """Get total application count"""
        return obj.get_application_count()
    
    def get_accepted_count(self, obj):
        """Get accepted application count"""
        return obj.get_accepted_count()
    
    def get_pending_count(self, obj):
        """Get pending application count"""
        return obj.get_pending_count()
    
    # Skills
    
    def get_skills_list(self, obj):
        """Get skills as a list"""
        return obj.get_skills_list()