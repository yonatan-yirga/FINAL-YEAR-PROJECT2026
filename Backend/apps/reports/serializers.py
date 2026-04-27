"""
Reports Serializers 
"""
from rest_framework import serializers
from .models import MonthlyReport, FinalReport
from apps.advisors.models import AdvisorAssignment


# ── Keep all Phase 8 serializers ──────────────────────────────────────────────

class MonthlyReportSerializer(serializers.ModelSerializer):
    """Full detail — read only."""
    student_name      = serializers.CharField(source='student.get_full_name', read_only=True)
    company_name      = serializers.SerializerMethodField()
    advisor_name      = serializers.CharField(source='advisor_assignment.advisor.get_full_name', read_only=True)
    performance_label = serializers.CharField(source='get_performance_rating_display', read_only=True)
    pdf_url           = serializers.SerializerMethodField()

    class Meta:
        model  = MonthlyReport
        fields = [
            'id', 'report_month', 'submitted_at',
            'student_name', 'company_name', 'advisor_name',
            'attendance_rate', 'performance_rating', 'performance_label',
            'tasks_completed', 'comments', 'pdf_url',
        ]

    def get_company_name(self, obj):
        try:
            return obj.company.company_profile.company_name
        except Exception:
            return obj.company.email

    def get_pdf_url(self, obj):
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
            return obj.pdf_file.url
        return None


class MonthlyReportCreateSerializer(serializers.ModelSerializer):
    """Used by company to submit a monthly report."""
    assignment_id = serializers.IntegerField(write_only=True)
    comments = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model  = MonthlyReport
        fields = [
            'assignment_id',
            'report_month',
            'attendance_rate',
            'performance_rating',
            'tasks_completed',
            'comments',
        ]

    def validate(self, data):
        request    = self.context['request']
        company    = request.user

        try:
            assignment = AdvisorAssignment.objects.select_related(
                'student', 'advisor', 'internship',
            ).get(id=data['assignment_id'], internship__company=company, is_active=True)
        except AdvisorAssignment.DoesNotExist:
            raise serializers.ValidationError(
                {'assignment_id': 'Active assignment not found for your company.'}
            )

        if MonthlyReport.objects.filter(
            student=assignment.student,
            advisor_assignment=assignment,
            report_month=data['report_month'],
        ).exists():
            raise serializers.ValidationError(
                {'report_month': f'Report for Month {data["report_month"]} already submitted.'}
            )

        data['_assignment'] = assignment
        return data

    def create(self, validated_data):
        assignment = validated_data.pop('_assignment')
        validated_data.pop('assignment_id')
        request    = self.context['request']

        if not validated_data.get('comments', '').strip():
            validated_data['comments'] = 'No additional comments.'

        return MonthlyReport.objects.create(
            advisor_assignment = assignment,
            student            = assignment.student,
            company            = request.user,
            submitted_by       = request.user,
            **validated_data,
        )


class ActiveInternSerializer(serializers.ModelSerializer):
    """Minimal serializer for the company's intern dropdown."""
    student_id        = serializers.IntegerField(source='student.id',        read_only=True)
    student_name      = serializers.CharField(source='student.get_full_name', read_only=True)
    university_id     = serializers.SerializerMethodField()
    internship_title  = serializers.CharField(source='internship.title',     read_only=True)
    months_elapsed    = serializers.SerializerMethodField()
    reports_submitted = serializers.SerializerMethodField()
    has_final_report  = serializers.SerializerMethodField()

    class Meta:
        model  = AdvisorAssignment
        fields = [
            'id', 'student_id', 'student_name', 'university_id',
            'internship_title', 'months_elapsed', 'reports_submitted',
            'has_final_report',
        ]

    def get_university_id(self, obj):
        try:
            return obj.student.student_profile.university_id
        except Exception:
            return '—'

    def get_months_elapsed(self, obj):
        try:
            from datetime import date
            delta = date.today() - obj.internship.start_date
            return max(1, delta.days // 30)
        except Exception:
            return 1

    def get_reports_submitted(self, obj):
        return list(MonthlyReport.objects.filter(
            student=obj.student,
            advisor_assignment=obj,
        ).values_list('report_month', flat=True))

    def get_has_final_report(self, obj):
        return FinalReport.objects.filter(advisor_assignment=obj).exists()


# ── Phase 9: FinalReport serializers ──────────────────────────────────────────

class StudentFinalReportSerializer(serializers.ModelSerializer):
    """Full detail for student's final report submission."""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        from .models import StudentFinalReport
        model = StudentFinalReport
        fields = [
            'id', 'student_name', 'status', 'status_label',
            'report_file', 'summary', 'advisor_feedback', 'submitted_at',
        ]

class StudentFinalReportCreateSerializer(serializers.ModelSerializer):
    """Used by student to upload their final report."""
    assignment_id = serializers.IntegerField(write_only=True)

    class Meta:
        from .models import StudentFinalReport
        model = StudentFinalReport
        fields = ['assignment_id', 'report_file', 'summary']

    def validate(self, data):
        request = self.context['request']
        student = request.user
        try:
            assignment = AdvisorAssignment.objects.select_related('student').get(
                id=data['assignment_id'], student=student, is_active=True
            )
        except AdvisorAssignment.DoesNotExist:
            raise serializers.ValidationError({'assignment_id': 'Active assignment not found.'})
        
        data['_assignment'] = assignment
        return data

    def create(self, validated_data):
        from .models import StudentFinalReport
        assignment = validated_data.pop('_assignment')
        validated_data.pop('assignment_id')
        return StudentFinalReport.objects.create(
            advisor_assignment=assignment,
            student=self.context['request'].user,
            **validated_data
        )

class FinalReportCompanySerializer(serializers.ModelSerializer):
    """Stage 1 — Company submits evaluation and numerical score."""
    assignment_id = serializers.IntegerField(write_only=True)

    class Meta:
        model  = FinalReport
        fields = [
            'assignment_id',
            'internship_duration',
            'company_performance_assessment',
            'company_recommendation',
            'company_score',
        ]

    def validate(self, data):
        request = self.context['request']
        company = request.user
        try:
            assignment = AdvisorAssignment.objects.select_related(
                'student', 'advisor', 'internship', 'internship__company',
            ).get(id=data['assignment_id'], internship__company=company, is_active=True)
        except AdvisorAssignment.DoesNotExist:
            raise serializers.ValidationError({'assignment_id': 'Active assignment not found.'})

        if FinalReport.objects.filter(advisor_assignment=assignment).exists():
            raise serializers.ValidationError({'assignment_id': 'Evaluation already exists.'})

        data['_assignment'] = assignment
        return data

    def create(self, validated_data):
        from django.utils import timezone
        assignment = validated_data.pop('_assignment')
        validated_data.pop('assignment_id')
        return FinalReport.objects.create(
            advisor_assignment=assignment,
            student=assignment.student,
            company=self.context['request'].user,
            advisor=assignment.advisor,
            status='PENDING_ADVISOR',
            company_submitted_at=timezone.now(),
            **validated_data
        )

class FinalReportAdvisorSerializer(serializers.ModelSerializer):
    """Stage 2 — Advisor evaluates based on structured criteria and score."""
    class Meta:
        model  = FinalReport
        fields = [
            'advisor_evaluation',
            'advisor_score',
            'criteria_scores',
        ]

    def validate(self, data):
        if data.get('advisor_score') is None:
            raise serializers.ValidationError({'advisor_score': 'Advisor score is required.'})
        return data

    def update(self, instance, validated_data):
        from django.utils import timezone
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.advisor_submitted_at = timezone.now()
        instance.status = 'SUBMITTED_TO_DEPARTMENT'
        instance.save() # Triggers grade calculation in model save()
        return instance

class FinalReportDetailSerializer(serializers.ModelSerializer):
    """Full read-only detail for any authorized viewer."""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    company_name = serializers.SerializerMethodField()
    advisor_name = serializers.CharField(source='advisor.get_full_name', read_only=True)
    department_head_name = serializers.CharField(source='department_head.get_full_name', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    grade_label  = serializers.CharField(source='get_overall_grade_display', read_only=True)
    pdf_url      = serializers.SerializerMethodField()
    student_report = serializers.SerializerMethodField()
    company_monthly_reports = serializers.SerializerMethodField()
    student_monthly_reports = serializers.SerializerMethodField()

    class Meta:
        model  = FinalReport
        fields = [
            'id', 'status', 'status_label', 'advisor_assignment_id',
            'student_name', 'company_name', 'advisor_name', 'department_head_name',
            'company_score', 'company_performance_assessment',
            'advisor_score', 'advisor_evaluation', 'criteria_scores',
            'total_score', 'overall_grade', 'grade_label',
            'department_review', 'department_approved', 'department_reviewed_at',
            'certificate_issued', 'certificate_issued_at',
            'pdf_url', 'student_report',
            'company_monthly_reports', 'student_monthly_reports',
        ]

    def get_company_name(self, obj):
        try: return obj.company.company_profile.company_name
        except: return obj.company.email

    def get_student_report(self, obj):
        try:
            report = obj.advisor_assignment.student_final_report
            return StudentFinalReportSerializer(report).data
        except: return None

    def get_company_monthly_reports(self, obj):
        reports = obj.advisor_assignment.monthly_reports.all().order_by('report_month')
        return MonthlyReportSerializer(reports, many=True).data

    def get_student_monthly_reports(self, obj):
        reports = obj.advisor_assignment.student_monthly_reports.all().order_by('report_month')
        return StudentMonthlyReportSerializer(reports, many=True).data

    def get_pdf_url(self, obj):
        if obj.pdf_file: return obj.pdf_file.url
        return None

class FinalReportListSerializer(serializers.ModelSerializer):
    """Compact list view."""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    company_name = serializers.SerializerMethodField()
    advisor_name = serializers.CharField(source='advisor.get_full_name', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    grade        = serializers.CharField(source='overall_grade', read_only=True)

    class Meta:
        model  = FinalReport
        fields = [
            'id', 'student_name', 'company_name', 'advisor_name',
            'status', 'status_label', 'total_score', 'grade', 
            'advisor_submitted_at', 'department_approved', 
            'department_reviewed_at', 'certificate_issued',
        ]

    def get_company_name(self, obj):
        try: return obj.company.company_profile.company_name
        except: return obj.company.email

class StudentMonthlyReportSerializer(serializers.ModelSerializer):
    """Full detail for student monthly report — read only."""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    company_name = serializers.SerializerMethodField()

    class Meta:
        from .models import StudentMonthlyReport
        model = StudentMonthlyReport
        fields = [
            'id', 'report_month', 'submitted_at',
            'student_name', 'company_name',
            'tasks_performed', 'skills_learned', 'challenges_faced',
            'solutions_applied', 'hours_worked', 'report_file',
        ]

    def get_company_name(self, obj):
        try: return obj.advisor_assignment.internship.company.company_profile.company_name
        except: return obj.advisor_assignment.internship.company.email

class StudentMonthlyReportCreateSerializer(serializers.ModelSerializer):
    """Used by student to submit a monthly report."""
    assignment_id = serializers.IntegerField(write_only=True)

    class Meta:
        from .models import StudentMonthlyReport
        model = StudentMonthlyReport
        fields = [
            'assignment_id', 'report_month', 'tasks_performed', 
            'skills_learned', 'challenges_faced', 'solutions_applied', 
            'hours_worked', 'report_file'
        ]

    def validate(self, data):
        request = self.context['request']
        try:
            assignment = AdvisorAssignment.objects.get(id=data['assignment_id'], student=request.user, is_active=True)
        except AdvisorAssignment.DoesNotExist:
            raise serializers.ValidationError({'assignment_id': 'Active assignment not found.'})
        data['_assignment'] = assignment
        return data

    def create(self, validated_data):
        from .models import StudentMonthlyReport
        assignment = validated_data.pop('_assignment')
        validated_data.pop('assignment_id')
        return StudentMonthlyReport.objects.create(
            advisor_assignment=assignment,
            student=self.context['request'].user,
            **validated_data
        )