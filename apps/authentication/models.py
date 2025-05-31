from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_onboarded = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    def get_streak_count(self):
        """Calculate journaling streak by counting consecutive days with entries"""
        from apps.journal.models import Journal  # Import here to avoid circular import
        from django.utils import timezone
        from django.db.models.functions import TruncDate
        from datetime import timedelta
        
        today = timezone.now().date()
        journal_entries = Journal.objects.filter(
            user=self
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').distinct()

        consecutive_days = 0
        check_date = today
        
        while journal_entries.filter(date=check_date).exists():
            consecutive_days += 1
            check_date = check_date - timedelta(days=1)

        return consecutive_days
