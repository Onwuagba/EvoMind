import time
from rest_framework import status
from rest_framework.response import Response
from functools import wraps
import logging
from typing import Dict, Any
from functools import partial
from asgiref.sync import sync_to_async
from django.core.cache import cache
from google.generativeai import GenerativeModel

logger = logging.getLogger(__name__)


class BaseService:
    """Base service class with common functionality"""

    def _serialize_data_for_cache(self, data: dict) -> str:
        """Convert data to string for cache key generation"""
        return str(sorted(data.items()))


def rate_limit(requests: int, interval: int):
    """
    Rate limiting decorator for API views

    Args:
        requests (int): Number of allowed requests per interval
        interval (int): Time interval in seconds
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(self, request, *args, **kwargs):
            # Create unique cache key for user and endpoint
            key = f"rate_limit_{request.user.id}_{func.__name__}"

            # Get current timestamps from cache
            timestamps = cache.get(key, [])
            now = time.time()

            # Remove timestamps outside current interval
            timestamps = [
                ts for ts in timestamps if ts > now - interval]

            # Check if rate limit exceeded
            if len(timestamps) >= requests:
                return Response({
                    'status': 'error',
                    'error': {
                        'code': 'rate_limit_exceeded',
                        'message': f'Rate limit of {requests} requests per {interval} seconds exceeded',
                    }
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)

            # Add current timestamp and update cache
            timestamps.append(now)
            cache.set(key, timestamps, timeout=interval)

            # Execute view function
            return await func(self, request, *args, **kwargs)
        return wrapper
    return decorator


class ChatService(BaseService):
    CACHE_TIMEOUT = 3600  # 1 hour

    def __init__(self):
        self.model = GenerativeModel('gemini-2.0-flash')
        self.chat = self.model.start_chat(history=[])

    async def get_response(self, user_id: int, message: str, session_id: str = None) -> Dict[str, Any]:
        """Get AI response for user message"""
        cache_key = f"chat_response_{user_id}_{hash(message)}"
        cached_response = cache.get(cache_key)

        if cached_response:
            return cached_response

        logger.info(
            f"Processing message for user {user_id}: {message}")

        try:
            prompt = f"""You are an empathetic AI companion. Your goal is to provide supportive,
            understanding responses while maintaining appropriate boundaries. Always respond with
            compassion but avoid giving medical advice. If you sense a crisis, recommend professional help.

            User message: {message}
            """

            send_message = partial(self.chat.send_message, prompt)
            response = await sync_to_async(send_message)()

            result = {
                'reply': response.text,
                'suggestions': []  # TODO: Implement suggestions logic. Kenenna!!!!!!!!
            }

            cache.set(cache_key, result, timeout=self.CACHE_TIMEOUT)
            return result

        except Exception as e:
            logger.error(f"Chat service error: {str(e)}")
            raise
