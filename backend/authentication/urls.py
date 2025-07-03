from django.urls import path
from . import views

urlpatterns = [
    path('api/auth/signup/', views.signup, name='signup'),
    path('api/auth/signin/', views.signin, name='signin'),
    path('api/auth/signout/', views.signout, name='signout'),
    path('api/auth/profile/', views.user_profile, name='user_profile'),
]
