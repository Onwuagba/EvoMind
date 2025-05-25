from rest_framework.throttling import UserRateThrottle

class ProgressThrottle(UserRateThrottle):
    rate = '60/minute'