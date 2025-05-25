from rest_framework import serializers
from .models import UserMilestone, ProgressOverview

class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMilestone
        fields = ['id', 'milestone_type', 'title', 'description', 
                 'achieved_at', 'details']
        read_only_fields = ['achieved_at']

class ProgressOverviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressOverview
        fields = ['total_journal_entries', 'current_streak', 'longest_streak',
                 'milestones_achieved', 'last_activity', 'stats']
        read_only_fields = ['last_activity']

class ProgressUpdateSerializer(serializers.Serializer):
    milestone_type = serializers.ChoiceField(choices=UserMilestone.MILESTONE_TYPES)
    title = serializers.CharField(max_length=255)
    description = serializers.CharField()
    details = serializers.JSONField(required=False)

class ProgressUpdateRequestSerializer(serializers.Serializer):
    progress_type = serializers.ChoiceField(choices=[
        'journal_entry',
        'mood_improvement',
        'therapy_session',
        'goal_completion',
        'milestone_achieved'
    ])
    value = serializers.IntegerField(required=False)
    metadata = serializers.JSONField(required=False)