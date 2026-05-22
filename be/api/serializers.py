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
    manager_id  = GetAppUsersSerializer()
    class Meta:
        model = ProjectMaster
        fields = '__all__'

from .models import TasksRecord


class TasksRecordSerializer(serializers.ModelSerializer):

    class Meta:
        model = TasksRecord
        fields = '__all__'

class GetTasksRecordSerializer(serializers.ModelSerializer):
    emp_id = GetAppUsersSerializer()
    dealer_name = GetAppUsersSerializer()
    project_id = ProjectMasterSerializer()
    client_id = ProjectMasterSerializer()

    class Meta:
        model = TasksRecord
        fields = '__all__'


from .models import ActivityRecord


class ActivityRecordSerializer(serializers.ModelSerializer):
    task_id = GetTasksRecordSerializer

    class Meta:
        model = ActivityRecord
        fields = '__all__'

class GetActivityRecordSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = ActivityRecord
        fields = '__all__'



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