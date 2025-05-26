from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.cache import cache
from drf_yasg.utils import swagger_auto_schema
from .serializers import UserProfileSerializer, UserSettingsSerializer, OnboardingSerializer
from .models import UserProfile, OnboardingStatus
from .throttling import UserProfileThrottle
import logging

logger = logging.getLogger(__name__)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserProfileThrottle]
    http_method_names = ['get', 'put']

    @swagger_auto_schema(responses={200: UserProfileSerializer()})
    def get(self, request):
        cache_key = f'user_profile_{request.user.id}'
        cached_profile = cache.get(cache_key)

        if cached_profile:
            return Response(cached_profile)

        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(profile)
            response_data = {
                'status': 'success',
                'data': serializer.data
            }
            
            cache.set(cache_key, response_data, timeout=3600)
            return Response(response_data)
        except Exception as e:
            logger.error(f"Error fetching user profile: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'profile_fetch_error',
                    'message': 'Failed to fetch user profile',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(request_body=UserProfileSerializer)
    def put(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(profile, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                cache.delete(f'user_profile_{request.user.id}')
                
                return Response({
                    'status': 'success',
                    'data': serializer.data
                })
                
            return Response({
                'status': 'error',
                'error': {
                    'code': 'validation_error',
                    'message': 'Invalid data provided',
                    'details': serializer.errors
                }
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error updating user profile: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'profile_update_error',
                    'message': 'Failed to update user profile',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserSettingsView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserProfileThrottle]
    http_method_names = ['get', 'put']

    @swagger_auto_schema(responses={200: UserSettingsSerializer()})
    def get(self, request):
        cache_key = f'user_settings_{request.user.id}'
        cached_settings = cache.get(cache_key)

        if cached_settings:
            return Response(cached_settings)

        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = UserSettingsSerializer(profile)
            response_data = {
                'status': 'success',
                'data': serializer.data
            }
            
            cache.set(cache_key, response_data, timeout=3600)
            return Response(response_data)
        except Exception as e:
            logger.error(f"Error fetching user settings: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'settings_fetch_error',
                    'message': 'Failed to fetch user settings',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(request_body=UserSettingsSerializer)
    def put(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = UserSettingsSerializer(profile, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                cache.delete(f'user_settings_{request.user.id}')
                
                return Response({
                    'status': 'success',
                    'data': serializer.data
                })
            
            return Response({
                'status': 'error',
                'error': {
                    'code': 'validation_error',
                    'message': 'Invalid settings data',
                    'details': serializer.errors
                }
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error updating user settings: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'settings_update_error',
                    'message': 'Failed to update user settings',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OnboardingView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserProfileThrottle]
    http_method_names = ['post', 'get']

    @swagger_auto_schema(request_body=OnboardingSerializer)
    def post(self, request):
        try:
            onboarding, _ = OnboardingStatus.objects.get_or_create(
                user=request.user,
                defaults={'completed': False}
            )
            
            serializer = OnboardingSerializer(onboarding, data=request.data, partial=True)
            
            if serializer.is_valid():
                # If all steps are completed, update completed_at
                if request.data.get('completed', False):
                    from django.utils import timezone
                    serializer.validated_data['completed_at'] = timezone.now()
                
                onboarding = serializer.save()
                
                return Response({
                    'status': 'success',
                    'data': OnboardingSerializer(onboarding).data
                })
            
            return Response({
                'status': 'error',
                'error': {
                    'code': 'validation_error',
                    'message': 'Invalid onboarding data',
                    'details': serializer.errors
                }
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error updating onboarding status: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'onboarding_update_error',
                    'message': 'Failed to update onboarding status',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(responses={200: OnboardingSerializer()})
    def get(self, request):
        try:
            onboarding = OnboardingStatus.objects.get(user=request.user)
            return Response({
                'status': 'success',
                'data': OnboardingSerializer(onboarding).data
            })
        except OnboardingStatus.DoesNotExist:
            return Response({
                'status': 'success',
                'data': {'completed': False, 'steps_completed': {}, 'last_step': ''}
            })
        except Exception as e:
            logger.error(f"Error fetching onboarding status: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'onboarding_fetch_error',
                    'message': 'Failed to fetch onboarding status',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)