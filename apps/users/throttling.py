from rest_framework.throttling import UserRateThrottle

class UserProfileThrottle(UserRateThrottle):
    rate = '60/minute'