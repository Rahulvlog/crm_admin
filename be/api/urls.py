from django.contrib import admin
from django.urls import path, include

# urls.py
from django.urls import path

from api.auth import app_users_api
from api.state_city import city_master_api, state_master_api
from . import views
from .client_master import client_api

urlpatterns = [
    path('api/cities/', views.city_list_create, name='city-list-create'),
    path('api/cities/<int:pk>/', views.city_detail, name='city-detail'),
    path('api/client', client_api),
    path('app-users/', app_users_api),
    path('app-users/<int:id>/', app_users_api),
    path('state-master/', state_master_api),
    path('state-master/<int:id>/', state_master_api),
    path('city-master/', city_master_api),
    path('city-master/<int:id>/', city_master_api),
]