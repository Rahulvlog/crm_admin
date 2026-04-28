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