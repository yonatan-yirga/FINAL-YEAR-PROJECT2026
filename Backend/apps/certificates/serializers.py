"""
Certificate Serializers
"""
from rest_framework import serializers
from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            'id', 'certificate_id', 'verification_code', 'issue_date',
            'student_name', 'student_university_id',
            'company_name', 'internship_title', 'department_name',
            'advisor_name', 'start_date', 'end_date',
            'duration_months', 'performance_grade',
            'is_generated', 'pdf_url', 'created_at',
        ]
        read_only_fields = fields

    def get_pdf_url(self, obj):
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
        return None


class CertificateVerifySerializer(serializers.ModelSerializer):
    """Public serializer — no sensitive data."""
    class Meta:
        model = Certificate
        fields = [
            'certificate_id', 'issue_date',
            'student_name', 'student_university_id',
            'company_name', 'internship_title', 'department_name',
            'advisor_name', 'start_date', 'end_date',
            'duration_months', 'performance_grade',
        ]
        read_only_fields = fields