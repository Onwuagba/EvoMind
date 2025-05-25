from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

class CrisisThrottle(UserRateThrottle):
    rate = '60/minute'

class HotlineThrottle(AnonRateThrottle):
    rate = '30/minute'