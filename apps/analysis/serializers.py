from rest_framework import serializers
from .models import JournalAnalysis

class JournalAnalysisRequestSerializer(serializers.Serializer):
    content = serializers.CharField(min_length=10)

class JournalAnalysisResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalAnalysis
        fields = ['emotional_patterns', 'trigger_identification', 
                 'coping_suggestions', 'risk_level', 'analyzed_at']

class TraumaEventSerializer(serializers.Serializer):
    date = serializers.DateField()
    description = serializers.CharField()
    intensity = serializers.IntegerField(min_value=1, max_value=10)
    triggers = serializers.ListField(child=serializers.CharField())