from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import ArrayField

User = get_user_model()

class JournalAnalysis(models.Model):
    RISK_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    emotional_patterns = ArrayField(models.CharField(max_length=255), blank=True)
    trigger_identification = ArrayField(models.CharField(max_length=255), blank=True)
    coping_suggestions = ArrayField(models.CharField(max_length=255), blank=True)
    risk_level = models.CharField(max_length=10, choices=RISK_LEVELS)
    analysis_summary = models.TextField(null=True, blank=True)
    analysis_type = models.CharField(max_length=50, null=True, blank=True)  # e.g., 'gemini', 'openai'
    created_at = models.DateTimeField(auto_now_add=True)
    analyzed_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['risk_level']),
        ]
