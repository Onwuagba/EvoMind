from rest_framework.throttling import UserRateThrottle

class AIAnalysisThrottle(UserRateThrottle):
    rate = '30/minute'