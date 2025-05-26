from django.urls import path
from .views import JournalExportView, InsightsExportView

urlpatterns = [
    path('export/journal/', JournalExportView.as_view(), name='journal-export'),
    path('export/insights/', InsightsExportView.as_view(), name='insights-export'),
]