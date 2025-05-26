from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.cache import cache
from drf_yasg.utils import swagger_auto_schema

from apps.journal.models import Journal
from .models import UserMilestone, ProgressOverview
from .serializers import (
    MilestoneSerializer,
    ProgressOverviewSerializer,
    ProgressUpdateSerializer,
    ProgressUpdateRequestSerializer
)
from .pagination import MilestonePagination
from .throttling import ProgressThrottle
import logging

logger = logging.getLogger(__name__)

class ProgressOverviewView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ProgressThrottle]

    @swagger_auto_schema(responses={200: ProgressOverviewSerializer()})
    def get(self, request):
        cache_key = f'progress_overview_{request.user.id}'
        cached_overview = cache.get(cache_key)

        if cached_overview:
            return Response(cached_overview)

        try:
            overview, _ = ProgressOverview.objects.get_or_create(user=request.user)
            serializer = ProgressOverviewSerializer(overview)
            
            response_data = {
                'status': 'success',
                'data': serializer.data
            }
            
            cache.set(cache_key, response_data, timeout=300)  # Cache for 5 minutes
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Error fetching progress overview: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'overview_fetch_error',
                    'message': 'Failed to fetch progress overview',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MilestoneView(APIView):
    """
    Retrieve user milestones.
    
    Milestones are automatically created through the progress update system
    and cannot be manually created through this endpoint.
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [ProgressThrottle]
    pagination_class = MilestonePagination

    @swagger_auto_schema(
        operation_description="""
        Retrieve user milestones history.
        Milestones are automatically awarded based on user progress and activities.
        """,
        responses={200: MilestoneSerializer(many=True)}
    )
    def get(self, request):
        try:
            milestones = UserMilestone.objects.filter(user=request.user)
            paginator = self.pagination_class()
            paginated_milestones = paginator.paginate_queryset(milestones, request)
            serializer = MilestoneSerializer(paginated_milestones, many=True)

            return Response({
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
            })

        except Exception as e:
            logger.error(f"Error fetching milestones: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'milestone_fetch_error',
                    'message': 'Failed to fetch milestones',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProgressUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ProgressThrottle]

    @swagger_auto_schema(
        request_body=ProgressUpdateRequestSerializer,
        responses={200: ProgressOverviewSerializer()}
    )
    def post(self, request):
        """
        Update user progress

        This endpoint is used to update a user's progress. The request body should contain
        the type of progress and the value to be updated.

        The supported progress types are:

        - `journal_entry`: Increment the total number of journal entries and update the
          current and longest streaks accordingly
        - `milestone_achieved`: Increment the number of milestones achieved and create a new
          milestone record

        The request body should contain the following:

        - `progress_type` (string): The type of progress, see above
        - `value` (int): The value to be updated, defaults to 1
        - `metadata` (dict): Additional metadata for the progress update, see above

        Returns the updated progress overview
        """
        try:
            serializer = ProgressUpdateRequestSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    'status': 'error',
                    'error': {
                        'code': 'validation_error',
                        'message': 'Invalid progress update data',
                        'details': serializer.errors
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get or create progress overview
            overview, _ = ProgressOverview.objects.get_or_create(user=request.user)
            progress_type = serializer.validated_data['progress_type']
            value = serializer.validated_data.get('value', 1)
            metadata = serializer.validated_data.get('metadata', {})

            # Update progress based on type
            if progress_type == 'journal_entry':
                overview.total_journal_entries += 1
                current_streak = self._calculate_streak(request.user)
                overview.current_streak = current_streak
                overview.longest_streak = max(overview.longest_streak, current_streak)
                
                # Check if streak milestone reached
                milestone_data = self._generate_milestone_description('journal_entry', value, current_streak)
                if milestone_data:
                    UserMilestone.objects.create(
                        user=request.user,
                        **milestone_data
                    )
                    overview.milestones_achieved += 1
            
            elif progress_type == 'milestone_achieved':
                overview.milestones_achieved += 1
                
                # Create milestone record
                UserMilestone.objects.create(
                    user=request.user,
                    milestone_type=metadata.get('milestone_type', 'achievement'),
                    title=metadata.get('title', 'Milestone Achieved'),
                    description=metadata.get('description', ''),
                    details=metadata
                )

            # Update stats
            if 'stats' not in overview.stats:
                overview.stats = {}
            
            if progress_type not in overview.stats:
                overview.stats[progress_type] = 0
            overview.stats[progress_type] += value

            overview.save()

            # Clear cache
            cache.delete(f'progress_overview_{request.user.id}')

            # Return updated overview
            return Response({
                'status': 'success',
                'data': ProgressOverviewSerializer(overview).data
            })

        except Exception as e:
            logger.error(f"Error updating progress: {str(e)}")
            return Response({
                'status': 'error',
                'error': {
                    'code': 'progress_update_error',
                    'message': 'Failed to update progress',
                    'details': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _calculate_streak(self, user):
        """Calculate current journal streak"""
        from django.utils import timezone
        from datetime import timedelta
        
        # Get last journal entry
        last_entry = Journal.objects.filter(user=user).order_by('-created_at').first()
        if not last_entry:
            return 0

        # Check if entry is within last 24 hours
        if timezone.now() - last_entry.created_at > timedelta(days=1):
            return 0

        # Calculate streak
        streak = 1
        current_date = last_entry.created_at.date()
        
        while True:
            previous_date = current_date - timedelta(days=1)
            has_entry = Journal.objects.filter(
                user=user,
                created_at__date=previous_date
            ).exists()
            
            if not has_entry:
                break
                
            streak += 1
            current_date = previous_date

        return streak

    def _generate_milestone_description(self, progress_type: str, value: int, streak: int = None) -> dict:
        """Generate appropriate milestone title and description based on progress type"""
        if progress_type == 'journal_entry':
            if streak:
                if streak == 7:
                    return {
                        'milestone_type': 'journal_streak',
                        'title': '7 Day Streak!',
                        'description': 'Completed a full week of daily journaling'
                    }
                elif streak == 30:
                    return {
                        'milestone_type': 'journal_streak',
                        'title': 'Monthly Master',
                        'description': 'Maintained journaling habit for 30 days'
                    }
        elif progress_type == 'mood_improvement':
            return {
                'milestone_type': 'mood_improvement',
                'title': 'Mood Progress',
                'description': 'Showed consistent mood improvement over time'
            }
        
        return None