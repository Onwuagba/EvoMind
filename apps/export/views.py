from django.shortcuts import render
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from .services import DataExportService
import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.core.cache import cache
from drf_yasg.utils import swagger_auto_schema
from .models import ExportJob
from .serializers import ExportJobSerializer
from .pagination import ExportPagination
from .throttling import ExportRateThrottle
from .tasks import generate_journal_export, generate_insights_export

logger = logging.getLogger(__name__)

class ExportViewSet(ViewSet):
    @action(detail=False, methods=['get'])
    def journal_data(self, request):
        service = DataExportService()
        data = service.export_journal_data(request.user)
        return Response(data)

    @action(detail=False, methods=['get'])
    def full_profile(self, request):
        service = DataExportService()
        data = service.export_full_profile(request.user)
        return Response(data)

class JournalExportView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ExportRateThrottle]
    pagination_class = ExportPagination

    @swagger_auto_schema(responses={200: ExportJobSerializer()})
    def get(self, request):
        try:
            # Create export job
            export_job = ExportJob.objects.create(
                user=request.user,
                export_type='journal'
            )

            # Trigger async export task
            generate_journal_export.delay(export_job.id)

            return Response({
                'status': 'success',
                'data': ExportJobSerializer(export_job).data,
                'message': 'Export job created successfully'
            })

        except Exception as e:
            logger.error(f"Error creating journal export: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'export_creation_error',
                    'message': 'Failed to create export job',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class InsightsExportView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ExportRateThrottle]
    pagination_class = ExportPagination

    @swagger_auto_schema(responses={200: ExportJobSerializer()})
    def get(self, request):
        try:
            # Create export job
            export_job = ExportJob.objects.create(
                user=request.user,
                export_type='insights'
            )

            # Trigger async export task
            generate_insights_export.delay(export_job.id)

            return Response({
                'status': 'success',
                'data': ExportJobSerializer(export_job).data,
                'message': 'Export job created successfully'
            })

        except Exception as e:
            logger.error(f"Error creating insights export: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'export_creation_error',
                    'message': 'Failed to create export job',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
