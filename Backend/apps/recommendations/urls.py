"""
Recommendations URLs
"""
from django.urls import path
from . import views

app_name = 'recommendations'

urlpatterns = [
    # Get personalized recommendations
    path('internships/', views.RecommendedInternshipsView.as_view(), name='recommended-internships'),
    
    # Explain why an internship matches
    path('explain/<int:internship_id>/', views.ExplainRecommendationView.as_view(), name='explain-recommendation'),
]