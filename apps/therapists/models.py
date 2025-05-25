from django.db import models
from django.conf import settings

# Create your models here.

class Therapist(models.Model):
    name = models.CharField(max_length=255)
    specialties = models.JSONField()
    availability = models.JSONField()
    rating = models.FloatField(default=0.0)
    is_available = models.BooleanField(default=True)

class Appointment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    therapist = models.ForeignKey(Therapist, on_delete=models.CASCADE)
    datetime = models.DateTimeField()
    status = models.CharField(max_length=20)
