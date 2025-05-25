from rest_framework import serializers
from .models import CrisisResource, CrisisAlert

class CrisisResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrisisResource
        fields = ['id', 'title', 'description', 'resource_type', 
                 'contact_numbers', 'available_24_7']

class CrisisAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrisisAlert
        fields = ['severity', 'description', 'location', 'contact_preference']
        
    def validate_severity(self, value):
        if value not in dict(CrisisAlert.SEVERITY_CHOICES):
            raise serializers.ValidationError("Invalid severity level")
        return value

class HotlineSerializer(serializers.Serializer):
    name = serializers.CharField()
    number = serializers.CharField()
    description = serializers.CharField()
    available_24_7 = serializers.BooleanField()