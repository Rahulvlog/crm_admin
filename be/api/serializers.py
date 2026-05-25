# serializers.py
from rest_framework import serializers
from .models import City

class CitySerializer(serializers.ModelSerializer):
    state_name = serializers.CharField(source='state.state_name', read_only=True)

    class Meta:
        model = City
        fields = '__all__'

from .models import StateMaster


class StateMasterSerializer(serializers.ModelSerializer):

    class Meta:
        model = StateMaster
        fields = '__all__'

from .models import CityMaster


class CityMasterSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = CityMaster
        fields = '__all__'

class GetCityMasterSerializer(serializers.ModelSerializer):
    state_id = serializers.SerializerMethodField()

    class Meta:
        model = CityMaster
        fields = '__all__'

    def get_state_id(self, obj):
        try:
            state = StateMaster.objects.get(id=obj.state_id)
            return StateMasterSerializer(state).data
        except StateMaster.DoesNotExist:
            return None
from rest_framework import serializers
from .models import AppUsers


class AppUsersSerializer(serializers.ModelSerializer):

    class Meta:
        model = AppUsers
        fields = '__all__'




class GetAppUsersSerializer(serializers.ModelSerializer):
    state = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()

    class Meta:
        model = AppUsers
        fields = '__all__'

    def get_state(self, obj):
        try:
            state = StateMaster.objects.get(id=obj.state)
            return StateMasterSerializer(state).data
        except:
            return None

    def get_city(self, obj):
        try:
            city = CityMaster.objects.get(id=obj.city)
            return CityMasterSerializer(city).data
        except:
            return None


from .models import ProjectMaster


class ProjectMasterSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProjectMaster
        fields = '__all__'

class GetProjectMasterSerializer(serializers.ModelSerializer):
    manager_id = serializers.SerializerMethodField()

    class Meta:
        model = ProjectMaster
        fields = '__all__'

    def get_manager_id(self, obj):
        try:
            manager = AppUsers.objects.get(id=obj.manager_id)
            return GetAppUsersSerializer(manager).data
        except AppUsers.DoesNotExist:
            return None

from .models import TasksRecord


class TasksRecordSerializer(serializers.ModelSerializer):

    class Meta:
        model = TasksRecord
        fields = '__all__'

class GetTasksRecordSerializer(serializers.ModelSerializer):

    emp_id = serializers.SerializerMethodField()
    dealer_name = serializers.SerializerMethodField()
    project_id = serializers.SerializerMethodField()
    client_id = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()
    city  = serializers.SerializerMethodField()

    class Meta:
        model = TasksRecord
        fields = '__all__'

    def get_emp_id(self, obj):
        try:
            emp = AppUsers.objects.get(id=obj.emp_id)
            return GetAppUsersSerializer(emp).data
        except AppUsers.DoesNotExist:
            return None

    def get_dealer_name(self, obj):
        try:
            dealer = AppUsers.objects.get(id=obj.dealer_name)
            return GetAppUsersSerializer(dealer).data
        except AppUsers.DoesNotExist:
            return None

    def get_project_id(self, obj):
        try:
            project = ProjectMaster.objects.get(id=obj.project_id)
            return ProjectMasterSerializer(project).data
        except ProjectMaster.DoesNotExist:
            return None

    def get_client_id(self, obj):
        try:
            client = AppUsers.objects.get(id=obj.client_id)
            return GetAppUsersSerializer(client).data
        except AppUsers.DoesNotExist:
            return None

    def get_state(self, obj):
        try:
            state = StateMaster.objects.get(id=obj.state)
            return StateMasterSerializer(state).data
        except:
            return None

    def get_city(self, obj):
        try:
            city = CityMaster.objects.get(id=obj.city)
            return CityMasterSerializer(city).data
        except:
            return None


from .models import ActivityRecord


class ActivityRecordSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = ActivityRecord
        fields = '__all__'
import json
class GetActivityRecordSerializer(serializers.ModelSerializer):
    task_id = serializers.SerializerMethodField()
    photo = serializers.SerializerMethodField()

    class Meta:
        model = ActivityRecord
        fields = '__all__'

    def get_task_id(self, obj):
        try:
            task = TasksRecord.objects.get(id=obj.task_id)
            return GetTasksRecordSerializer(task).data
        except TasksRecord.DoesNotExist:
            return None
        
    def get_photo(self, obj):
        if not obj.photo:
            return []

        try:
            # If stored as JSON string
            return json.loads(obj.photo)
        except:
            # If stored like comma separated string
            return [x.strip() for x in obj.photo.split(',') if x.strip()]



from .models import RoleMaster


class RoleMasterSerializer(serializers.ModelSerializer):

    class Meta:
        model = RoleMaster
        fields = '__all__'

from .models import AppNotificationHistory


class AppNotificationHistorySerializer(serializers.ModelSerializer):

    class Meta:
        model = AppNotificationHistory
        fields = '__all__'