from celery import shared_task
from django.utils import timezone
from .models import ExportJob
from apps.journal.models import Journal
from apps.analysis.models import JournalAnalysis
import pandas as pd
import json
import logging

logger = logging.getLogger(__name__)

@shared_task
def generate_journal_export(export_job_id: int) -> None:
    """
    Generate CSV export of user's journal entries
    """
    try:
        export_job = ExportJob.objects.get(id=export_job_id)
        export_job.status = 'processing'
        export_job.save()

        # Get journal entries
        journals = Journal.objects.filter(
            user=export_job.user,
            is_deleted=False
        ).order_by('-created_at')

        # Convert to DataFrame
        data = [{
            'date': entry.created_at,
            'content': entry.content,
            'mood_score': entry.mood_score,
            'tags': ', '.join(entry.tags) if entry.tags else '',
        } for entry in journals]

        df = pd.DataFrame(data)
        
        # Generate CSV file
        filename = f"journal_export_{export_job.user.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.csv"
        file_path = f"exports/{filename}"
        df.to_csv(file_path, index=False)

        # Update export job
        export_job.status = 'completed'
        export_job.file_url = file_path
        export_job.completed_at = timezone.now()
        export_job.save()

    except Exception as e:
        logger.error(f"Journal export failed for job {export_job_id}: {str(e)}")
        export_job.status = 'failed'
        export_job.error_message = str(e)
        export_job.save()

@shared_task
def generate_insights_export(export_job_id: int) -> None:
    """
    Generate JSON export of user's insights and analysis
    """
    try:
        export_job = ExportJob.objects.get(id=export_job_id)
        export_job.status = 'processing'
        export_job.save()

        # Get analysis data
        analyses = JournalAnalysis.objects.filter(
            user=export_job.user
        ).order_by('-created_at')

        # Structure the data
        data = {
            'emotional_patterns': {},
            'triggers': {},
            'coping_strategies': {},
            'risk_levels': [],
            'timeline': [{
                'date': analysis.created_at.isoformat(),
                'patterns': analysis.emotional_patterns,
                'triggers': analysis.trigger_identification,
                'suggestions': analysis.coping_suggestions,
                'risk_level': analysis.risk_level
            } for analysis in analyses]
        }

        # Generate JSON file
        filename = f"insights_export_{export_job.user.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.json"
        file_path = f"exports/{filename}"
        
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)

        # Update export job
        export_job.status = 'completed'
        export_job.file_url = file_path
        export_job.completed_at = timezone.now()
        export_job.save()

    except Exception as e:
        logger.error(f"Insights export failed for job {export_job_id}: {str(e)}")
        export_job.status = 'failed'
        export_job.error_message = str(e)
        export_job.save()