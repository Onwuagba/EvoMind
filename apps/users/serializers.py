from rest_framework import serializers
from .models import UserProfile, OnboardingStatus, Exercise, SelfCareRoutine
from django.utils import timezone
import datetime

class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['email', 'display_name', 'bio',
                  'avatar_url', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['preferences', 'notification_settings']


class OnboardingSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnboardingStatus
        fields = ['completed', 'steps_completed',
                  'last_step', 'completed_at']


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'title', 'description', 'duration', 'category',
                  'difficulty', 'steps', 'created_at']


class SelfCareRoutineSerializer(serializers.ModelSerializer):
    exercises = ExerciseSerializer(many=True, read_only=True)

    class Meta:
        model = SelfCareRoutine
        fields = ['id', 'title', 'description', 'frequency', 'exercises',
                  'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
