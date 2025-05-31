from django.utils import timezone
from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=50, blank=True)
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    preferences = models.JSONField(default=dict)
    notification_settings = models.JSONField(default=dict)
    privacy_settings = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['user'])]


class UserProgress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    milestone = models.CharField(max_length=100)
    achieved_at = models.DateTimeField(auto_now_add=True)
    details = models.JSONField()

    class Meta:
        indexes = [
            models.Index(fields=['user', '-achieved_at']),
            models.Index(fields=['milestone']),
        ]
        ordering = ['-achieved_at']


class OnboardingStatus(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    steps_completed = models.JSONField(default=dict)
    last_step = models.CharField(max_length=50, blank=True)
    completed_at = models.DateTimeField(null=True)

    def save(self, *args, **kwargs):
        if self.completed and not self.completed_at:
            self.completed_at = timezone.now()
        super().save(*args, **kwargs)

    class Meta:
        indexes = [models.Index(fields=['user'])]
        ordering = ['-completed_at']


class Exercise(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    duration = models.IntegerField(help_text="Duration in minutes")
    category = models.CharField(max_length=50, choices=[
        ('breathing', 'Breathing Exercise'),
        ('meditation', 'Meditation'),
        ('journaling', 'Guided Journaling'),
        ('grounding', 'Grounding Technique'),
        ('reflection', 'Self-Reflection')
    ])
    difficulty = models.CharField(max_length=20, choices=[
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced')
    ])
    steps = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class SelfCareRoutine(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    frequency = models.CharField(max_length=50)
    exercises = models.ManyToManyField(
        Exercise, through='RoutineExercise')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class RoutineExercise(models.Model):
    routine = models.ForeignKey(
        SelfCareRoutine, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    order = models.IntegerField()
