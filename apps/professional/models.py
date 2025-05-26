from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Therapist(models.Model):
    SPECIALIZATION_CHOICES = [
        ('anxiety', 'Anxiety'),
        ('depression', 'Depression'),
        ('trauma', 'Trauma'),
        ('relationships', 'Relationships'),
        ('general', 'General Mental Health'),
    ]

    name = models.CharField(max_length=255)
    specializations = models.JSONField()
    bio = models.TextField()
    years_of_experience = models.IntegerField(validators=[MinValueValidator(0)])
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    availability = models.JSONField(default=dict)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['is_available']),
            models.Index(fields=['-rating']),
        ]

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    therapist = models.ForeignKey(Therapist, on_delete=models.CASCADE)
    booking_date = models.DateField()
    time_slot = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', '-booking_date']),
            models.Index(fields=['therapist', '-booking_date']),
            models.Index(fields=['status']),
        ]
        unique_together = ['therapist', 'booking_date', 'time_slot']