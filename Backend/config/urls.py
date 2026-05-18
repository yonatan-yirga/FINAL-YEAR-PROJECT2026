from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

urlpatterns = [
    path('admin/', admin.site.urls),

    # ADD THIS LINE for DRF login/logout:
    path('api-auth/', include('rest_framework.urls')),
    
    # API endpoints
    path('api/auth/', include('apps.accounts.urls')),
    path('api/oauth/', include('apps.oauth.urls')),  # OAuth endpoints
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
    path('api/', lambda request: JsonResponse({
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

# Serve media files in development with custom browser
if settings.DEBUG:
    from apps.core.views import media_browser
    
    # Custom media browser
    urlpatterns += [
        re_path(r'^media-browser/(?P<path>.*)$', media_browser, name='media-browser'),
        path('media-browser/', media_browser, name='media-browser-root'),
    ]
    
    # Default media serving
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
else:
    # Serve media in production too (uploaded files)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

