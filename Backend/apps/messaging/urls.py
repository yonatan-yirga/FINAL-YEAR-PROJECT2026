"""
Messaging URLs
"""
from django.urls import path
from . import views

app_name = 'messaging'

urlpatterns = [
    path('conversations/', views.ConversationListView.as_view(), name='conversations'),
    path('<int:assignment_id>/', views.MessageListView.as_view(), name='message-list'),
    path('send/', views.SendMessageView.as_view(), name='send'),
]
