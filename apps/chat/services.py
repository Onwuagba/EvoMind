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
    HISTORY_TIMEOUT = 86400  # 24 hours

    def __init__(self):
        self.model = GenerativeModel('gemini-2.0-flash')
        self.chat = self.model.start_chat(history=[])

    async def get_response(self, user_id: int, message: str, session_id: str = None) -> Dict[str, Any]:
        """Get AI response for user message with context and crisis detection"""
        # Get conversation history from cache
        history_key = f"chat_history_{user_id}"
        conversation_history = cache.get(history_key, [])

        # Crisis keywords that might indicate need for human intervention
        crisis_keywords = [
            "suicide", "kill myself", "want to die", "end it all",
            "self harm", "hurt myself", "give up", "no hope",
            "severe depression", "panic attack"
        ]

        try:
            # Check for crisis indicators
            message_lower = message.lower()
            needs_human = any(
                keyword in message_lower for keyword in crisis_keywords)

            # If crisis detected, return predefined response without calling Gemini
            if needs_human:
                response_text = (
                    "I hear that you're struggling, and I want you to know that you're not alone. "
                    "However, I think this is a situation where speaking with a mental health "
                    "professional would be most helpful. They are better equipped to provide the "
                    "support you need right now. Would you like information about crisis support services?"
                )
                suggestions = [
                    "Consider speaking with a mental health professional.",
                    "Would you like information about crisis helplines?",
                    "Your well-being matters. Professional support is available 24/7."
                ]
            else:
                # Regular conversation flow
                system_prompt = """You are an empathetic AI companion named Soul Pattern. 
                Your responses should be:
                1. Supportive and understanding
                2. Focused on emotional well-being
                3. Never provide medical advice
                4. Maintain conversation context
                5. If detecting serious emotional distress, suggest professional help

                Previous conversation:
                {history}

                Current user message: {message}
                """

                history_text = "\n".join([
                    f"User: {msg['user']}\nAI: {msg['ai']}"
                    # Keep last 5 exchanges for context
                    for msg in conversation_history[-5:]
                ])

                prompt = system_prompt.format(
                    history=history_text,
                    message=message
                )

                send_message = partial(self.chat.send_message, prompt)
                response = await sync_to_async(send_message)()
                response_text = response.text
                suggestions = []

            result = {
                'reply': response_text,
                'suggestions': suggestions,
                'needs_human_support': needs_human
            }

            # Update conversation history
            conversation_history.append({
                'user': message,
                'ai': response_text,
                'timestamp': time.time()
            })
            cache.set(
                history_key, conversation_history[-10:], timeout=self.HISTORY_TIMEOUT)

            return result

        except Exception as e:
            logger.error(f"Chat service error: {str(e)}")
            raise
