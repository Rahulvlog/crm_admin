# models.py
from django.db import models

class State(models.Model):
    state_name = models.CharField(max_length=100)
    status = models.BooleanField(default=True)

    def __str__(self):
        return self.state_name


class City(models.Model):
    city_name = models.CharField(max_length=100)
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name='cities')
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.city_name
    
# models.py

from django.db import models


class AppUsers(models.Model):

    profile_code = models.CharField(max_length=250, default='')
    name = models.CharField(max_length=250, default='')
    contact_person = models.CharField(max_length=250, default='')
    mobile_no = models.CharField(max_length=12, default='')
    state = models.IntegerField(default=0)
    city = models.IntegerField(default=0)
    address = models.CharField(max_length=500, default='')
    profile_image = models.CharField(max_length=250, default='')
    password = models.CharField(max_length=100, default='')
    role_type = models.IntegerField(default=0)
    joining_date = models.DateField(null=True, blank=True)
    online_status = models.IntegerField(default=1)
    working_hrs = models.TimeField(null=True, blank=True)
    is_overtime_allowed = models.IntegerField(null=True, blank=True)
    status = models.IntegerField(default=0)
    updated_date = models.DateTimeField(auto_now=True)
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'app_users'
        managed = False

class StateMaster(models.Model):

    name = models.CharField(max_length=250)
    code = models.CharField(max_length=250, null=True, blank=True)
    country_id = models.IntegerField()
    status = models.IntegerField(default=1)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'state_master'
        managed = False

class CityMaster(models.Model):

    name = models.CharField(max_length=250)
    code = models.CharField(max_length=250, null=True, blank=True)
    state_id = models.IntegerField()
    status = models.IntegerField(default=1)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'city_master'
        managed = False