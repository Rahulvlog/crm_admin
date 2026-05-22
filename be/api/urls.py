from django.contrib import admin
from django.urls import path, include

# urls.py
from django.urls import path

from api.activity_record import activity_record_api
from api.app_notification import app_notification_history_api
from api.auth import app_users_api
from api.login import login_api
from api.project_master import project_master_api
from api.roles import role_master_api
from api.state_city import city_master_api, state_master_api
from api.task_record import tasks_record_api
from api.upload_image import upload_image_api
from . import views
from .client_master import client_api


urlpatterns = [
    # path('cities/', views.city_list_create, name='city-list-create'),
    # path('cities/<int:pk>/', views.city_detail, name='city-detail'),
    # path('client', client_api),
    path('upload-image/', upload_image_api),
    path('login/', login_api),
    path('app-users/', app_users_api),
    path('app-users/<int:id>/', app_users_api),
    path('state-master/', state_master_api),
    path('state-master/<int:id>/', state_master_api),
    path('city-master/', city_master_api),
    path('city-master/<int:id>/', city_master_api),
    path('tasks-record/', tasks_record_api),
    path('tasks-record/<int:id>/', tasks_record_api),
    path('activity-record/', activity_record_api),
    path('activity-record/<int:id>/', activity_record_api),
    path('project-master/', project_master_api),
    path('project-master/<int:id>/', project_master_api),
    path('role-master/', role_master_api),
    path('role-master/<int:id>/', role_master_api),
    path('app-notification-history/', app_notification_history_api),
    path('app-notification-history/<int:id>/', app_notification_history_api),
]