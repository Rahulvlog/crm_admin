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
    mobile_no = models.CharField(max_length=12, default='', unique=True)
    state = models.IntegerField(default=0)
    city = models.IntegerField(default=0)
    address = models.CharField(max_length=500, default='')
    profile_image = models.TextField(null=True, blank=True)
    aadhar_image = models.TextField(null=True, blank=True)
    aadhar_no = models.CharField(max_length=100, null=True, blank=True)
    password = models.CharField(max_length=100, default='')
    role_type = models.CharField(max_length=100, default='')
    joining_date = models.DateField(null=True, blank=True)
    online_status = models.IntegerField(default=1)
    working_hrs = models.TimeField(null=True, blank=True)
    is_overtime_allowed = models.IntegerField(null=True, blank=True)
    status = models.IntegerField(default=0)
    latitude = models.CharField(max_length=250, default='0')
    longitude = models.CharField(max_length=250, default='0')
    updated_date = models.DateTimeField(auto_now=True)
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'app_users'
        managed = True


class StateMaster(models.Model):

    name = models.CharField(max_length=250)
    code = models.CharField(max_length=250, null=True, blank=True)
    country_id = models.IntegerField()
    status = models.IntegerField(default=1)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'state_master'
        managed = True

class CityMaster(models.Model):

    name = models.CharField(max_length=250)
    code = models.CharField(max_length=250, null=True, blank=True)
    state_id = models.IntegerField()
    status = models.IntegerField(default=1)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'city_master'
        managed = True

class TasksRecord(models.Model):

    emp_id = models.IntegerField(default=0)
    client_id = models.IntegerField(default=0)
    project_id = models.IntegerField(default=0)
    task_name = models.TextField(default='')
    state = models.IntegerField(default=0)
    city = models.IntegerField(default=0)
    tehsil = models.TextField( default='', blank=True, null=True)
    village = models.TextField(default='', blank=True, null=True)
    code = models.CharField(max_length=20, default='0')
    site_location = models.CharField(max_length=500, default='')
    flex_range = models.IntegerField(default=1)
    flex_completed = models.IntegerField(null=True, blank=True)
    location_type = models.CharField(max_length=500, default='Assigned')
    replace_location = models.TextField(null=True, blank=True)
    dealer_name = models.CharField(max_length=500, default='')  # spacemaker
    sia_app_dealer_name = models.CharField(max_length=500, default='')
    no_of_flex = models.IntegerField(default=0)
    size_of_flex = models.CharField(max_length=1000, default='')
    task_status = models.IntegerField(default=1)
    remark = models.TextField(null=True, blank=True)
    status = models.IntegerField(default=0)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tasks_record'
        managed = True



class ActivityRecord(models.Model):

    sync_id = models.IntegerField()
    activity_ref_no = models.CharField(max_length=100)
    emp_id = models.IntegerField(default=0)
    project_id = models.IntegerField(null=True, blank=True)
    dealer_id = models.IntegerField(default=0)
    flex_id = models.IntegerField()
    task_id = models.IntegerField(default=0)
    flex_size = models.CharField(max_length=500, default='')
    task_sno = models.IntegerField(default=0)
    photo = models.TextField(default='')
    latitude = models.CharField(max_length=250, default='0')
    longitude = models.CharField(max_length=250, default='0')
    state = models.IntegerField(default=0)
    city = models.IntegerField(default=0)
    tehsil = models.TextField( blank=True, null=True, default='')
    village = models.TextField(blank=True, null=True, default='')
    deler_remark = models.TextField(null=True, blank=True)
    gps_address = models.CharField(max_length=1000, default='')
    remark = models.CharField(max_length=1000, blank=True, null=True, default='')
    remark1 = models.TextField(null=True, blank=True)
    dealer_info = models.TextField(null=True, blank=True)
    view_id = models.IntegerField(default=0)
    distance_from_last = models.CharField(max_length=200, null=True, blank=True)
    status = models.IntegerField(default=0)
    created_date = models.DateTimeField(auto_now=True)
    updated_date = models.DateTimeField(auto_now=True)
    timestaps = models.BigIntegerField(null=True, blank=True)

    class Meta:
        db_table = 'activity_record'
        managed = True



class ProjectMaster(models.Model):
    manager_id = models.CharField(max_length=50, default='0')
    title = models.CharField(max_length=250)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    description = models.CharField(max_length=1000, default='', null=True, blank=True)
    status = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'project_master'
        managed = True

# models.py

from django.db import models


class RoleMaster(models.Model):

    name = models.CharField(max_length=100)
    status = models.IntegerField(default=0)
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'role_master'
        managed = True

class AppNotificationHistory(models.Model):

    user_id = models.CharField(max_length=50, default='0')
    sender_id = models.CharField(max_length=10, default='0')
    created_dt = models.DateTimeField(auto_now_add=True)
    unicast = models.IntegerField()
    player_id = models.TextField(null=True, blank=True)
    title = models.CharField(max_length=100)
    message = models.CharField(max_length=500)
    route_date = models.TextField()
    image_url = models.CharField(max_length=500, default='')

    class Meta:
        db_table = 'app_notification_history'
        managed = True

class Setting(models.Model):

    distance_range = models.CharField(max_length=250, null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'setting_master'
        managed = True