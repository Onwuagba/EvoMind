import asyncio
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.core.exceptions import ObjectDoesNotExist
from asgiref.sync import sync_to_async
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from apps.journal.models import Journal
from .models import JournalAnalysis
from .serializers import (
    JournalAnalysisRequestSerializer,
    JournalAnalysisResponseSerializer,
    TraumaEventSerializer
)
from .services import AIAnalysisService, GeminiService
from .throttling import AIAnalysisThrottle


class AnalysisViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def analyze_journal(self, request):
        service = AIAnalysisService()
        result = service.analyze_journal_entry(
            request.data['content'])
        return Response(result)


class JournalAnalysisView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [AIAnalysisThrottle]
    http_method_names = ['post', 'get']

    @swagger_auto_schema(
        request_body=JournalAnalysisRequestSerializer,
        responses={200: JournalAnalysisResponseSerializer}
    )
    def post(self, request):
        """
        Analyze journal content and return emotional patterns, triggers, and suggestions.

        This endpoint accepts a JSON payload containing the journal content, 
        analyzes it using an AI service, and returns a response with the analysis results.

        Args:
            request (Request): Django request object with a JSON body containing 'content'.

        Returns:
            Response: A Django response object with JSON data containing the analysis 
                    results on success, or an error message on failure.

        Raises:
            ValidationError: If the request data is invalid.
            Exception: If there is an unexpected error during analysis.
        """
        serializer = JournalAnalysisRequestSerializer(
            data=request.data)

        if not serializer.is_valid():
            return Response({
                'status': 'error',
                'error': {
                    'code': 'validation_error',
                    'message': 'Invalid data',
                    'details': serializer.errors
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # service = AIAnalysisService()
            service = GeminiService()
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                analysis = loop.run_until_complete(
                    service.analyze_journal(
                        request.user,
                        serializer.validated_data['content']
                    )
                )
            finally:
                loop.close()

            return Response({
                'status': 'success',
                'data': analysis
            })

        except Exception as e:
            return Response({
                'status': 'error',
                'error': {
                    'code': 'analysis_error',
                    'message': 'Failed to analyze journal entry',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'journal_id',
                openapi.IN_PATH,
                description="ID of the journal entry to analyze",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
        ],
        responses={
            200: JournalAnalysisResponseSerializer,
            404: openapi.Response(
                description="Journal entry not found",
                examples={
                    "application/json": {
                        "status": "error",
                        "error": {"message": "Journal entry not found"}
                    }
                }
            ),
            500: openapi.Response(
                description="Analysis error",
                examples={
                    "application/json": {
                        "status": "error",
                        "error": {
                            "code": "analysis_error",
                            "message": "Failed to analyze journal entry"
                        }
                    }
                }
            )
        },
        operation_description="Get analysis for a specific journal entry. Returns cached analysis if available, otherwise performs new analysis."
    )
    def get(self, request, journal_id=None):
        """Get analysis for a specific journal entry"""
        try:
            analysis = JournalAnalysis.objects.filter(
                journal_id=journal_id,
                user=request.user
            ).first()

            if analysis:
                serializer = JournalAnalysisResponseSerializer(analysis)
                return Response({
                    'status': 'success',
                    'data': serializer.data
                })

            # Get journal entry
            try:
                journal = Journal.objects.get(
                    id=journal_id,
                    user=request.user
                )
            except ObjectDoesNotExist:
                return Response({
                    'status': 'error',
                    'error': {'message': 'Journal entry not found'}
                }, status=status.HTTP_404_NOT_FOUND)

            # Run new analysis
            service = GeminiService()
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                analysis = loop.run_until_complete(
                    service.analyze_journal(
                        request.user,
                        journal,
                    )
                )
            finally:
                loop.close()

            return Response({
                'status': 'success',
                'data': analysis
            })

        except Exception as e:
            return Response({
                'status': 'error',
                'error': {
                    'code': 'analysis_error',
                    'message': 'Failed to analyze journal entry',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TraumaPatternView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [AIAnalysisThrottle]
    http_method_names = ['post']

    @swagger_auto_schema(
        request_body=TraumaEventSerializer,
        responses={200: JournalAnalysisResponseSerializer}
    )
    def post(self, request):
        """
        Analyze trauma pattern and return emotional patterns, risk level, and suggestions.

        Args:
            request (Request): Django request object.

        Returns:
            Response: A Django response object with JSON data.

        Raises:
            ValidationError: If the request data is invalid.
            Exception: If there is an unexpected error.
        """
        serializer = TraumaEventSerializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
            service = AIAnalysisService()

            analysis = asyncio.run(
                service.analyze_trauma_pattern(
                    request.user,
                    serializer.validated_data
                )
            )

            return Response({
                'status': 'success',
                'data': analysis
            })

        except ValidationError as e:
            return Response({
                'status': 'error',
                'error': {
                    'code': 'validation_error',
                    'message': 'Invalid data provided',
                    'details': serializer.errors if hasattr(serializer, 'errors') else str(e)
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'status': 'error',
                'error': {
                    'code': 'analysis_error',
                    'message': 'Failed to analyze trauma pattern',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
