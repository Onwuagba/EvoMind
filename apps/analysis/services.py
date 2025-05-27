from typing import Dict, Any, List
from django.core.cache import cache
from django.conf import settings
import logging
import json
from openai import AsyncOpenAI
from .models import JournalAnalysis
import hashlib

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
            
            analysis = self._process_ai_response(completion.choices[0].message.content)
            
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

    def _serialize_data_for_cache(self, data: Dict[str, Any]) -> str:
        """Serialize data for cache key, handling dates and complex types"""
        serializable_data = data.copy()
        
        # Handle date objects
        if 'date' in serializable_data:
            serializable_data['date'] = serializable_data['date'].isoformat()
        
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
            analysis = json.loads(completion.choices[0].message.content)
            
            # Cache the result
            cache.set(cache_key, analysis, timeout=3600)  # Cache for 1 hour

            return analysis

        except Exception as e:
            logger.error(f"Trauma pattern analysis error: {str(e)}")
            raise


import google.generativeai as genai
from asgiref.sync import sync_to_async

class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        self.CACHE_TIMEOUT = 60 * 60 * 24 * 7  # 7 days

    def _generate_content_hash(self, content: str) -> str:
        """Generate a unique hash for the content."""
        return hashlib.sha256(content.encode()).hexdigest()

    async def analyze_journal(self, user, content: str) -> Dict[str, Any]:
        """
        Analyzes a journal entry using Google's Gemini Pro and returns structured analysis.
        """
        content_hash = self._generate_content_hash(content)
        cache_key = f"gemini_journal_analysis_{content_hash}"
        
        # Try to get from cache first
        cached_result = cache.get(cache_key)
        if cached_result:
            return {
                **cached_result,
                'source': 'cache'
            }

        try:
            print("Starting Gemini analysis for journal entry...")
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

            response = await sync_to_async(self.model.generate_content)(prompt)
            print(response)
            analysis = self._process_ai_response(response.text)
            
            # Save to database without content hash
            await JournalAnalysis.objects.acreate(
                user=user,
                content=content,
                analysis_type='gemini',
                **analysis
            )

            result = {
                'emotional_patterns': analysis['emotional_patterns'],
                'trigger_identification': analysis['trigger_identification'],
                'coping_suggestions': analysis['coping_suggestions'],
                'risk_level': analysis['risk_level'],
                'analysis_summary': analysis.get('analysis_summary', ''),
                'source': 'ai'
            }

            # Cache the result with the content hash
            cache.set(cache_key, result, timeout=self.CACHE_TIMEOUT)
            return result

        except Exception as e:
            logger.error(f"Gemini Analysis error: {str(e)}")
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
            logger.error(f"Gemini trauma pattern analysis error: {str(e)}")
            raise

    def _process_ai_response(self, ai_response: str) -> Dict[str, Any]:
        """Process and validate Gemini's JSON response."""
        try:
            # Clean up the response by removing markdown code block formatting
            cleaned_response = ai_response.strip()
            if cleaned_response.startswith("```json"):
                cleaned_response = cleaned_response[7:]  # Remove ```json
            if cleaned_response.startswith("```"):
                cleaned_response = cleaned_response[3:]  # Remove ```
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response[:-3]  # Remove trailing ```
            
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
                cleaned_analysis['risk_level'] = risk_level if risk_level in ['low', 'medium', 'high'] else 'low'

            list_fields = ['emotional_patterns', 'trigger_identification', 'coping_suggestions']
            for field in list_fields:
                if field in analysis and isinstance(analysis[field], list):
                    cleaned_analysis[field] = [str(item) for item in analysis[field] if item]
                    
            if 'analysis_summary' in analysis:
                cleaned_analysis['analysis_summary'] = str(analysis['analysis_summary'])

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
            serializable_data['date'] = serializable_data['date'].isoformat()
        return json.dumps(serializable_data, sort_keys=True)