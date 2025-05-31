from asgiref.sync import sync_to_async
import google.generativeai as genai
from typing import Dict, Any, List
from django.core.cache import cache
from django.conf import settings
import logging
import json
from openai import AsyncOpenAI
from django.db.models import QuerySet
from functools import partial

from apps.journal.models import Journal
from .models import JournalAnalysis
import hashlib
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class AIAnalysisService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

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
            completion = await self.client.chat.completions.create(
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

            analysis = self._process_ai_response(
                completion.choices[0].message.content)

            # Save to database
            await JournalAnalysis.objects.acreate(
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
                cleaned_analysis['risk_level'] = risk_level if risk_level in [
                    'low', 'medium', 'high'] else 'low'

            # Process list fields
            list_fields = ['emotional_patterns',
                           'trigger_identification', 'coping_suggestions']
            for field in list_fields:
                if field in analysis and isinstance(analysis[field], list):
                    cleaned_analysis[field] = [
                        str(item) for item in analysis[field] if item]

            # Process summary if available
            if 'analysis_summary' in analysis:
                cleaned_analysis['analysis_summary'] = str(
                    analysis['analysis_summary'])

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

    def _serialize_data_for_cache(self, data: Dict[str, Any]) -> str:
        """Serialize data for cache key, handling dates and complex types"""
        serializable_data = data.copy()

        # Handle date objects
        if 'date' in serializable_data:
            serializable_data['date'] = serializable_data['date'].isoformat(
            )

        return json.dumps(serializable_data, sort_keys=True)

    async def analyze_trauma_pattern(self, user, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes trauma patterns using OpenAI's GPT-4.

        Args:
            user: The user submitting the trauma event
            data: Dictionary containing trauma event details

        Returns:
            Dict containing analysis of trauma patterns and recommendations
        """
        # Use helper method to create cache key
        cache_key = f"trauma_analysis_{user.id}_{hash(self._serialize_data_for_cache(data))}"
        cached_result = cache.get(cache_key)

        if cached_result:
            return cached_result

        try:
            # Format the trauma event data for analysis
            event_description = (
                f"Event Type: {data.get('event_type', 'Not specified')}\n"
                f"Impact Level: {data.get('impact_level', 'Not specified')}\n"
                f"Description: {data.get('description', '')}\n"
                f"Triggers: {', '.join(data.get('triggers', []))}\n"
                f"Coping Methods: {', '.join(data.get('coping_methods', []))}"
            )

            completion = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": """You are a trauma-informed AI analyst. Analyze the trauma event 
                        and return only valid JSON with the following structure:
                        {
                            "pattern_identification": {
                                "triggers": ["trigger1", "trigger2"],
                                "emotional_responses": ["response1", "response2"],
                                "behavioral_patterns": ["pattern1", "pattern2"]
                            },
                            "risk_assessment": {
                                "level": "low|medium|high",
                                "factors": ["factor1", "factor2"]
                            },
                            "recommendations": {
                                "coping_strategies": ["strategy1", "strategy2"],
                                "support_resources": ["resource1", "resource2"],
                                "professional_help": boolean
                            },
                            "summary": "brief analysis summary"
                        }"""
                    },
                    {"role": "user", "content": event_description}
                ],
                temperature=0.7,
                max_tokens=800
            )

            # Parse the response
            analysis = json.loads(
                completion.choices[0].message.content)

            # Cache the result
            # Cache for 1 hour
            cache.set(cache_key, analysis, timeout=3600)

            return analysis

        except Exception as e:
            logger.error(f"Trauma pattern analysis error: {str(e)}")
            raise


class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        self.CACHE_TIMEOUT = 60 * 60 * 24 * 7  # 7 days

    def _generate_content_hash(self, content: str) -> str:
        """Generate a unique hash for the content."""
        return hashlib.sha256(content.encode()).hexdigest()

    async def analyze_journal(self, user, journal: Journal, update=False) -> Dict[str, Any]:
        """
        Analyzes a journal entry using Google's Gemini Pro and returns structured analysis.
        """
        content_hash = self._generate_content_hash(journal.content)
        cache_key = f"gemini_journal_analysis_{content_hash}"
        content = journal.content

        try:
            logger.info(
                f"Starting Gemini analysis for journal entry {journal.id}...")
            prompt = f"""
            You are a trauma-informed AI analyst. Analyze this journal entry and return only valid JSON.
            Journal entry: {content}
            
            Required JSON structure:
            {{
                "emotional_patterns": ["pattern1", "pattern2"],
                "trigger_identification": ["trigger1", "trigger2"],
                "coping_suggestions": ["suggestion1", "suggestion2"],
                "risk_level": "low|medium|high",
                "analysis_summary": "brief summary of the analysis"
            }}
            
            Return only the JSON, no other text.
            """

            # Make the model.generate_content call async-safe
            generate_content = partial(
                self.model.generate_content, prompt)
            response = await sync_to_async(generate_content)()
            analysis = self._process_ai_response(response.text)

            # Get existing analysis using async-safe queryset
            existing_analysis = await sync_to_async(lambda: JournalAnalysis.objects.filter(journal=journal).first())()

            if existing_analysis:
                # Update existing analysis using async-safe update
                logger.info(
                    f"Updating existing analysis for journal {journal.id}")
                update_fields = {
                    'content': content,
                    'emotional_patterns': analysis['emotional_patterns'],
                    'trigger_identification': analysis['trigger_identification'],
                    'coping_suggestions': analysis['coping_suggestions'],
                    'risk_level': analysis['risk_level'],
                    'analysis_summary': analysis.get('analysis_summary', ''),
                    'analysis_type': 'gemini'
                }

                await sync_to_async(
                    lambda: JournalAnalysis.objects.filter(
                        id=existing_analysis.id).update(**update_fields)
                )()
            else:
                # Create new analysis using async-safe create
                logger.info(
                    f"Creating new analysis for journal {journal.id}")
                create_analysis = partial(
                    JournalAnalysis.objects.create,
                    user=user,
                    journal=journal,
                    content=content,
                    emotional_patterns=analysis['emotional_patterns'],
                    trigger_identification=analysis['trigger_identification'],
                    coping_suggestions=analysis['coping_suggestions'],
                    risk_level=analysis['risk_level'],
                    analysis_summary=analysis.get(
                        'analysis_summary', ''),
                    analysis_type='gemini'
                )
                await sync_to_async(create_analysis)()

            result = {
                'emotional_patterns': analysis['emotional_patterns'],
                'trigger_identification': analysis['trigger_identification'],
                'coping_suggestions': analysis['coping_suggestions'],
                'risk_level': analysis['risk_level'],
                'analysis_summary': analysis.get('analysis_summary', ''),
                'source': 'gemini'
            }

            # Make cache.set async-safe
            await sync_to_async(cache.set)(cache_key, result, timeout=self.CACHE_TIMEOUT)
            return result

        except Exception as e:
            logger.error(
                f"Gemini Analysis error for journal {journal.id}: {str(e)}")
            raise

    async def analyze_trauma_pattern(self, user, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes trauma patterns using Google's Gemini Pro.
        """
        cache_key = f"gemini_trauma_analysis_{user.id}_{hash(self._serialize_data_for_cache(data))}"
        cached_result = cache.get(cache_key)

        if cached_result:
            return cached_result

        try:
            event_description = (
                f"Event Type: {data.get('event_type', 'Not specified')}\n"
                f"Impact Level: {data.get('impact_level', 'Not specified')}\n"
                f"Description: {data.get('description', '')}\n"
                f"Triggers: {', '.join(data.get('triggers', []))}\n"
                f"Coping Methods: {', '.join(data.get('coping_methods', []))}"
            )

            prompt = f"""
            You are a trauma-informed AI analyst. Analyze this trauma event and return only valid JSON.
            Event details: {event_description}
            
            Required JSON structure:
            {{
                "pattern_identification": {{
                    "triggers": ["trigger1", "trigger2"],
                    "emotional_responses": ["response1", "response2"],
                    "behavioral_patterns": ["pattern1", "pattern2"]
                }},
                "risk_assessment": {{
                    "level": "low|medium|high",
                    "factors": ["factor1", "factor2"]
                }},
                "recommendations": {{
                    "coping_strategies": ["strategy1", "strategy2"],
                    "support_resources": ["resource1", "resource2"],
                    "professional_help": boolean
                }},
                "summary": "brief analysis summary"
            }}
            
            Return only the JSON, no other text.
            """

            response = await sync_to_async(self.model.generate_content)(prompt)
            analysis = json.loads(response.text)

            cache.set(cache_key, analysis, timeout=3600)
            return analysis

        except Exception as e:
            logger.error(
                f"Gemini trauma pattern analysis error: {str(e)}")
            raise

    def _process_ai_response(self, ai_response: str) -> Dict[str, Any]:
        """Process and validate Gemini's JSON response."""
        try:
            # Clean up the response by removing markdown code block formatting
            cleaned_response = ai_response.strip()
            if cleaned_response.startswith("```json"):
                # Remove ```json
                cleaned_response = cleaned_response[7:]
            if cleaned_response.startswith("```"):
                cleaned_response = cleaned_response[3:]  # Remove ```
            if cleaned_response.endswith("```"):
                # Remove trailing ```
                cleaned_response = cleaned_response[:-3]

            analysis = json.loads(cleaned_response.strip())

            default_structure = {
                'emotional_patterns': [],
                'trigger_identification': [],
                'coping_suggestions': [],
                'risk_level': 'low',
                'analysis_summary': ''
            }

            cleaned_analysis = default_structure.copy()

            if 'risk_level' in analysis:
                risk_level = str(analysis['risk_level']).lower()
                cleaned_analysis['risk_level'] = risk_level if risk_level in [
                    'low', 'medium', 'high'] else 'low'

            list_fields = ['emotional_patterns',
                           'trigger_identification', 'coping_suggestions']
            for field in list_fields:
                if field in analysis and isinstance(analysis[field], list):
                    cleaned_analysis[field] = [
                        str(item) for item in analysis[field] if item]

            if 'analysis_summary' in analysis:
                cleaned_analysis['analysis_summary'] = str(
                    analysis['analysis_summary'])

            return cleaned_analysis

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response: {e}")
            logger.error(f"Raw Gemini response: {ai_response}")
            return default_structure

        except Exception as e:
            logger.error(f"Error processing Gemini response: {e}")
            logger.error(f"Raw Gemini response: {ai_response}")
            raise

    def _serialize_data_for_cache(self, data: Dict[str, Any]) -> str:
        """Serialize data for cache key, handling dates and complex types"""
        serializable_data = data.copy()
        if 'date' in serializable_data:
            serializable_data['date'] = serializable_data['date'].isoformat(
            )
        return json.dumps(serializable_data, sort_keys=True)

    async def _generate_completion(self, prompt: str) -> Dict[str, Any]:
        """Generate completion using Gemini API"""
        try:
            # Initialize Gemini
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-2.0-flash')

            response = await sync_to_async(model.generate_content)(prompt)

            # Clean up response and parse JSON
            cleaned_response = response.text.strip()
            if cleaned_response.startswith("```json"):
                cleaned_response = cleaned_response[7:]
            if cleaned_response.startswith("```"):
                cleaned_response = cleaned_response[3:]
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response[:-3]

            return json.loads(cleaned_response.strip())
        except Exception as e:
            logger.error(
                f"Error generating Gemini completion: {str(e)}")
            return None

    async def generate_daily_quote(self, context):
        """Generate personalized quote using Gemini based on user's previous day context"""
        try:
            yesterday = datetime.now().date() - timedelta(days=1)

            prompt = f"""
            You are a compassionate AI assistant specializing in emotional wellness.
            Generate an inspiring quote for someone based on their previous day:
            - Yesterday's mood: {context['previous_mood'] or 'Unknown'}
            - Journaled yesterday: {'Yes' if context['journaled_yesterday'] else 'No'}
            - Current journaling streak: {context['streak_days']} days
            
            Recent emotional state:
            {self._format_emotional_state(context['emotional_state'])}
            
            Provide a quote that:
            1. Acknowledges their emotional journey from yesterday
            2. Encourages continued self-reflection
            3. Offers wisdom relevant to their situation
            
            Return only valid JSON in this format:
            {{
                "quote": "The quote text",
                "author": "Author name",
                "context": "Brief explanation of why this quote is relevant to their journey"
            }}
            
            Return only the JSON, no other text.
            """

            response = await self._generate_completion(prompt)
            return response

        except Exception as e:
            logger.error(
                f"Error generating daily quote with Gemini: {str(e)}")
            return None

    def _extract_themes(self, journal_excerpts: List[str]) -> List[str]:
        """Extract common themes from journal excerpts"""
        if not journal_excerpts:
            return []

        # Combine all excerpts into one text for analysis
        combined_text = " ".join(journal_excerpts)

        # Common emotional themes to look for
        emotional_keywords = {
            'anxiety': ['worry', 'anxious', 'nervous', 'stress', 'overwhelm'],
            'sadness': ['sad', 'down', 'depressed', 'lonely', 'grief'],
            'anger': ['angry', 'frustrated', 'mad', 'irritated', 'rage'],
            'joy': ['happy', 'joy', 'excited', 'grateful', 'peaceful'],
            'fear': ['scared', 'afraid', 'fearful', 'panic', 'terror']
        }

        # Find matching themes
        found_themes = []
        for theme, keywords in emotional_keywords.items():
            if any(keyword in combined_text.lower() for keyword in keywords):
                found_themes.append(theme)

        return found_themes

    async def generate_daily_quote(self, context):
        """Generate personalized quote based on user's previous day context"""
        try:
            # Get yesterday's date
            user_name = context.get('user_name', 'User')

            prompt = f"""
            Generate a personal and empathetic quote for {user_name}, considering their journey:

            {user_name}'s Previous Day:
            - Your mood yesterday was: {context['previous_mood'] or 'not recorded'}
            - You {'' if context['journaled_yesterday'] else 'haven\'t'} shared your thoughts in your journal yesterday
            - You've maintained a {context['streak_days']}-day journey of self-reflection
            
            Your Recent Emotional Journey:
            {self._format_emotional_state_personal(context['emotional_state'])}
            
            Create a quote that:
            1. Speaks directly to you, {user_name}, acknowledging your unique emotional journey
            2. Encourages you to continue your path of self-discovery
            3. Offers wisdom that resonates with your current situation
            
            Return only valid JSON in this format:
            {{
                "quote": "The quote text",
                "author": "Author name",
                "context": "Personal message to {user_name} explaining why this quote is meaningful for their current journey"
            }}
            """

            response = await self._generate_completion(prompt)
            return response

        except Exception as e:
            logger.error(f"Error generating daily quote: {str(e)}")
            return None

    def _format_emotional_state_personal(self, state):
        """Format emotional state data for AI prompt in a personal way"""
        mood_trend = state['mood_trend']
        mood_direction = 'improving' if mood_trend[-1] > mood_trend[0] else 'declining'
        themes = self._extract_themes(state['journal_excerpts'])

        return f"""
        - Your mood has been {mood_direction} lately
        - In your recent reflections, you've expressed feelings of: {', '.join(themes) if themes else 'varied emotions'}
        - Your journey shows {self._get_emotional_insight(mood_trend)}
        """

    def _get_emotional_insight(self, mood_trend):
        """Generate a personal insight about the mood trend"""
        if len(mood_trend) < 2:
            return "you're starting to track your emotional journey"

        volatility = max(mood_trend) - min(mood_trend)
        if volatility > 3:
            return "you're experiencing significant emotional waves"
        elif volatility > 1:
            return "you're going through gentle emotional fluctuations"
        else:
            return "you're maintaining emotional stability"
