from rest_framework.throttling import UserRateThrottle

class JournalRateThrottle(UserRateThrottle):
    rate = '60/minute'