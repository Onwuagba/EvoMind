from django.shortcuts import render
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from .services import DataExportService

class ExportViewSet(ViewSet):
    @action(detail=False, methods=['get'])
    def journal_data(self, request):
        service = DataExportService()
        data = service.export_journal_data(request.user)
        return Response(data)

    @action(detail=False, methods=['get'])
    def full_profile(self, request):
        service = DataExportService()
        data = service.export_full_profile(request.user)
        return Response(data)
