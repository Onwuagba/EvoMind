from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserProfileView, 
    UserSettingsView, 
    OnboardingView, 
    DashboardView,
    ExerciseViewSet,
    SelfCareRoutineViewSet
)

router = DefaultRouter()
router.register(r'exercises', ExerciseViewSet, basename='exercise')
router.register(r'routines', SelfCareRoutineViewSet, basename='routine')

urlpatterns = [
    path('users/profile/', UserProfileView.as_view(), name='user-profile'),
    path('users/settings/', UserSettingsView.as_view(),
         name='user-settings'),
    path('users/onboarding/', OnboardingView.as_view(),
         name='user-onboarding'),
    path('users/dashboard/', DashboardView.as_view(),
         name='user-dashboard'),
    path('', include(router.urls)),
]
