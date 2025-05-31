import asyncio
import logging
from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from asgiref.sync import sync_to_async, async_to_sync
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer
from .services import ChatService, rate_limit

logger = logging.getLogger(__name__)


class ChatViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatSessionSerializer

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)

    @swagger_auto_schema(
        operation_description="Chat with AI companion",
        operation_summary="Send message to AI companion",
        tags=['AI Chat'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['message'],
            properties={
                'message': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Message to send to AI companion'
                )
            }
        ),
        responses={
            200: openapi.Response(
                description="Chat response",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'status': openapi.Schema(type=openapi.TYPE_STRING),
                        'data': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'message': openapi.Schema(
                                    type=openapi.TYPE_OBJECT,
                                    properties={
                                        'content': openapi.Schema(type=openapi.TYPE_STRING),
                                        'response': openapi.Schema(type=openapi.TYPE_STRING),
                                    }
                                ),
                                'suggestions': openapi.Schema(
                                    type=openapi.TYPE_ARRAY,
                                    items=openapi.Schema(
                                        type=openapi.TYPE_STRING)
                                )
                            }
                        )
                    }
                )
            ),
            400: 'Bad Request',
            500: 'Internal Server Error'
        }
    )
    @method_decorator(csrf_exempt)
    @action(detail=False, methods=['post'])
    def send_message(self, request, *args, **kwargs):
        """Synchronous wrapper for async chat handler"""
        return async_to_sync(self._send_message_async)(request, *args, **kwargs)

    async def _send_message_async(self, request, *args, **kwargs):
        """Actual async implementation of send_message"""
        try:
            # Create new session for each message for now
            session = await ChatSession.objects.acreate(
                user=request.user,
                title="New Chat"
            )

            # Extract message from request data
            message = request.data.get('message')
            if not message:
                return Response({
                    'status': 'error',
                    'error': {
                        'code': 'validation_error',
                        'message': 'Message is required'
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get AI response
            service = ChatService()
            response = await service.get_response(
                user_id=request.user.id,
                message=message
            )

            # Save message and response
            chat_message = await ChatMessage.objects.acreate(
                session=session,
                user=request.user,
                content=message,
                response=response['reply']
            )

            # Update session
            session.last_message = response['reply']
            await session.asave()

            return Response({
                'status': 'success',
                'data': {
                    'message': {
                        'content': chat_message.content,
                        'response': chat_message.response,
                    },
                    'suggestions': response['suggestions']
                }
            })

        except Exception as e:
            logger.error(f"Chat error: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'chat_error',
                    'message': 'Failed to process message',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
