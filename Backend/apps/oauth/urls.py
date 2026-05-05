"""
OAuth URLs
"""
from django.urls import path, include
from . import views

app_name = 'oauth'

urlpatterns = [
    # Google OAuth
    path('google/', views.GoogleLogin.as_view(), name='google_login'),
    path('google/connect/', views.GoogleConnect.as_view(), name='google_connect'),
    
    # GitHub OAuth
    path('github/', views.GitHubLogin.as_view(), name='github_login'),
    path('github/connect/', views.GitHubConnect.as_view(), name='github_connect'),
    
    # OAuth Callback
    path('callback/', views.OAuthCallbackView.as_view(), name='oauth_callback'),
    path('exchange-token/', views.ExchangeTokenView.as_view(), name='exchange_token'),
    
    # Django-allauth URLs
    path('', include('allauth.urls')),
]
