from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # ADD THIS LINE for DRF login/logout:
    path('api-auth/', include('rest_framework.urls')),
    
    # API endpoints
    path('api/auth/', include('apps.accounts.urls')),
    path('api/registrations/', include('apps.registrations.urls')),
    path('api/departments/', include('apps.departments.urls')),
    path('api/internships/', include('apps.internships.urls')),
    path('api/applications/', include('apps.applications.urls')),
    path('api/advisors/', include('apps.advisors.urls', namespace='advisors')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/certificates/', include('apps.certificates.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/recommendations/', include('apps.recommendations.urls')),
    path('api/messages/', include('apps.messaging.urls')),

    # Root API view
    path('api/', lambda request: __import__('django.http').JsonResponse({
        'status': 'success',
        'message': 'University Internship API is running',
        'version': '1.0.0',
        'endpoints': [
            '/api/auth/',
            '/api/registrations/',
            '/api/departments/',
            '/api/internships/',
            '/api/applications/',
            '/api/advisors/',
            '/api/notifications/',
        ]
    })),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
