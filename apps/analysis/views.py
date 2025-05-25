from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .services import AIAnalysisService

class AnalysisViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def analyze_journal(self, request):
        service = AIAnalysisService()
        result = service.analyze_journal_entry(request.data['content'])
        return Response(result)
