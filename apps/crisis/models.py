from django.db import models
from django.conf import settings

# Create your models here.

class CrisisResource(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    description = models.TextField()
    is_active = models.BooleanField(default=True)

class CrisisAlert(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    severity = models.CharField(max_length=20)
    resolved = models.BooleanField(default=False)
