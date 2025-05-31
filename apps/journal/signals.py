import asyncio
from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import sync_to_async
from django.conf import settings
from apps.journal.models import Journal
from apps.analysis.models import JournalAnalysis
from apps.analysis.services import GeminiService


@receiver(post_save, sender=Journal)
def analyze_journal_entry(sender, instance, created, **kwargs):
    """
    Signal to analyze journal entries after they're saved
    """
    async def run_analysis():
        try:
            print(f"Analyzing journal entry: {instance.id} for user: {instance.user.id}")
            # Check if analysis already exists
            analysis = await sync_to_async(JournalAnalysis.objects.filter)(journal=instance).first()
            if analysis:
                return

            # Run analysis
            service = GeminiService()
            analysis_result = await service.analyze_journal_entry({
                'content': instance.content,
                'mood_before': instance.before_mood,
                'mood_after': instance.after_mood,
            })

            # Save analysis
            await sync_to_async(JournalAnalysis.objects.create)(
                user=instance.user,
                journal=instance,
                content=instance.content,
                emotional_patterns=analysis_result.get(
                    'emotional_patterns', []),
                trigger_identification=analysis_result.get(
                    'triggers', []),
                coping_suggestions=analysis_result.get(
                    'coping_suggestions', []),
                risk_level=analysis_result.get('risk_level', 'low'),
                analysis_summary=analysis_result.get('summary'),
                analysis_type='gemini'
            )

        except Exception as e:
            print(f"Error analyzing journal entry: {str(e)}")

    # Run analysis asynchronously
    asyncio.create_task(run_analysis())
