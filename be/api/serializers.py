# serializers.py
from rest_framework import serializers
from .models import City

class CitySerializer(serializers.ModelSerializer):
    state_name = serializers.CharField(source='state.state_name', read_only=True)

    class Meta:
        model = City
        fields = [
            'id',
            'city_name',
            'state',
            'state_name',
            'status',
            'created_at'
        ]

from rest_framework import serializers
from .models import AppUsers


class AppUsersSerializer(serializers.ModelSerializer):

    class Meta:
        model = AppUsers
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