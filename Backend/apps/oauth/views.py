"""
OAuth Authentication Views
Handles Google and GitHub OAuth login/registration
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView, SocialConnectView
import requests


class GoogleLogin(SocialLoginView):
    """
    Google OAuth2 Login
    POST /api/auth/google/
    Body: { "access_token": "..." } or { "code": "..." }
    """
    permission_classes = [AllowAny]
    adapter_class = GoogleOAuth2Adapter
    callback_url = settings.OAUTH_REDIRECT_URL
    client_class = OAuth2Client


class GitHubLogin(SocialLoginView):
    """
    GitHub OAuth2 Login
    POST /api/auth/github/
    Body: { "access_token": "..." } or { "code": "..." }
    """
    permission_classes = [AllowAny]
    adapter_class = GitHubOAuth2Adapter
    callback_url = settings.OAUTH_REDIRECT_URL
    client_class = OAuth2Client


class GoogleConnect(SocialConnectView):
    """
    Connect Google account to existing user
    POST /api/auth/google/connect/
    """
    adapter_class = GoogleOAuth2Adapter
    callback_url = settings.OAUTH_REDIRECT_URL
    client_class = OAuth2Client


class GitHubConnect(SocialConnectView):
    """
    Connect GitHub account to existing user
    POST /api/auth/github/connect/
    """
    adapter_class = GitHubOAuth2Adapter
    callback_url = settings.OAUTH_REDIRECT_URL
    client_class = OAuth2Client


class OAuthCallbackView(APIView):
    """
    OAuth Callback Handler
    GET /api/auth/callback/?code=...&state=...
    Handles the OAuth redirect from Google/GitHub
    """
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.GET.get('code')
        state = request.GET.get('state')
        error = request.GET.get('error')

        if error:
            return Response({
                'error': error,
                'message': 'OAuth authorization was denied or failed.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not code:
            return Response({
                'error': 'missing_code',
                'message': 'Authorization code is missing.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Return the code to frontend for token exchange
        return Response({
            'code': code,
            'state': state,
            'message': 'Authorization successful. Exchange code for token.'
        })


class ExchangeTokenView(APIView):
    """
    Exchange OAuth code for access token
    POST /api/auth/exchange-token/
    Body: { "provider": "google|github", "code": "..." }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        provider = request.data.get('provider')
        code = request.data.get('code')

        if not provider or not code:
            return Response({
                'error': 'Missing provider or code'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            if provider == 'google':
                token_url = 'https://oauth2.googleapis.com/token'
                client_id = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']
                client_secret = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['secret']
            elif provider == 'github':
                token_url = 'https://github.com/login/oauth/access_token'
                client_id = settings.SOCIALACCOUNT_PROVIDERS['github']['APP']['client_id']
                client_secret = settings.SOCIALACCOUNT_PROVIDERS['github']['APP']['secret']
            else:
                return Response({
                    'error': 'Invalid provider'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Exchange code for access token
            response = requests.post(token_url, data={
                'client_id': client_id,
                'client_secret': client_secret,
                'code': code,
                'redirect_uri': settings.OAUTH_REDIRECT_URL,
                'grant_type': 'authorization_code',
            }, headers={'Accept': 'application/json'})

            if response.status_code != 200:
                return Response({
                    'error': 'Token exchange failed',
                    'details': response.text
                }, status=status.HTTP_400_BAD_REQUEST)

            token_data = response.json()
            access_token = token_data.get('access_token')

            if not access_token:
                return Response({
                    'error': 'No access token received'
                }, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                'access_token': access_token,
                'provider': provider
            })

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
