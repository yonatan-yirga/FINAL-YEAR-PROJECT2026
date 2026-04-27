"""
Internship URLs
"""
from django.urls import path
from . import views

app_name = 'internships'

urlpatterns = [
    # Public endpoint (no authentication required)
    path('public/', views.public_internships_list, name='public-internships'),
    
    # List and create
    path('', views.InternshipListView.as_view(), name='internship-list'),
    path('create/', views.CreateInternshipView.as_view(), name='internship-create'),
    
    # Company's own internships
    path('my-internships/', views.MyInternshipsView.as_view(), name='my-internships'),
    
    # Detail, update, delete
    path('<int:pk>/', views.InternshipDetailView.as_view(), name='internship-detail'),
    path('<int:pk>/update/', views.UpdateInternshipView.as_view(), name='internship-update'),
    path('<int:pk>/delete/', views.DeleteInternshipView.as_view(), name='internship-delete'),
    
    # Actions
    path('<int:pk>/close/', views.close_internship, name='internship-close'),
    path('<int:pk>/reopen/', views.reopen_internship, name='internship-reopen'),
]