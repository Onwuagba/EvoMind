from django.urls import path
from .views import UserProfileView, UserSettingsView, OnboardingView

urlpatterns = [
    path('users/profile/', UserProfileView.as_view(), name='user-profile'),
    path('users/settings/', UserSettingsView.as_view(), name='user-settings'),
    path('users/onboarding/', OnboardingView.as_view(), name='user-onboarding'),
]