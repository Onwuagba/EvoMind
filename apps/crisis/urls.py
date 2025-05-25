from django.urls import path
from .views import CrisisResourceView, CrisisAlertView, HotlineView

urlpatterns = [
    path('crisis/resources/', CrisisResourceView.as_view(), name='crisis-resources'),
    path('crisis/alert/', CrisisAlertView.as_view(), name='crisis-alert'),
    path('crisis/hotlines/', HotlineView.as_view(), name='crisis-hotlines'),
]