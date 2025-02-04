from rest_framework.decorators import api_view
from rest_framework.response import Response
import pandas as pd
from .models import City, Branch
from .views import rank_colleges
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .import_data import get_data_files

@csrf_exempt
def get_cities(request):
    try:
        # Read the cities data from the Excel file
        cities_df = pd.read_excel('Geo_data_INDIA_all_cities.xlsx')
        # Add an index to ensure uniqueness
        cities = [
            {
                "id": str(index),  # Add unique ID
                "name": str(row["City"]),
                "latitude": float(row["Latitude"]),
                "longitude": float(row["Longitude"])
            }
            for index, row in cities_df.iterrows()
        ]
        return JsonResponse(cities, safe=False)
    except Exception as e:
        print(f"Error fetching cities: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['GET'])
def get_branches(request):
    try:
        institution_types = request.query_params.getlist('institution_types', ['NIT'])
        valid_types = ['NIT', 'IIIT', 'IIT']
        for institution_type in institution_types:
            if institution_type not in valid_types and institution_type != 'NIT+IIIT':
                raise ValueError(f"Invalid institution type: {institution_type}. Must be one of: NIT, IIIT, IIT, NIT+IIIT")
        
        branches = []
        if 'NIT+IIIT' in institution_types:
            institution_types.remove('NIT+IIIT')
            institution_types.extend(['NIT', 'IIIT'])
        
        for institution_type in institution_types:
            files = get_data_files(institution_type)
            if not files:
                raise ValueError(f"Could not find data files for institution type: {institution_type}")
            
            combined_df = pd.read_excel(files['combined'])
            branches.extend([{'name': str(branch)} for branch in sorted(combined_df['Branch'].unique())])
        
        branches = sorted({branch['name'] for branch in branches})  # Remove duplicates and sort
        print(f"Found {len(branches)} branches for {institution_types}")
        return Response([{'name': branch} for branch in branches])
    except Exception as e:
        print(f"Error in get_branches: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def rank_colleges_api(request):
    return rank_colleges(request)
