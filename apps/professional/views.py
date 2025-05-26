from rest_framework import status
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.core.cache import cache
from drf_yasg.utils import swagger_auto_schema
from .models import Therapist, Booking
from .serializers import (
    TherapistListSerializer,
    TherapistDetailSerializer,
    BookingSerializer
)
from .pagination import StandardResultsSetPagination
from .throttling import TherapistRateThrottle
import logging

logger = logging.getLogger(__name__)

class TherapistViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    throttle_classes = [TherapistRateThrottle]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Therapist.objects.none()
            
        queryset = Therapist.objects.filter(is_available=True)
        specialization = self.request.query_params.get('specialization')
        if specialization:
            queryset = queryset.filter(specializations__contains=[specialization])
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TherapistDetailSerializer
        return TherapistListSerializer

    def list(self, request, *args, **kwargs):
        cache_key = f'therapists_list_page_{request.query_params.get("page", 1)}'
        cached_response = cache.get(cache_key)

        if cached_response:
            return Response(cached_response)

        response = super().list(request, *args, **kwargs)
        response_data = {
            'status': 'success',
            'data': response.data['results'],
            'meta': {
                'pagination': {
                    'page': response.data['current_page'],
                    'limit': self.pagination_class.page_size,
                    'total': response.data['count'],
                    'totalPages': response.data['total_pages'],
                }
            }
        }
        
        cache.set(cache_key, response_data, timeout=300)  # Cache for 5 minutes
        return Response(response_data)

    @swagger_auto_schema(
        operation_description="Get therapist availability for a specific date range",
        responses={200: "Available time slots"}
    )
    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        try:
            therapist = self.get_object()
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')

            if not start_date or not end_date:
                return Response({
                    'status': 'error',
                    'error': {
                        'code': 'invalid_dates',
                        'message': 'Both start_date and end_date are required'
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

            availability = self._get_availability(therapist, start_date, end_date)
            return Response({
                'status': 'success',
                'data': availability
            })

        except Exception as e:
            logger.error(f"Error fetching therapist availability: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'availability_fetch_error',
                    'message': 'Failed to fetch availability',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BookingView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [TherapistRateThrottle]

    @swagger_auto_schema(request_body=BookingSerializer)
    def post(self, request):
        try:
            serializer = BookingSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user)
                return Response({
                    'status': 'success',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)

            return Response({
                'status': 'error',
                'error': {
                    'code': 'validation_error',
                    'message': 'Invalid booking data',
                    'details': serializer.errors
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Error creating booking: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'booking_creation_error',
                    'message': 'Failed to create booking',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)