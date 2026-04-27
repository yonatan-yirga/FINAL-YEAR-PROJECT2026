"""
Application Serializers
Serializers for student application system
"""
from rest_framework import serializers
from django.utils import timezone
from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    """
    Complete serializer for applications
    Used for detail views and updates
    PHASE 7: Added advisor_name, advisor_email, assignment_id fields
    """

    # Read-only computed fields - Student info
    student_name = serializers.SerializerMethodField()
    student_email = serializers.SerializerMethodField()
    student_phone = serializers.SerializerMethodField()
    student_skills = serializers.SerializerMethodField()
    student_university_id = serializers.SerializerMethodField()
    student_internship_status = serializers.SerializerMethodField()

    # Read-only computed fields - Internship info
    internship_title = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    internship_location = serializers.SerializerMethodField()
    internship_duration = serializers.SerializerMethodField()
    start_date = serializers.SerializerMethodField()
    end_date = serializers.SerializerMethodField()

    # Read-only computed fields - Company contact info
    company_contact_name = serializers.SerializerMethodField()
    company_email = serializers.SerializerMethodField()
    company_phone = serializers.SerializerMethodField()
    company_address = serializers.SerializerMethodField()

    # Read-only computed fields - Review info
    reviewed_by_name = serializers.SerializerMethodField()

    # PHASE 7: Advisor info — populated from the AdvisorAssignment if it exists
    advisor_name = serializers.SerializerMethodField()
    advisor_email = serializers.SerializerMethodField()
    assignment_id = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id',
            'student',
            'internship',
            'cover_letter',
            'status',
            'reviewed_by',
            'reviewed_at',
            'rejection_reason',
            'applied_at',
            'updated_at',
            # New Upwork-style fields
            'about_me',
            'experience',
            'education_level',
            'projects',
            'certificate',
            # Student info
            'student_name',
            'student_email',
            'student_phone',
            'student_skills',
            'student_university_id',
            # Internship info
            'internship_title',
            'company_name',
            'internship_location',
            'internship_duration',
            'start_date',
            'end_date',
            # Company contact
            'company_contact_name',
            'company_email',
            'company_phone',
            'company_address',
            # Review info
            'reviewed_by_name',
            # Phase 7: Advisor info
            'advisor_name',
            'advisor_email',
            'assignment_id',
            'student_internship_status',
        ]
        read_only_fields = [
            'student',
            'reviewed_by',
            'reviewed_at',
            'applied_at',
            'updated_at',
        ]

    # ── Student information ───────────────────────────────────────────────────

    def get_student_name(self, obj):
        return obj.get_student_name()

    def get_student_email(self, obj):
        return obj.get_student_email()

    def get_student_phone(self, obj):
        return obj.get_student_phone()

    def get_student_skills(self, obj):
        return obj.get_student_skills()

    def get_student_university_id(self, obj):
        try:
            return obj.student.student_profile.university_id
        except Exception:
            return None

    def get_student_internship_status(self, obj):
        try:
            if hasattr(obj.student, 'student_profile'):
                return obj.student.student_profile.internship_status
            else:
                return 'NOT_APPLIED'
        except Exception as e:
            print(f"Error getting internship status for student {obj.student.email}: {e}")
            return 'NOT_APPLIED'

    # ── Internship information ────────────────────────────────────────────────

    def get_internship_title(self, obj):
        return obj.internship.title

    def get_company_name(self, obj):
        return obj.get_company_name()

    def get_internship_location(self, obj):
        return obj.internship.location

    def get_internship_duration(self, obj):
        return obj.internship.duration_months

    def get_start_date(self, obj):
        return obj.internship.start_date

    def get_end_date(self, obj):
        return getattr(obj.internship, 'end_date', None)

    # ── Company contact information ───────────────────────────────────────────

    def get_company_contact_name(self, obj):
        try:
            profile = obj.internship.company.company_profile
            return profile.contact_person or obj.internship.company.get_full_name()
        except Exception:
            return None

    def get_company_email(self, obj):
        try:
            return obj.internship.company.email
        except Exception:
            return None

    def get_company_phone(self, obj):
        try:
            return obj.internship.company.company_profile.phone_number
        except Exception:
            return None

    def get_company_address(self, obj):
        try:
            return obj.internship.company.company_profile.address
        except Exception:
            return None

    # ── Review information ────────────────────────────────────────────────────

    def get_reviewed_by_name(self, obj):
        if obj.reviewed_by:
            try:
                return obj.reviewed_by.company_profile.company_name
            except Exception:
                return obj.reviewed_by.email
        return None

    # ── PHASE 7: Advisor information ──────────────────────────────────────────
    # These read from the AdvisorAssignment that is linked to this application
    # via the OneToOne relation: application.advisor_assignment

    def _get_assignment(self, obj):
        """Helper — returns the AdvisorAssignment for this application, or None."""
        try:
            return obj.advisor_assignment  # OneToOne reverse relation
        except Exception:
            return None

    def get_advisor_name(self, obj):
        assignment = self._get_assignment(obj)
        if assignment and assignment.is_active:
            try:
                return assignment.advisor.get_full_name()
            except Exception:
                return None
        return None

    def get_advisor_email(self, obj):
        assignment = self._get_assignment(obj)
        if assignment and assignment.is_active:
            try:
                return assignment.advisor.email
            except Exception:
                return None
        return None

    def get_assignment_id(self, obj):
        """
        Returns the AdvisorAssignment PK.
        The frontend uses this to call GET /api/advisors/students/<assignment_id>/feedback/
        """
        assignment = self._get_assignment(obj)
        return assignment.id if assignment else None

    # ── Validation ────────────────────────────────────────────────────────────

    def validate_internship(self, value):
        if not value.is_accepting_applications:
            raise serializers.ValidationError(
                'This internship is not currently accepting applications.'
            )
        return value

    def validate(self, data):
        request = self.context.get('request')
        if request and request.user:
            internship = data.get('internship') or (self.instance.internship if self.instance else None)
            if internship:
                if request.user.department != internship.department:
                    raise serializers.ValidationError({
                        'internship': 'You can only apply to internships in your department.'
                    })

                if not self.instance:
                    existing = Application.objects.filter(
                        student=request.user,
                        internship=internship
                    ).exists()
                    if existing:
                        raise serializers.ValidationError({
                            'internship': 'You have already applied to this internship.'
                        })

                if not self.instance:
                    has_active = Application.objects.filter(
                        student=request.user,
                        status='ACCEPTED'
                    ).exists()
                    if has_active:
                        raise serializers.ValidationError({
                            'student': 'You already have an active internship. Cannot apply to multiple internships.'
                        })

        return data


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating applications (student applying)
    Simplified - student is auto-set from request.user
    """

    class Meta:
        model = Application
        fields = [
            'internship',
            'about_me',
            'experience',
            'education_level',
            'projects',
            'certificate',
            'cover_letter',
        ]

    def validate_internship(self, value):
        if not value.is_accepting_applications:
            raise serializers.ValidationError(
                'This internship is not currently accepting applications.'
            )
        if value.available_slots <= 0:
            raise serializers.ValidationError(
                'No available slots remaining for this internship.'
            )
        return value

    def validate(self, data):
        request = self.context.get('request')
        if request and request.user:
            internship = data.get('internship')

            if request.user.department != internship.department:
                raise serializers.ValidationError({
                    'internship': 'You can only apply to internships in your department.'
                })

            existing = Application.objects.filter(
                student=request.user,
                internship=internship
            ).exists()
            if existing:
                raise serializers.ValidationError({
                    'internship': 'You have already applied to this internship.'
                })

            has_active = Application.objects.filter(
                student=request.user,
                status='ACCEPTED'
            ).exists()
            if has_active:
                raise serializers.ValidationError(
                    'You already have an active internship. Cannot apply to multiple internships.'
                )

        return data

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['student'] = request.user
        return super().create(validated_data)


class ApplicationListSerializer(serializers.ModelSerializer):
    """
    Minimal serializer for list views
    """

    student_name = serializers.SerializerMethodField()
    internship_title = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    assignment_id = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id',
            'student_name',
            'internship_title',
            'company_name',
            'status',
            'applied_at',
            'assignment_id',
        ]

    def get_student_name(self, obj):
        return obj.get_student_name()

    def get_internship_title(self, obj):
        return obj.internship.title

    def get_company_name(self, obj):
        return obj.get_company_name()

    def get_assignment_id(self, obj):
        try:
            return obj.advisor_assignment.id
        except Exception:
            return None


class ApplicationActionSerializer(serializers.Serializer):
    """
    Serializer for accept/reject actions
    Used by company to review applications
    """

    action = serializers.ChoiceField(
        choices=['accept', 'reject'],
        required=True,
    )
    rejection_reason = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=1000,
    )

    def validate(self, data):
        action = data.get('action')
        rejection_reason = data.get('rejection_reason', '').strip()

        if action == 'reject' and not rejection_reason:
            raise serializers.ValidationError({
                'rejection_reason': 'Rejection reason is required when rejecting an application.'
            })

        return data

    def perform_action(self, application, company_user):
        action = self.validated_data['action']
        try:
            if action == 'accept':
                application.accept(company_user)
                return (True, 'Application accepted successfully.')
            elif action == 'reject':
                reason = self.validated_data.get('rejection_reason', '')
                application.reject(company_user, reason=reason)
                return (True, 'Application rejected successfully.')
        except Exception as e:
            return (False, str(e))

        return (False, 'Invalid action.')