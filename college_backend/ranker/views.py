from django.shortcuts import render
from .models import City, Branch
from geopy.distance import geodesic
from .import_data import min_closing_rank, max_closing_rank, min_fee, max_fee, calculate_min_max_values, get_data_files
import pandas as pd
from django.http import JsonResponse
import json
import logging

logger = logging.getLogger(__name__)

weigth1 = 0.7
weight2 = 0.3
weight3 = 0.2
weight4 = 0.5
weight5 = 0.4
weight6 = 0.1


min_closing_rank, max_closing_rank, min_fee, max_fee = calculate_min_max_values()

def calculate_composite_score(branch, options):
    rank_score = 10 * (1 - ((branch['Closing_Rank'] - min_closing_rank) / (max_closing_rank - min_closing_rank)))
    fee_score = 0
    distance_score = 0
    nirf_score = 0

    if 'Fees' in options:
        fee_score = 10 * (1 - ((branch['Fees'] - min_fee) / (max_fee - min_fee)))
    if 'Distance' in options:
        distance_score = branch['Distance_Score']
    if 'NIRF' in options:
        nirf_score = branch['Nirf_Weightage']

    if len(options) == 0:
        return rank_score
    elif len(options) == 1:
        if 'Fees' in options:
            return (weigth1 * rank_score) + (weight2 * fee_score)
        elif 'Distance' in options:
            return (weigth1 * rank_score) + (weight2 * distance_score)
        elif 'NIRF' in options:
            return (weigth1 * rank_score) + (weight2 * nirf_score)
    elif len(options) == 2:
        if 'Fees' in options and 'Distance' in options:
            return (weight4 * rank_score) + (weight2 * fee_score) + (weight3 * distance_score)
        elif 'Fees' in options and 'NIRF' in options:
            return (weight4 * rank_score) + (weight2 * fee_score) + (weight3 * nirf_score)
        elif 'Distance' in options and 'NIRF' in options:
            return (weight4 * rank_score) + (weight2 * distance_score) + (weight3 * nirf_score)
    else:
        return (weigth1 * rank_score) + (weight6 * fee_score) + (weight6 * distance_score) + (weight6 * nirf_score)

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

def get_cities(request):
    cities_df = pd.read_excel('Geo_data_INDIA_all_cities.xlsx')
    cities = [{"name": row["City"], "latitude": row["Latitude"], "longitude": row["Longitude"]} 
              for _, row in cities_df.iterrows()]
    return JsonResponse(cities, safe=False)

def get_branches(request):
    institution_type = request.GET.get('institution_type', 'NIT')
    files = get_data_files(institution_type)
    
    orcr_df = pd.read_excel(files['orcr'])
    branches = orcr_df['Branch'].unique().tolist()
    return JsonResponse([{"name": branch} for branch in branches], safe=False)

def rank_colleges(request):
    logger.info("Received request to rank colleges")

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            logger.info(f"Request data: {data}")
            
            institution_types = data.get('institution_types', ['NIT'])
            if 'NIT+IIIT' in institution_types:
                institution_types.remove('NIT+IIIT')
                institution_types.extend(['NIT', 'IIIT'])
            
            try:
                # Load DataFrames from combined files
                combined_dfs = []
                for institution_type in institution_types:
                    files = get_data_files(institution_type)
                    df = pd.read_excel(files['combined'])
                    # Rename fees column for consistency
                    df = df.rename(columns={'Fees_2023_per_sem': 'Fees'})
                    combined_dfs.append(df)
                
                # Concatenate all dataframes
                merged_df = pd.concat(combined_dfs, ignore_index=True)
                cities_df = pd.read_excel('Geo_data_INDIA_all_cities.xlsx')

                # Clean column names
                merged_df.columns = [col.strip().title() for col in merged_df.columns]

                # Filter by category and gender first
                logger.info(f"Filtering for Category: {data['category']} and Gender: {data['gender']}")
                filtered_df = merged_df[(merged_df['Category'] == data['category']) & 
                                     (merged_df['Gender'] == data['gender'])].copy()
                logger.info(f"Rows after category/gender filter: {len(filtered_df)}")

                # Filter by branch if specified
                if data.get('branch_name'):
                    filtered_df = filtered_df[filtered_df['Branch'] == data.get('branch_name')].copy()
                    logger.info(f"Rows after branch filter: {len(filtered_df)}")

                # Get selected city data if Distance option is selected
                if 'Distance' in data.get('options', []):
                    selected_city_data = cities_df[cities_df['City'] == data['city']]
                    if selected_city_data.empty:
                        raise ValueError("Selected city not found in the dataset")
                    selected_city_data = selected_city_data.iloc[0]
                    # Calculate distances
                    filtered_df['Distance_Score'] = filtered_df.apply(
                        lambda row: round(geodesic(
                            (selected_city_data['Latitude'], selected_city_data['Longitude']),
                            (row['Latitude'], row['Longitude'])
                        ).km, 0),
                        axis=1
                    )

                # Process results
                results = []
                for _, row in filtered_df.iterrows():
                    try:
                        result = {
                            'institute': str(row['Institute']),
                            'branch': str(row['Branch']),
                            'closing_rank': int(row['Closing_Rank']),
                            'composite_score': 0
                        }
                        
                        if 'Fees' in data.get('options', []):
                            result['fees'] = int(row['Fees']) if pd.notna(row['Fees']) else 0
                        
                        if 'Distance' in data.get('options', []):
                            result['distance'] = int(row['Distance_Score']) if pd.notna(row['Distance_Score']) else 0
                        
                        if 'NIRF' in data.get('options', []):
                            result['nirf_ranking'] = str(row['Nirf_Ranking']) if pd.notna(row['Nirf_Ranking']) else 0
                        
                        result['composite_score'] = calculate_composite_score(row, data.get('options', []))
                        results.append(result)
                    except Exception as e:
                        logger.error(f"Error processing row: {e}")
                        logger.error(f"Row data: {row}")
                        continue

                # Calculate composite scores
                if results:
                    if len(results) == 1:
                        results[0]['composite_score'] = 10
                    else:
                        min_score = min(result['closing_rank'] for result in results)
                        max_score = max(result['closing_rank'] for result in results)
                        
                        for result in results:
                            normalized_score = (result['closing_rank'] - min_score) / (max_score - min_score)
                            result['composite_score'] = round(10 * (1 - normalized_score), 2)

                        results.sort(key=lambda x: x['composite_score'], reverse=True)

                return JsonResponse({'results': results, 'options': data.get('options', [])})

            except Exception as e:
                logger.error(f"Error processing data: {str(e)}")
                logger.error("Error trace:", exc_info=True)
                return JsonResponse({'error': str(e)}, status=500)

        except Exception as e:
            logger.error(f"Error processing request: {str(e)}")
            return JsonResponse({'error': 'Internal Server Error'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)
