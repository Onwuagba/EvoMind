from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TherapistViewSet, BookingView

router = DefaultRouter()
router.register(r'therapists', TherapistViewSet, basename='therapist')

urlpatterns = [
    path('', include(router.urls)),
    path('therapists/book/', BookingView.as_view(), name='therapist-booking'),
]