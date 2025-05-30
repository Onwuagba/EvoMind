from rest_framework import serializers
from .models import Journal, DailyMood

class JournalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Journal
        fields = ['id', 'user', 'content', 'mood_score', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_content(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Journal entry must be at least 10 characters long")
        return value.strip()

    def validate_mood_score(self, value):
        if value and not (1 <= value <= 5):
            raise serializers.ValidationError("Mood score must be between 1 and 5")
        return value

class DailyMoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyMood
        fields = ['id', 'user', 'mood', 'date']
        read_only_fields = ['id', 'user', 'date']