from rest_framework import serializers
from .models import ExportJob


class ExportJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExportJob
        fields = ['id', 'export_type', 'status', 'file_url', 
                 'created_at', 'completed_at']
        read_only_fields = ['id', 'status', 'file_url', 
                          'created_at', 'completed_at']