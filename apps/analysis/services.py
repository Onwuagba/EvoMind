from typing import Dict, Any, List
from django.core.cache import cache
from django.conf import settings
import logging
import json
import openai
from .models import JournalAnalysis

logger = logging.getLogger(__name__)

class AIAnalysisService:
    def __init__(self):
        self.openai = openai
        self.openai.api_key = settings.OPENAI_API_KEY

    async def analyze_journal(self, user, content: str) -> Dict[str, Any]:
        """
        Analyzes a journal entry using OpenAI's GPT-4 and returns structured analysis.
        
        Args:
            user: The user who submitted the journal entry
            content: The content of the journal entry to analyze
        
        Returns:
            Dict containing emotional patterns, triggers, coping suggestions, and risk level
        """
        cache_key = f"journal_analysis_{hash(content)}"
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return cached_result

        try:
            # First API call - Get the structured analysis
            completion = await self.openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": """You are a trauma-informed AI analyst. Analyze the journal entry and return only valid JSON with the following structure:
                        {
                            "emotional_patterns": ["pattern1", "pattern2"],
                            "trigger_identification": ["trigger1", "trigger2"],
                            "coping_suggestions": ["suggestion1", "suggestion2"],
                            "risk_level": "low|medium|high",
                            "analysis_summary": "brief summary of the analysis"
                        }"""
                    },
                    {"role": "user", "content": content}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            analysis = self._process_ai_response(completion.choices[0].message['content'])
            
            # Save to database
            JournalAnalysis.objects.create(
                user=user,
                content=content,
                **analysis
            )

            result = {
                'emotional_patterns': analysis['emotional_patterns'],
                'trigger_identification': analysis['trigger_identification'],
                'coping_suggestions': analysis['coping_suggestions'],
                'risk_level': analysis['risk_level'],
                'analysis_summary': analysis.get('analysis_summary', '')
            }

            cache.set(cache_key, result, timeout=3600)
            return result

        except Exception as e:
            logger.error(f"AI Analysis error: {str(e)}")
            raise

    def _process_ai_response(self, ai_response: str) -> Dict[str, Any]:
        """
        Process and validate the AI's JSON response.
        
        Args:
            ai_response: The raw response string from OpenAI containing JSON
        
        Returns:
            Dict containing validated and structured analysis
        """
        try:
            # Attempt to parse the JSON response
            analysis = json.loads(ai_response)

            # Define expected structure
            default_structure = {
                'emotional_patterns': [],
                'trigger_identification': [],
                'coping_suggestions': [],
                'risk_level': 'low',
                'analysis_summary': ''
            }

            # Validate and clean the response
            cleaned_analysis = default_structure.copy()

            # Validate risk level
            if 'risk_level' in analysis:
                risk_level = str(analysis['risk_level']).lower()
                cleaned_analysis['risk_level'] = risk_level if risk_level in ['low', 'medium', 'high'] else 'low'

            # Process list fields
            list_fields = ['emotional_patterns', 'trigger_identification', 'coping_suggestions']
            for field in list_fields:
                if field in analysis and isinstance(analysis[field], list):
                    cleaned_analysis[field] = [str(item) for item in analysis[field] if item]
                    
            # Process summary if available
            if 'analysis_summary' in analysis:
                cleaned_analysis['analysis_summary'] = str(analysis['analysis_summary'])

            return cleaned_analysis

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response: {e}")
            logger.error(f"Raw AI response: {ai_response}")
            return {
                'emotional_patterns': [],
                'trigger_identification': [],
                'coping_suggestions': [],
                'risk_level': 'low',
                'analysis_summary': 'Failed to analyze journal entry'
            }

        except Exception as e:
            logger.error(f"Error processing AI response: {e}")
            logger.error(f"Raw AI response: {ai_response}")
            raise