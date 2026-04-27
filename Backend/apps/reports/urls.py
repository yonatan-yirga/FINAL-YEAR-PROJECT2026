"""
Reports URL Configuration """
from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    # ── Phase 8: Monthly Reports ──────────────────────────────────────────────

    # Company: get active interns for dropdown
    path('active-interns/',         views.ActiveInternsView.as_view(),          name='active-interns'),

    # Company: submit a monthly report
    path('monthly/submit/',         views.SubmitMonthlyReportView.as_view(),     name='submit-monthly'),

    # Company: view their submitted monthly reports
    path('monthly/company/',        views.CompanyMonthlyReportsView.as_view(),   name='company-monthly-reports'),

    # Advisor: view monthly reports for their students
    path('monthly/advisor/',        views.AdvisorMonthlyReportsView.as_view(),   name='advisor-monthly-reports'),

    # Student: view their own monthly reports (company-submitted)
    path('monthly/student/',        views.StudentMonthlyReportsView.as_view(),   name='student-monthly-reports'),
    
    # Student: submit their OWN monthly report (student-submitted)
    path('student-monthly/submit/', views.SubmitStudentMonthlyReportView.as_view(), name='submit-student-monthly'),
    
    # Student: view their OWN submitted reports
    path('student-monthly/my-reports/', views.StudentPersonalMonthlyReportsView.as_view(), name='my-student-monthly-reports'),

    # Advisor: view reports submitted by students
    path('student-monthly/advisor/', views.AdvisorStudentMonthlyReportsView.as_view(), name='advisor-student-monthly-reports'),

    # Any authorized party: single monthly report detail
    path('monthly/<int:pk>/',       views.MonthlyReportDetailView.as_view(),     name='monthly-report-detail'),

    # ── Phase 9: Final Reports ────────────────────────────────────────────────

    # Stage 1: Company submits final evaluation
    path('final/submit/',           views.CompanySubmitFinalReportView.as_view(), name='submit-final'),

    # Stage 1.5: Student uploads their report
    path('final/student-submit/', views.StudentSubmitFinalReportView.as_view(), name='student-submit-final'),

    # Stage 1.6: Advisor approves/rejects student report
    path('final/advisor-review/<int:pk>/', views.AdvisorReviewFinalReportView.as_view(), name='advisor-review-student-final'),

    # Stage 1.7: Advisor initiates FinalReport when company hasn't submitted yet
    path('final/advisor-initiate/', views.AdvisorInitiateFinalReportView.as_view(), name='advisor-initiate-final'),

    # Stage 2: Advisor completes final weighted evaluation
    path('final/<int:pk>/complete/', views.AdvisorCompleteFinalReportView.as_view(), name='complete-final'),

    # Company: list their submitted final reports
    path('final/company/',          views.CompanyFinalReportsView.as_view(),     name='company-final-reports'),

    # Advisor: pending + completed final reports
    path('final/advisor/',          views.AdvisorFinalReportsView.as_view(),     name='advisor-final-reports'),

    # Department/UIL: all final reports in department
    path('final/department/',       views.DepartmentFinalReportsView.as_view(),  name='department-final-reports'),

    # Department Head: approve or reject final report
    path('final/<int:pk>/department-approve/', views.DepartmentApproveFinalReportView.as_view(), name='department-approve-final'),

    # Department Head: issue certificate after approval
    path('final/<int:pk>/issue-certificate/', views.DepartmentIssueCertificateView.as_view(), name='issue-certificate'),

    # Department Head: view issued certificates
    path('certificates/department/', views.DepartmentCertificatesView.as_view(), name='department-certificates'),

    # Department Head: get pending approvals and ready-for-certificate reports
    path('final/department/pending-approvals/', views.DepartmentPendingApprovalsView.as_view(), name='department-pending-approvals'),

    # PDF download — streams file directly to avoid cross-origin media URL issues
    path('final/<int:pk>/pdf/',     views.FinalReportPDFDownloadView.as_view(), name='final-report-pdf'),

    # Any authorized party: single final report detail
    path('final/<int:pk>/',         views.FinalReportDetailView.as_view(),       name='final-report-detail'),

    # Consolidated monthly reports PDF
    path('monthly/consolidated/<int:assignment_id>/', views.ConsolidatedReportPDFView.as_view(), name='consolidated-reports-pdf'),
]