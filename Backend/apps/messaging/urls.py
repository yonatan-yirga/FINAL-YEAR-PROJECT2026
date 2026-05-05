"""
Messaging URLs
"""
from django.urls import path
from . import views
from . import agora_views

app_name = 'messaging'

urlpatterns = [
    path('conversations/', views.ConversationListView.as_view(), name='conversations'),
    path('<int:assignment_id>/', views.MessageListView.as_view(), name='message-list'),
    path('send/', views.SendMessageView.as_view(), name='send'),
    path('<int:message_id>/edit/', views.EditMessageView.as_view(), name='edit'),
    path('<int:message_id>/delete/', views.DeleteMessageView.as_view(), name='delete'),
    
    # Agora video/audio calling
    path('agora/token/', agora_views.GenerateAgoraTokenView.as_view(), name='agora-token'),
    path('agora/notify/', agora_views.CallNotificationView.as_view(), name='agora-notify'),
]
