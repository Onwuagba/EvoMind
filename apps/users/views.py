from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.cache import cache
from drf_yasg.utils import swagger_auto_schema
from apps.journal.models import DailyMood, Journal
from .serializers import UserProfileSerializer, UserSettingsSerializer, OnboardingSerializer
from .models import UserProfile, OnboardingStatus
from .throttling import UserProfileThrottle
import logging
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserProfileThrottle]
    http_method_names = ['get', 'put', 'post']

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

    @swagger_auto_schema(request_body=UserProfileSerializer)
    def post(self, request):
        """Create a new user profile"""
        try:
            # Check if profile already exists
            if UserProfile.objects.filter(user=request.user).exists():
                return Response({
                    'status': 'error',
                    'error': {
                        'code': 'profile_exists',
                        'message': 'User profile already exists',
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create new profile
            serializer = UserProfileSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user)
                
                response_data = {
                    'status': 'success',
                    'data': serializer.data
                }
                
                # Cache the new profile
                cache.set(f'user_profile_{request.user.id}', response_data, timeout=3600)
                return Response(response_data, status=status.HTTP_201_CREATED)
            
            return Response({
                'status': 'error',
                'error': {
                    'code': 'validation_error',
                    'message': 'Invalid profile data',
                    'details': serializer.errors
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Error creating user profile: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'profile_creation_error',
                    'message': 'Failed to create user profile',
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


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']

    # Add this achievement dictionary as a class variable
    STREAK_ACHIEVEMENTS = {
        1: {
            'title': 'Great Job!',
            'description': 'Your first day of journaling'
        },
        2: {
            'title': 'Keep going!',
            'description': 'Day-2 of journaling'
        },
        3: {
            'title': 'Keep it going!',
            'description': '3 days of consistent journaling'
        },
        7: {
            'title': 'Week Warrior!',
            'description': '7 days of consistent journaling'
        },
        14: {
            'title': 'Two Week Triumph!',
            'description': '14 days of dedicated self-reflection'
        },
        21: {
            'title': 'Habit Builder!',
            'description': '21 days of making journaling a habit'
        },
        30: {
            'title': 'Monthly Master!',
            'description': 'A full month of consistent journaling'
        },
        60: {
            'title': 'Journaling Journey!',
            'description': '60 days of incredible dedication'
        },
        90: {
            'title': 'Quarterly Champion!',
            'description': '90 days of remarkable consistency'
        },
        180: {
            'title': 'Half Year Hero!',
            'description': '180 days of amazing commitment'
        },
        365: {
            'title': 'Year of Growth!',
            'description': 'A full year of self-discovery'
        }
    }

    def get_achievement(self, streak_days):
        # Find the highest achieved streak milestone
        achieved_days = sorted(
            [days for days in self.STREAK_ACHIEVEMENTS.keys() if days <= streak_days],
            reverse=True
        )
        
        if achieved_days and achieved_days[0] == streak_days:
            achievement = self.STREAK_ACHIEVEMENTS[achieved_days[0]]
            return achievement['title'], achievement['description']
        return None, None

    def get(self, request):
        try:
            # Get today's date
            today = timezone.now().date()
            user = request.user

            # Get today's mood check-in if exists
            try:
                today_mood = DailyMood.objects.get(
                    user=user,
                    date=today
                )
                today_mood_value = today_mood.mood
            except DailyMood.DoesNotExist:
                today_mood_value = None

            # Get weekly mood trend (last 7 days)
            week_ago = today - timedelta(days=6)
            weekly_moods = DailyMood.objects.filter(
                user=user,
                date__range=[week_ago, today]
            ).order_by('date')

            weekly_trend = []
            for single_date in (week_ago + timedelta(n) for n in range(7)):
                mood = weekly_moods.filter(date=single_date).first()
                weekly_trend.append({
                    'day': single_date.strftime('%a'),
                    'mood': mood.mood if mood else None
                })

            # Get journaling streak
            from django.db.models import Count
            from django.db.models.functions import TruncDate

            journal_entries = Journal.objects.filter(
                user=user
            ).annotate(
                date=TruncDate('created_at')
            ).values('date').distinct()

            consecutive_days = 0
            check_date = today
            while journal_entries.filter(date=check_date).exists():
                consecutive_days += 1
                check_date = check_date - timedelta(days=1)

            achievement_title, achievement_description = self.get_achievement(consecutive_days)
            response_data = {
                'status': 'success',
                'data': {
                    'user': {
                        'firstName': user.first_name,
                        'onboardingComplete': getattr(user, 'onboarding_complete', False)
                    },
                    'todayMood': today_mood_value,
                    'streak': {
                        'count': consecutive_days,
                        'achievement': achievement_title,
                        'description': achievement_description,
                        'nextMilestone': next(
                            (days for days in sorted(self.STREAK_ACHIEVEMENTS.keys()) 
                             if days > consecutive_days),
                            None
                        )
                    },
                    'weeklyTrend': weekly_trend,
                    'stats': {
                        'journalCount': journal_entries.count(),
                        'moodCheckIns': DailyMood.objects.filter(user=user).count()
                    }
                }
            }

            return Response(response_data)

        except Exception as e:
            logger.error(f"Error fetching dashboard data: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'dashboard_fetch_error',
                    'message': 'Failed to fetch dashboard data',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)