"""
Registration URLs
"""
from django.urls import path
from . import views

app_name = 'registrations'

urlpatterns = [
    # Public registration endpoint
    path('register/', views.RegisterView.as_view(), name='register'),
    
    # UIL endpoints - registration management
    path('pending/', views.PendingRegistrationsView.as_view(), name='pending'),
    path('<int:pk>/', views.RegistrationDetailView.as_view(), name='detail'),
    path('<int:pk>/approve/', views.ApproveRegistrationView.as_view(), name='approve'),
    path('<int:pk>/reject/', views.RejectRegistrationView.as_view(), name='reject'),
    path('stats/', views.UILDashboardStatsView.as_view(), name='stats'),
    
    # Public endpoint - department list for dropdown
    path('departments/', views.DepartmentListView.as_view(), name='departments'),
]