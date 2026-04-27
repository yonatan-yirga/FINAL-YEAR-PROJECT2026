"""
Certificate URLs
"""
from django.urls import path
from . import views

app_name = 'certificates'

urlpatterns = [
    path('mark-completed/',      views.MarkStudentCompletedView.as_view(),    name='mark-completed'),
    path('my-certificate/',      views.MyCertificateView.as_view(),           name='my-certificate'),
    path('department/',          views.DepartmentCertificatesView.as_view(),  name='department-list'),
    path('<int:pk>/download/',   views.DownloadCertificateView.as_view(),     name='download'),
    path('verify/<str:code>/',   views.VerifyCertificateView.as_view(),       name='verify'),
]