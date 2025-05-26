from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from .serializers import (
    RegisterSerializer, 
    LoginSerializer,
    TokenRefreshSerializer
)
from .services.auth_service import AuthenticationService

class RegisterView(APIView):
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    @swagger_auto_schema(request_body=RegisterSerializer)
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = AuthenticationService.get_tokens_for_user(user)
            return Response({
                'status': 'success',
                'data': tokens
            }, status=status.HTTP_201_CREATED)
        return Response({
            'status': 'error',
            'error': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    @swagger_auto_schema(request_body=LoginSerializer)
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            tokens = AuthenticationService.login(
                serializer.validated_data['email'],
                serializer.validated_data['password']
            )
            if tokens:
                return Response({
                    'status': 'success',
                    'data': tokens
                })
            return Response({
                'status': 'error',
                'error': {'message': 'Invalid credentials'}
            }, status=status.HTTP_401_UNAUTHORIZED)
        return Response({
            'status': 'error',
            'error': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    http_method_names = ['post']
    @swagger_auto_schema(request_body=TokenRefreshSerializer)
    def post(self, request):
        refresh_token = request.data.get('refresh')
        if AuthenticationService.logout(refresh_token):
            return Response({'status': 'success'})
        return Response({
            'status': 'error',
            'error': {'message': 'Invalid token'}
        }, status=status.HTTP_400_BAD_REQUEST)

class TokenRefreshView(APIView):
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    @swagger_auto_schema(request_body=TokenRefreshSerializer)
    def post(self, request):
        refresh_token = request.data.get('refresh')
        tokens = AuthenticationService.refresh_token(refresh_token)
        if tokens:
            return Response({
                'status': 'success',
                'data': tokens
            })
        return Response({
            'status': 'error',
            'error': {'message': 'Invalid token'}
        }, status=status.HTTP_400_BAD_REQUEST)
