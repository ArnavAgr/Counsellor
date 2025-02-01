from django.urls import path
from . import views, api_views

urlpatterns = [
    path('', views.rank_colleges, name='rank_colleges'),
    path('api/cities/', api_views.get_cities, name='get_cities'),
    path('api/branches/', api_views.get_branches, name='get_branches'),
    path('api/rank_colleges/', api_views.rank_colleges_api, name='rank_colleges_api'),
]