from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.cache import cache
from django.core.cache.backends.base import DEFAULT_TIMEOUT
from django.conf import settings
from datetime import timedelta, date
from apps.journal.models import Journal
from apps.journal.serializers import JournalSerializer 
from .pagination import JournalPagination
from .throttling import JournalRateThrottle
from .models import DailyMood
from .serializers import DailyMoodSerializer

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

class JournalViewSet(viewsets.ModelViewSet):
    serializer_class = JournalSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = JournalPagination
    throttle_classes = [JournalRateThrottle]

    def get_queryset(self):
        # Check if this is a schema generation request
        if getattr(self, 'swagger_fake_view', False):
            return Journal.objects.none()
        
        return Journal.objects.filter(
            user=self.request.user,
            is_deleted=False
        )

    def get_cache_key(self, pk=None):
        if pk:
            return f"journal_{self.request.user.id}_{pk}"
        return f"journal_list_{self.request.user.id}"

    def list(self, request, *args, **kwargs):
        cache_key = self.get_cache_key()
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data)

        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)

        response_data = {
            'status': 'success',
            'data': serializer.data,
            'meta': {
                'pagination': {
                    'page': self.paginator.page.number,
                    'limit': self.paginator.page_size,
                    'total': self.paginator.page.paginator.count,
                    'totalPages': self.paginator.page.paginator.num_pages,
                }
            }
        }

        cache.set(cache_key, response_data, CACHE_TTL)
        return Response(response_data)

    def create(self, request, *args, **kwargs):
        request.data['user'] = request.user.id
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response({
                'status': 'success',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': {
                    'code': 'validation_error',
                    'message': str(e.args[0]),
                    'details': serializer.errors
                }
            }, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        cache_key = self.get_cache_key(kwargs['pk'])
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data)

        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            response_data = {
                'status': 'success',
                'data': serializer.data
            }
            cache.set(cache_key, response_data, CACHE_TTL)
            return Response(response_data)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': {
                    'code': 'not_found',
                    'message': str(e)
                }
            }, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.is_deleted = True
            instance.save()
            cache.delete(self.get_cache_key(kwargs['pk']))
            cache.delete(self.get_cache_key())
            return Response({
                'status': 'success',
                'data': None
            }, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': {
                    'code': 'deletion_error',
                    'message': str(e)
                }
            }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            # Add user ID to request data
            request.data['user'] = request.user.id
            serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            # Clear the cache
            cache.delete(self.get_cache_key(kwargs['pk']))
            cache.delete(self.get_cache_key())

            return Response({
                'status': 'success',
                'data': serializer.data
            })

        except Exception as e:
            if hasattr(self, 'serializer'):
                return Response({
                    'status': 'error',
                    'error': {
                        'code': 'journal_update_error',
                        'message': str(e),
                        'details': self.serializer.errors if hasattr(self.serializer, 'errors') else None
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    'status': 'error',
                    'error': {
                        'code': 'journal_update_error',
                        'message': str(e)
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def history(self, request):
        queryset = self.get_queryset().order_by('-created_at')
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data,
            'meta': {
                'pagination': {
                    'page': self.paginator.page.number,
                    'limit': self.paginator.page_size,
                    'total': self.paginator.page.paginator.count,
                    'totalPages': self.paginator.page.paginator.num_pages,
                }
            }
        })

class SaveMoodView(generics.CreateAPIView):
    serializer_class = DailyMoodSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        obj, created = DailyMood.objects.update_or_create(
            user=self.request.user,
            date=date.today(),
            defaults={'mood': self.request.data.get('mood')}
        )
        return obj

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = self.perform_create(serializer)
        # Return the created/updated mood using the serializer
        mood_instance = DailyMood.objects.get(user=request.user, date=date.today())
        data = DailyMoodSerializer(mood_instance).data
        return Response({
            'status': 'success',
            'data': data
        }, status=status.HTTP_201_CREATED)

class WeeklyMoodView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = date.today()
        week_ago = today - timedelta(days=6)
        moods = DailyMood.objects.filter(user=request.user, date__range=[week_ago, today]).order_by('date')
        serializer = DailyMoodSerializer(moods, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data,
            'meta': {
                'range': {
                    'from': str(week_ago),
                    'to': str(today),
                    'count': moods.count()
                }
            }
        })
