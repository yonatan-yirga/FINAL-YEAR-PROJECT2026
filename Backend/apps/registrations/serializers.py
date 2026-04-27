"""
Registration Serializers
Handles validation and serialization for registration requests
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import RegistrationRequest
from apps.departments.models import Department

User = get_user_model()


class DepartmentListSerializer(serializers.ModelSerializer):
    """Simple serializer for department dropdown"""
    
    class Meta:
        model = Department
        fields = ['id', 'name']


class RegistrationRequestSerializer(serializers.ModelSerializer):
    """Serializer for creating registration requests"""

    # FIX: The original code declared:
    #   department_name = serializers.CharField(source='department.name', read_only=True)
    # That declaration shadowed the writable model field of the same name, making DRF
    # exclude it from deserialization entirely. As a result, validate() could never find
    # department_name in `data`, and always raised:
    #   "department_name is required for department registration."
    #
    # The fix: declare department_name as a plain writable CharField so it is included
    # in validated_data on POST. required=False / allow_null / allow_blank are set to
    # match the model field (null=True, blank=True) so it does not break Student,
    # Company, or Advisor submissions that do not send this field at all.
    #
    # For GET responses, to_representation() is overridden below to inject the FK
    # department name as a fallback when the model field is blank/null, preserving
    # the existing frontend behaviour where every registration row shows a department
    # label regardless of registration type.
    department_name = serializers.CharField(
        required=False,
        allow_null=True,
        allow_blank=True,
    )
    target_departments = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Department.objects.all(), 
        required=False
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    request_type_display = serializers.CharField(source='get_request_type_display', read_only=True)

    class Meta:
        model = RegistrationRequest
        fields = [
            'id', 'request_type', 'request_type_display', 'email', 
            'department', 'target_departments', 'department_name',
            'status', 'status_display', 'rejection_reason', 'document',
            'submitted_at', 'reviewed_at', 'reviewed_by',
            # Student fields
            'student_full_name', 'student_phone', 'student_dob', 'student_gender',
            'student_university_id', 'student_skills',
            # Company fields
            'company_name', 'company_phone', 'company_address', 'company_city',
            'company_contact_person', 'company_contact_title', 'company_description',
            # Advisor fields
            'advisor_full_name', 'advisor_phone', 'advisor_staff_id',
            # Department fields
            'department_head_name', 'department_phone',
        ]
        read_only_fields = ['id', 'status', 'rejection_reason', 'submitted_at', 'reviewed_at', 'reviewed_by']

    def to_representation(self, instance):
        """
        On reads, ensure department_name or target_departments (names) are populated.
        """
        representation = super().to_representation(instance)
        # Handle department fallback
        if not representation.get('department_name'):
            representation['department_name'] = (
                instance.department.name if instance.department else None
            )
        
        # Inject target department names for company requests
        if instance.request_type == 'COMPANY':
            representation['target_department_names'] = [
                dept.name for dept in instance.target_departments.all()
            ]
        return representation

    def validate_email(self, value):
        """Check if email already exists in User or pending RegistrationRequest"""
        # Check if user already exists
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')

        # Check if there's already a pending registration with this email
        if RegistrationRequest.objects.filter(email=value, status='PENDING').exists():
            raise serializers.ValidationError('A registration request with this email is already pending.')

        return value

    def validate_department(self, value):
        """Ensure department exists"""
        if value and not Department.objects.filter(id=value.id).exists():
            raise serializers.ValidationError('Invalid department.')
        return value

    def validate(self, data):
        """Validate required fields based on request_type"""
        request_type = data.get('request_type')

        # Role-specific department validation
        if request_type == 'COMPANY':
            target_depts = data.get('target_departments')
            if not target_depts or len(target_depts) == 0:
                raise serializers.ValidationError({'target_departments': 'Companies must select at least one department.'})
        else:
            # Students, Advisors, and Dept Heads MUST pick a primary department
            if not data.get('department') and request_type != 'DEPARTMENT':
                 raise serializers.ValidationError({'department': f'Department is required for {request_type.lower()} registration.'})

        if request_type == 'STUDENT':
            required_fields = [
                'student_full_name', 'student_phone', 'student_dob',
                'student_gender', 'student_university_id', 'student_skills'
            ]
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError({field: f'{field} is required for student registration.'})

            # Check if university_id already exists
            if RegistrationRequest.objects.filter(
                student_university_id=data['student_university_id'],
                status='PENDING'
            ).exists():
                raise serializers.ValidationError({'student_university_id': 'A registration with this university ID is already pending.'})

        elif request_type == 'COMPANY':
            required_fields = [
                'company_name', 'company_phone', 'company_address',
                'company_city', 'company_contact_person', 'company_contact_title',
                'company_description'
            ]
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError({field: f'{field} is required for company registration.'})

        elif request_type == 'ADVISOR':
            required_fields = ['advisor_full_name', 'advisor_phone', 'advisor_staff_id']
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError({field: f'{field} is required for advisor registration.'})

            # Check if staff_id already exists
            if RegistrationRequest.objects.filter(
                advisor_staff_id=data['advisor_staff_id'],
                status='PENDING'
            ).exists():
                raise serializers.ValidationError({'advisor_staff_id': 'A registration with this staff ID is already pending.'})

        elif request_type == 'DEPARTMENT':
            required_fields = ['department_name', 'department_head_name', 'department_phone']
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError({field: f'{field} is required for department registration.'})

        # Validate document upload
        if 'document' not in data or not data['document']:
            raise serializers.ValidationError({'document': 'Document upload is required.'})

        return data


class RegistrationApprovalSerializer(serializers.Serializer):
    """Serializer for approving/rejecting registration requests"""

    rejection_reason = serializers.CharField(required=False, allow_blank=True)

    def validate_rejection_reason(self, value):
        """Ensure rejection reason is provided when rejecting"""
        if self.context.get('action') == 'reject' and not value:
            raise serializers.ValidationError('Rejection reason is required when rejecting a registration.')
        return value


class RegistrationDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single registration request"""

    # This serializer is used exclusively for GET (RegistrationDetailView — read-only).
    # SerializerMethodField is safe here: it is never used for writes, so shadowing
    # the model field does not cause the deserialization problem fixed above.
    # It returns the model field value when set (DEPARTMENT registrations), falling
    # back to the FK department name for all other types.
    department_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    request_type_display = serializers.CharField(source='get_request_type_display', read_only=True)
    reviewed_by_email = serializers.EmailField(source='reviewed_by.email', read_only=True)
    document_url = serializers.SerializerMethodField()

    class Meta:
        model = RegistrationRequest
        fields = '__all__'

    def get_department_name(self, obj):
        """
        Return the stored department_name model field when present (DEPARTMENT
        registrations), otherwise fall back to the FK department name so that
        the detail view always shows a department label for every registration type.
        """
        if obj.department_name:
            return obj.department_name
        if obj.department:
            return obj.department.name
        return None

    def get_document_url(self, obj):
        """Return full document URL"""
        if obj.document:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.document.url)
            return obj.document.url
        return None