from django.urls import path
from .views import DashboardView, UserProfileView, UserSettingsView, OnboardingView

urlpatterns = [
    path('users/profile/', UserProfileView.as_view(), name='user-profile'),
    path('users/settings/', UserSettingsView.as_view(), name='user-settings'),
    path('users/onboarding/', OnboardingView.as_view(), name='user-onboarding'),
    path('users/dashboard/', DashboardView.as_view(), name='user-dashboard'),
]