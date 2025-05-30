from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JournalViewSet, SaveMoodView, WeeklyMoodView

router = DefaultRouter()
router.register(r'journals', JournalViewSet, basename='journal')

urlpatterns = [
    path('', include(router.urls)),
    path('mood/', SaveMoodView.as_view(), name='save-mood'),
    path('mood/weekly/', WeeklyMoodView.as_view(), name='weekly-mood'),
]