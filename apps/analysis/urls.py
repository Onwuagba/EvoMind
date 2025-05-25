from django.urls import path
from .views import JournalAnalysisView, TraumaPatternView

urlpatterns = [
    path('analysis/journal/', JournalAnalysisView.as_view(), name='journal-analysis'),
    path('analysis/trauma-pattern/', TraumaPatternView.as_view(), name='trauma-pattern'),
]