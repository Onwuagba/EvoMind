import asyncio
from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import sync_to_async
from apps.journal.models import Journal
from apps.analysis.models import JournalAnalysis
from apps.analysis.services import GeminiService
import logging

logger = logging.getLogger(__name__)

# Create sync_to_async versions of model operations
get_analysis = sync_to_async(JournalAnalysis.objects.filter)
create_analysis = sync_to_async(JournalAnalysis.objects.create)


@receiver(post_save, sender=Journal)
def analyze_journal_entry(sender, instance, created, **kwargs):
    """
    Signal handler for journal entry analysis
    Runs on both creation and updates
    """
    async def run_analysis():
        try:
            logger.info(
                f"Analyzing journal entry: {instance.id} for user: {instance.user.id}")

            # Run new analysis
            service = GeminiService()
            await service.analyze_journal(instance.user, instance)

        except Exception as e:
            logger.error(f"Error analyzing journal entry: {str(e)}")
            raise

    try:
        asyncio.run(run_analysis())
    except Exception as e:
        logger.error(f"Failed to run analysis: {str(e)}")
