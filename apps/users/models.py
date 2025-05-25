from django.db import models
from django.conf import settings

class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    preferences = models.JSONField(default=dict)
    notification_settings = models.JSONField(default=dict)
    privacy_settings = models.JSONField(default=dict)

class UserProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    milestone = models.CharField(max_length=100)
    achieved_at = models.DateTimeField(auto_now_add=True)
    details = models.JSONField()