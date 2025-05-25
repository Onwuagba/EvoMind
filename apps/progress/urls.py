from django.urls import path
from .views import ProgressOverviewView, MilestoneView, ProgressUpdateView

urlpatterns = [
    path('progress/overview/', ProgressOverviewView.as_view(), name='progress-overview'),
    path('progress/milestones/', MilestoneView.as_view(), name='progress-milestones'),
    path('progress/update/', ProgressUpdateView.as_view(), name='progress-update'),
]