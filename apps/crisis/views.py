from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.core.cache import cache
from drf_yasg.utils import swagger_auto_schema
from .pagination import CrisisResourcePagination
from .serializers import CrisisResourceSerializer, CrisisAlertSerializer, HotlineSerializer
from .models import CrisisResource
from .services import CrisisService
from .throttling import CrisisThrottle, HotlineThrottle
import logging

logger = logging.getLogger(__name__)

class CrisisResourceView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [CrisisThrottle]
    pagination_class = CrisisResourcePagination

    @swagger_auto_schema(responses={200: CrisisResourceSerializer(many=True)})
    def get(self, request):
        cache_key = f'crisis_resources_page_{request.query_params.get("page", 1)}_limit_{request.query_params.get("limit", 10)}'
        cached_response = cache.get(cache_key)

        if cached_response:
            return Response(cached_response)

        try:
            resources = CrisisResource.objects.all()
            paginator = self.pagination_class()
            paginated_resources = paginator.paginate_queryset(resources, request)
            serializer = CrisisResourceSerializer(paginated_resources, many=True)

            response_data = {
                'status': 'success',
                'data': serializer.data,
                'meta': {
                    'pagination': {
                        'page': paginator.page.number,
                        'limit': paginator.page_size,
                        'total': paginator.page.paginator.count,
                        'totalPages': paginator.page.paginator.num_pages,
                    }
                }
            }

            cache.set(cache_key, response_data, timeout=3600)
            return Response(response_data)

        except Exception as e:
            logger.error(f"Error fetching crisis resources: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'resource_fetch_error',
                    'message': 'Failed to fetch crisis resources',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CrisisAlertView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [CrisisThrottle]

    @swagger_auto_schema(request_body=CrisisAlertSerializer)
    def post(self, request):
        serializer = CrisisAlertSerializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            service = CrisisService()
            alert = service.create_alert(
                user=request.user,
                **serializer.validated_data
            )

            return Response({
                'status': 'success',
                'data': CrisisAlertSerializer(alert).data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating crisis alert: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'alert_creation_error',
                    'message': 'Failed to create crisis alert',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HotlineView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [HotlineThrottle]

    @swagger_auto_schema(responses={200: HotlineSerializer(many=True)})
    def get(self, request):
        cache_key = 'crisis_hotlines'
        cached_hotlines = cache.get(cache_key)

        if cached_hotlines:
            return Response({
                'status': 'success',
                'data': cached_hotlines
            })

        try:
            service = CrisisService()
            hotlines = service.get_hotlines()
            
            # Validate and serialize the hotlines
            serializer = HotlineSerializer(data=hotlines, many=True)
            serializer.is_valid(raise_exception=True)
            
            cache.set(cache_key, serializer.data, timeout=3600)

            return Response({
                'status': 'success',
                'data': serializer.data
            })
        except Exception as e:
            logger.error(f"Error fetching hotlines: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'hotline_fetch_error',
                    'message': 'Failed to fetch hotlines',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
