"""
Notification URLs
API endpoints for notification management
"""
from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    # List notifications
    path('', views.NotificationListView.as_view(), name='list'),
    
    # Unread count
    path('unread-count/', views.UnreadCountView.as_view(), name='unread-count'),
    
    # Recent notifications (for bell dropdown)
    path('recent/', views.RecentNotificationsView.as_view(), name='recent'),
    
    # Mark as read
    path('<int:pk>/mark-read/', views.MarkAsReadView.as_view(), name='mark-read'),
    path('mark-all-read/', views.MarkAllReadView.as_view(), name='mark-all-read'),
    
    # Delete notification
    path('<int:pk>/', views.DeleteNotificationView.as_view(), name='delete'),
]