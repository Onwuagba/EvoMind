from django.urls import path
from .views import RegisterView, LoginView, LogoutView, TokenRefreshView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/refresh-token/', TokenRefreshView.as_view(), name='auth_refresh_token'),
]