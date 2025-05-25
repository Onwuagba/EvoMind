from django.db import models
from apps.journal.models import Journal

# Create your models here.

class JournalAnalysis(models.Model):
    journal = models.OneToOneField(Journal, on_delete=models.CASCADE)
    emotional_patterns = models.JSONField()
    triggers = models.JSONField()
    risk_level = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
