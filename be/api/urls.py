from django.contrib import admin
from django.urls import path, include

# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('api/cities/', views.city_list_create, name='city-list-create'),
    path('api/cities/<int:pk>/', views.city_detail, name='city-detail'),
]