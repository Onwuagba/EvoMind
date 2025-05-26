from rest_framework.throttling import UserRateThrottle

class TherapistRateThrottle(UserRateThrottle):
    rate = '60/minute'  # Allow 60 requests per minute per user
    scope = 'therapist'