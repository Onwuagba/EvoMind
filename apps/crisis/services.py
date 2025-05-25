from typing import List, Dict, Any
from django.conf import settings
from .models import CrisisAlert, CrisisResource

class CrisisService:
    def create_alert(self, user, severity: str, description: str, 
                    location: Dict = None, contact_preference: str = 'phone') -> CrisisAlert:
        """Creates a crisis alert and triggers appropriate notifications."""
        alert = CrisisAlert.objects.create(
            user=user,
            severity=severity,
            description=description,
            location=location,
            contact_preference=contact_preference
        )

        self._notify_support_team(alert)
        return alert

    def get_hotlines(self) -> List[Dict[str, Any]]:
        """Returns list of emergency hotlines."""
        return [
            {
                "name": "National Crisis Line",
                "number": "988",
                "description": "24/7 suicide and crisis lifeline",
                "available_24_7": True
            },
            {
                "name": "Crisis Text Line",
                "number": "741741",
                "description": "Text HOME to connect with a Crisis Counselor",
                "available_24_7": True
            },
            {
                "name": "SAMHSA's National Helpline",
                "number": "1-800-662-4357",
                "description": "Treatment referral and information service",
                "available_24_7": True
            },
            {
                "name": "National Domestic Violence Hotline",
                "number": "1-800-799-7233",
                "description": "Support for domestic violence victims",
                "available_24_7": True
            }
        ]

    def _notify_support_team(self, alert: CrisisAlert) -> None:
        """Notifies support team based on alert severity."""
        if alert.severity in ['high', 'emergency']:
            # Implement immediate notification logic
            from django.core.mail import send_mail
            send_mail(
                subject='Crisis Alert: ' + alert.description,
                message='A high severity crisis alert has been triggered.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=settings.SUPPORT_TEAM_EMAILS,
                fail_silently=False
            )
