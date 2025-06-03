from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.cache import cache
from drf_yasg.utils import swagger_auto_schema
from apps.journal.models import DailyMood, Journal
from apps.analysis.models import JournalAnalysis
from .serializers import UserProfileSerializer, UserSettingsSerializer, OnboardingSerializer, ExerciseSerializer, SelfCareRoutineSerializer
from .models import RoutineExercise, UserProfile, OnboardingStatus, Exercise, SelfCareRoutine
from .throttling import UserProfileThrottle
import logging
from django.utils import timezone
from datetime import timedelta
from apps.analysis.services import AIAnalysisService, GeminiService
from asgiref.sync import sync_to_async
from django.db.models import Avg, Count
from django.db.models.functions import ExtractHour, TruncHour, ExtractWeekDay
from django.db.models import Q
from collections import defaultdict

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
            serializer = UserProfileSerializer(
                profile, data=request.data, partial=True)

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
                cache.set(
                    f'user_profile_{request.user.id}', response_data, timeout=3600)
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
            serializer = UserSettingsSerializer(
                profile, data=request.data, partial=True)

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

            serializer = OnboardingSerializer(
                onboarding, data=request.data, partial=True)

            if serializer.is_valid():
                # If all steps are completed, update completed_at
                if request.data.get('completed', False):
                    serializer.validated_data['completed_at'] = timezone.now(
                    )

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
            logger.error(
                f"Error updating onboarding status: {str(e)}")
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
            onboarding = OnboardingStatus.objects.get(
                user=request.user)
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
            logger.error(
                f"Error fetching onboarding status: {str(e)}")
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
        achieved_days = sorted(
            [days for days in self.STREAK_ACHIEVEMENTS.keys() if days <=
             streak_days],
            reverse=True
        )

        if achieved_days and achieved_days[0] == streak_days:
            achievement = self.STREAK_ACHIEVEMENTS[achieved_days[0]]
            return achievement['title'], achievement['description']
        return None, None

    def get_streak_count(self, user):
        """Calculate journaling streak"""
        from django.db.models.functions import TruncDate

        today = timezone.now().date()
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

        return consecutive_days

    def get_emotional_state(self, user):
        """Analyze user's emotional state based on recent activity"""
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)

        recent_moods = DailyMood.objects.filter(
            user=user,
            date__range=[week_ago, today]
        ).values_list('mood', flat=True)

        recent_journals = Journal.objects.filter(
            user=user,
            created_at__date__range=[week_ago, today]
        ).values_list('content', flat=True)

        return {
            'mood_trend': list(recent_moods),
            'journal_excerpts': list(recent_journals)
        }

    def get_daily_quote(self, user, mood_data, journal_entries):
        """Get AI-generated quote based on previous day's context"""
        # Check if user joined today
        if user.date_joined.date() == timezone.now().date():
            return {
                'quote': "Every journey of self-discovery begins with a single reflection. Welcome to your personal space for growth and mindfulness.",
                'author': "EvoMind",
                'context': "Today marks the beginning of your mindfulness journey. Take a moment to check in with yourself and record your first mood."
            }

        yesterday = timezone.now().date() - timedelta(days=1)
        cache_key = f'daily_quote_{user.id}_{yesterday.strftime("%Y-%m-%d")}'
        cached_quote = cache.get(cache_key)

        if cached_quote:
            return cached_quote

        try:
            yesterday_mood = DailyMood.objects.filter(
                user=user,
                date=yesterday
            ).first()

            yesterday_journal = journal_entries.filter(
                date=yesterday
            ).exists()

            context = {
                'user_name': user.first_name,
                'previous_mood': yesterday_mood.mood if yesterday_mood else None,
                'journaled_yesterday': yesterday_journal,
                'streak_days': self.get_streak_count(user),
                'emotional_state': self.get_emotional_state(user)
            }

            service = GeminiService()
            import asyncio
            quote_data = asyncio.run(
                service.generate_daily_quote(context))

            if quote_data:
                cache.set(cache_key, quote_data, timeout=86400)

            return quote_data

        except Exception as e:
            logger.error(f"Error generating daily quote: {str(e)}")
            return None

    def get(self, request):
        try:
            today = timezone.now().date()
            user = request.user

            # Get today's mood check-in if exists
            try:
                today_mood = DailyMood.objects.get(
                    user=user, date=today)
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

            consecutive_days = self.get_streak_count(user)
            achievement_title, achievement_description = self.get_achievement(
                consecutive_days)

            # Get daily quote
            daily_quote = self.get_daily_quote(
                user, today_mood_value, journal_entries)

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
                    },
                    'dailyQuote': {
                        'text': daily_quote.get('quote') if daily_quote else None,
                        'author': daily_quote.get('author') if daily_quote else None,
                        'context': daily_quote.get('context') if daily_quote else None
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


class ExerciseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing exercises
    """
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Exercise.objects.none()

        queryset = Exercise.objects.all()
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        return queryset

    @swagger_auto_schema(
        operation_description="Mark an exercise as completed",
        responses={
            200: "Success",
            404: "Exercise not found"
        }
    )
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        exercise = self.get_object()
        # Track completion logic here
        return Response({'status': 'success'})


class SelfCareRoutineViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing self-care routines
    """
    serializer_class = SelfCareRoutineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return SelfCareRoutine.objects.none()
        return SelfCareRoutine.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @swagger_auto_schema(
        operation_description="Generate a personalized self-care routine",
        responses={
            200: SelfCareRoutineSerializer(),
            400: "Bad Request",
            500: "Internal Server Error"
        }
    )
    @action(detail=False, methods=['post'])
    async def generate(self, request):
        """Generate personalized routine based on journal analysis"""
        try:
            service = AIAnalysisService()
            analysis = await service.analyze_trauma_pattern(
                request.user,
                {'description': request.data.get('context', '')}
            )

            routine = await sync_to_async(SelfCareRoutine.objects.create)(
                user=request.user,
                title="Your Personalized Healing Journey",
                description="A custom routine based on your needs",
                frequency="daily"
            )

            # Add exercises based on analysis
            recommended_exercises = await sync_to_async(Exercise.objects.filter)(
                category__in=self._get_recommended_categories(
                    analysis)
            )
            recommended_exercises = await sync_to_async(list)(recommended_exercises)

            for i, exercise in enumerate(recommended_exercises):
                await sync_to_async(RoutineExercise.objects.create)(
                    routine=routine,
                    exercise=exercise,
                    order=i
                )

            serializer = self.get_serializer(routine)
            return Response({
                'status': 'success',
                'data': serializer.data
            })
        except Exception as e:
            logger.error(f"Error generating routine: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'routine_generation_error',
                    'message': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_recommended_categories(self, analysis):
        """Get recommended exercise categories based on analysis"""
        categories = []
        if analysis.get('anxiety_level', 0) > 0.6:
            categories.extend(['breathing', 'meditation'])
        if analysis.get('reflection_needed', False):
            categories.append('reflection')
        if analysis.get('grounding_needed', False):
            categories.append('grounding')
        if not categories:
            categories = ['journaling']  # default category
        return categories


class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get_date_range(self, period):
        today = timezone.now().date()
        if period == 'week':
            start_date = today - timedelta(days=7)
        else:  # month
            start_date = today - timedelta(days=30)
        return start_date, today

    def get_mood_stats(self, user, start_date, end_date):
        moods = DailyMood.objects.filter(
            user=user,
            date__range=[start_date, end_date]
        )
        avg_mood = moods.aggregate(Avg('mood'))['mood__avg'] or 0
        return round(avg_mood, 1)

    def get_writing_times(self, user, start_date, end_date):
        entries = Journal.objects.filter(
            user=user,
            created_at__date__range=[start_date, end_date]
        ).annotate(
            hour=ExtractHour('created_at')
        )

        time_periods = {
            'morning': Q(hour__gte=5) & Q(hour__lt=12),
            'afternoon': Q(hour__gte=12) & Q(hour__lt=17),
            'evening': Q(hour__gte=17) & Q(hour__lt=22),
            'night': Q(hour__gte=22) | Q(hour__lt=5)
        }

        writing_times = {}
        for period, query in time_periods.items():
            count = entries.filter(query).count()
            writing_times[period] = count

        return writing_times

    def get_emotional_words(self, user, start_date, end_date):
        # Get analyses from the period
        analyses = JournalAnalysis.objects.filter(
            user=user,
            journal__created_at__date__range=[start_date, end_date]
        )

        word_frequency = defaultdict(int)
        for analysis in analyses:
            for emotion in analysis.emotional_patterns:
                word_frequency[emotion.lower()] += 1

        return dict(sorted(word_frequency.items(), key=lambda x: x[1], reverse=True)[:6])

    def get_timeline_data(self, user, start_date, end_date):
        """Get timeline data with proper weekday handling"""
        moods = DailyMood.objects.filter(
            user=user,
            date__range=[start_date, end_date]
        )

        if end_date - start_date > timedelta(days=7):
            # Monthly view: average by weekday
            weekday_averages = (
                moods
                .annotate(weekday=ExtractWeekDay('date'))
                .values('weekday')
                .annotate(avg_mood=Avg('mood'))
                .order_by('weekday')
            )

            # Create a mapping of weekday numbers to averages
            weekday_map = {
                item['weekday']: item['avg_mood'] or 0 for item in weekday_averages}
            weekdays = ['Mon', 'Tue', 'Wed',
                        'Thu', 'Fri', 'Sat', 'Sun']
            timeline = [
                {
                    'date': day,
                    'mood': weekday_map.get(i + 1, 0)
                }
                for i, day in enumerate(weekdays)
            ]
        else:
            # Weekly view: show last 7 days of data
            timeline = []
            # Start 6 days before end date
            current = end_date - timedelta(days=6)

            while current <= end_date:
                mood = moods.filter(date=current).first()
                timeline.append({
                    'date': current.strftime('%a'),
                    'mood': mood.mood if mood else 0
                })
                current += timedelta(days=1)

        return timeline

    def get_insights(self, user, start_date, end_date):
        # Get previous period for comparison
        period_length = (end_date - start_date).days
        prev_start = start_date - timedelta(days=period_length)
        prev_end = start_date - timedelta(days=1)

        current_mood_avg = self.get_mood_stats(
            user, start_date, end_date)
        prev_mood_avg = self.get_mood_stats(
            user, prev_start, prev_end)

        writing_times = self.get_writing_times(
            user, start_date, end_date)
        best_time = max(writing_times.items(), key=lambda x: x[1])[0]

        mood_change = ((current_mood_avg - prev_mood_avg) /
                       prev_mood_avg * 100) if prev_mood_avg else 0

        return {
            'pattern_detected': f"You tend to feel most positive in the {best_time}s, particularly after journaling.",
            'growth_area': f"Your mood {'improved' if mood_change > 0 else 'decreased'} by {abs(round(mood_change))}% compared to last {'week' if period_length == 7 else 'month'}!",
            'suggestion': f"Consider continuing your {best_time} writing routine for optimal wellbeing."
        }

    def get(self, request):
        try:
            period = request.query_params.get('period', 'week')
            start_date, end_date = self.get_date_range(period)
            user = request.user

            response_data = {
                'average_mood': self.get_mood_stats(user, start_date, end_date),
                'streak': user.get_streak_count(),
                'timeline': self.get_timeline_data(user, start_date, end_date),
                'writing_times': self.get_writing_times(user, start_date, end_date),
                'emotional_words': self.get_emotional_words(user, start_date, end_date),
                'insights': self.get_insights(user, start_date, end_date)
            }

            return Response({
                'status': 'success',
                'data': response_data
            })

        except Exception as e:
            logger.error(f"Error generating analytics: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'analytics_error',
                    'message': 'Failed to generate analytics',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
