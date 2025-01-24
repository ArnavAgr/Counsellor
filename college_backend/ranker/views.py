from django.shortcuts import render
from .models import City, Branch
from geopy.distance import geodesic
from .import_data import min_closing_rank, max_closing_rank, min_fee, max_fee
import pandas as pd
from django.http import JsonResponse
import json
import logging

logger = logging.getLogger(__name__)

weigth1 = 0.7
weight2 = 0.3
weight3 = 0.2
weight4 = 0.5

def calculate_composite_score(branch, user_city, options):
    rank_score = 10 * (1 - ((branch.closing_rank - min_closing_rank) / (max_closing_rank - min_closing_rank)))

    if not options:
        return rank_score

    if len(options) == 1:
        if 'Fees' in options:
            fee_score = 10 * (1 - ((branch.fees - min_fee) / (max_fee - min_fee)))
            return ((weigth1 * rank_score) + (weight2 * fee_score))
        elif 'Distance' in options:
            distance_score = branch.distance_score
            return ((weigth1 * rank_score) + (weight2 * distance_score))

    fee_score = 10 * (1 - ((branch.fees - min_fee) / (max_fee - min_fee)))
    distance_score = branch.distance_score
    return ((weight4 * rank_score) + (weight2 * fee_score) + (weight3 * distance_score))

def calculate_distance_scores(user_city, institute_data):
    distances = []
    for _, row in institute_data.iterrows():
        distance = geodesic(
            (user_city.latitude, user_city.longitude),
            (row['Latitude'], row['Longitude'])
        ).km
        distances.append(distance)

    max_distance = max(distances)
    min_distance = min(distances)
    scores = [
        10 * (1 - ((distance - min_distance) / (max_distance - min_distance)))
        for distance in distances
    ]

    institute_data['Distance_Score'] = scores
    return institute_data

def rank_colleges(request):
    logger.info("Received request to rank colleges")
    cities = City.objects.all().order_by('name')
    branches = Branch.objects.values_list('name', flat=True).distinct().order_by('name')  # Get unique branch names

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            logger.info(f"Request data: {data}")
        except json.JSONDecodeError:
            logger.error("Invalid JSON")
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        try:
            selected_city = City.objects.get(id=data['city'])
            options = data.get('options', [])
            max_fees = int(data.get('max_fees', 300000))  # Default to 3,00,000
            max_distance = int(data.get('max_distance', 5000))  # Default to 5000 km
            selected_branch = data.get('branch_name', None)  # Branch name filter

            branches_data = Branch.objects.select_related('institute').all()

            # Load Dataset A (combined_geodata_college) and Dataset B (Geo_data_INDIA_all_cities)
            institute_data = pd.read_excel('combined_geodata_college.xlsx')

            # Calculate distance-based scores if 'Distance' option is chosen
            if 'Distance' in options:
                institute_data = calculate_distance_scores(selected_city, institute_data)
                for branch in branches_data:
                    branch.distance_score = institute_data.loc[
                        institute_data['Institute'] == branch.institute.name, 'Distance_Score'
                    ].values[0]

            results = []

            for branch in branches_data:
                # Filter by branch name
                if selected_branch and branch.name != selected_branch:
                    continue

                # Filter by fees
                if branch.fees > max_fees:
                    continue

                # Calculate the distance only if 'Distance' is selected in options
                if 'Distance' in options:
                    distance = geodesic(
                        (selected_city.latitude, selected_city.longitude),
                        (branch.institute.latitude, branch.institute.longitude)
                    ).km
                    if distance > max_distance:
                        continue
                else:
                    distance = None

                # Calculate composite score
                composite_score = calculate_composite_score(branch, selected_city, options)
                
                result = {
                    'institute': branch.institute.name,
                    'branch': branch.name,
                    'closing_rank': branch.closing_rank,
                    'composite_score': round(composite_score, 2),
                }

                # Include fees and distance in the result if applicable
                if 'Fees' in options:
                    result['fees'] = branch.fees
                
                if 'Distance' in options and distance is not None:
                    result['distance'] = round(distance, 2)
                    result['distance_score'] = round(branch.distance_score, 2)
                
                results.append(result)

            # Normalize and sort results
            if results:
                min_score = min(result['composite_score'] for result in results)
                max_score = max(result['composite_score'] for result in results)
                for result in results:
                    if max_score > min_score:  # Avoid division by zero
                        result['composite_score'] = round(10 * ((result['composite_score'] - min_score) / (max_score - min_score)), 2)
                    else:
                        result['composite_score'] = 10  # Edge case: All scores are the same

            results.sort(key=lambda x: x['composite_score'], reverse=True)
            
            logger.info(f"Results: {results}")
            return JsonResponse({'results': results, 'options': options})
        except Exception as e:
            logger.error(f"Error processing request: {str(e)}")
            return JsonResponse({'error': 'Internal Server Error'}, status=500)

    return render(request, 'ranker/index.html', {'cities': cities, 'branches': branches})
