"""
accounts/urls.py 
"""
from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # Authentication
    path('login/',          views.LoginView.as_view(),          name='login'),
    path('logout/',         views.LogoutView.as_view(),         name='logout'),
    path('profile/',        views.UserProfileView.as_view(),    name='profile'),

    # Password management
    path('change-password/',                        views.PasswordChangeView.as_view(),      name='change-password'),
    path('forgot-password/',                        views.ForgotPasswordView.as_view(),      name='forgot-password'),
    path('send-temporary-password/',                views.SendTemporaryPasswordView.as_view(), name='send-temporary-password'),
    path('reset-password/',                         views.ResetPasswordView.as_view(),       name='reset-password'),
    path('reset-password/<str:token>/validate/',    views.ValidateResetTokenView.as_view(),  name='validate-reset-token'),

    # System
    path('system-status/', views.SystemStatusView.as_view(), name='system-status'),

    # UIL (Phase 11)
    path('users/',          views.UILUserListView.as_view(),    name='uil-users'),
    path('system-stats/',   views.UILSystemStatsView.as_view(), name='system-stats'),

    # Admin Management
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/', views.AdminUserDetailView.as_view(), name='admin-user-detail'),
]