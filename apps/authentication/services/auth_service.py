from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from typing import Dict, Optional
from django.contrib.auth.models import AbstractUser

class AuthenticationService:
    @staticmethod
    def login(email: str, password: str) -> Optional[Dict]:
        user = authenticate(username=email, password=password)
        if user:
            return AuthenticationService.get_tokens_for_user(user)
        return None
    
    @staticmethod
    def get_tokens_for_user(user: AbstractUser) -> Dict:
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    @staticmethod
    def refresh_token(refresh_token: str) -> Optional[Dict]:
        try:
            refresh = RefreshToken(refresh_token)
            return {
                'access': str(refresh.access_token)
            }
        except Exception:
            return None

    @staticmethod
    def logout(refresh_token: str) -> bool:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return True
        except Exception:
            return False