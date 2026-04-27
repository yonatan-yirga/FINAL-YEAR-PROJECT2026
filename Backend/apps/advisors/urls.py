"""
Advisor URLs
URL routing for advisor endpoints
"""
from django.urls import path
from .views import (
    MyStudentsView,
    StudentDetailView,
    StudentFeedbackListView,
    CreateFeedbackView,
    MarkStudentCompletedView,
    AdvisorStatisticsView,
)

app_name = 'advisors'

urlpatterns = [
    # Advisor Dashboard
    path('statistics/', AdvisorStatisticsView.as_view(), name='advisor-statistics'),
    
    # My Students
    path('my-students/', MyStudentsView.as_view(), name='my-students'),
    
    # Student Detail
    path('students/<int:pk>/', StudentDetailView.as_view(), name='student-detail'),
    
    # Feedback
    path('students/<int:pk>/feedback/', StudentFeedbackListView.as_view(), name='student-feedback-list'),
    path('students/<int:pk>/feedback/create/', CreateFeedbackView.as_view(), name='create-feedback'),
    
    # Mark Completed
    path('students/<int:pk>/complete/', MarkStudentCompletedView.as_view(), name='mark-completed'),
]