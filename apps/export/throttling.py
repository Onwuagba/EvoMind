from rest_framework.throttling import UserRateThrottle


class ExportRateThrottle(UserRateThrottle):
    rate = '10/hour'  # Limit exports to 10 per hour