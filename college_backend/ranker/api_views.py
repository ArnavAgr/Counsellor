from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import City, Branch
from .views import rank_colleges

@api_view(['GET'])
def get_cities(request):
    cities = City.objects.all().values('id', 'name')
    return Response(list(cities))

@api_view(['GET'])
def get_branches(request):
    branches = Branch.objects.values('name').distinct()
    return Response(list(branches))

@api_view(['POST'])
def rank_colleges_api(request):
    return rank_colleges(request)
