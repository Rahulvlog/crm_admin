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