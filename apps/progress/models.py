from django.db import models
from django.conf import settings

class UserMilestone(models.Model):
    MILESTONE_TYPES = [
        ('journal_streak', 'Journal Streak'),
        ('mood_improvement', 'Mood Improvement'),
        ('coping_skill', 'Coping Skill Learned'),
        ('therapy_session', 'Therapy Session'),
        ('goal_achieved', 'Goal Achieved'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    milestone_type = models.CharField(max_length=50, choices=MILESTONE_TYPES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    achieved_at = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict)

    class Meta:
        ordering = ['-achieved_at']
        indexes = [
            models.Index(fields=['user', '-achieved_at']),
            models.Index(fields=['milestone_type']),
        ]

class ProgressOverview(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    total_journal_entries = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    milestones_achieved = models.IntegerField(default=0)
    last_activity = models.DateTimeField(auto_now=True)
    stats = models.JSONField(default=dict)

    class Meta:
        indexes = [models.Index(fields=['user'])]