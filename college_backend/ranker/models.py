from django.db import models

class Institute(models.Model):
    name = models.CharField(max_length=500)
    latitude = models.FloatField()
    longitude = models.FloatField()

class Branch(models.Model):
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE)
    name = models.CharField(max_length=500)
    closing_rank = models.IntegerField()
    fees = models.FloatField()

class City(models.Model):
    name = models.CharField(max_length=500)
    latitude = models.FloatField()
    longitude = models.FloatField()