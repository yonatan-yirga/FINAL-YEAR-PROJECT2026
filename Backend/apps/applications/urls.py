"""
Application URLs
URL routing for application system
"""
from django.urls import path
from . import views

app_name = 'applications'

urlpatterns = [
    # Student endpoints
    path('',                            views.ApplyToInternshipView.as_view(),   name='apply'),
    path('my-applications/',            views.MyApplicationsView.as_view(),      name='my-applications'),
    path('my-feedback/',                views.MyFeedbackView.as_view(),           name='my-feedback'),
    path('<int:pk>/',                   views.ApplicationDetailView.as_view(),    name='application-detail'),
    path('<int:pk>/withdraw/',          views.WithdrawApplicationView.as_view(),  name='withdraw'),
    path('<int:pk>/confirm/',           views.ConfirmPlacementView.as_view(),     name='confirm'),

    # Company endpoints
    path('company-applications/',       views.CompanyApplicationsView.as_view(),  name='company-applications'),
    path('<int:pk>/accept/',            views.AcceptApplicationView.as_view(),    name='accept'),
    path('<int:pk>/reject/',            views.RejectApplicationView.as_view(),    name='reject'),
]