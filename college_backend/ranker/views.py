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

def calculate_min_max_values():
    try:
        # Load all data files
        iit_data = pd.read_excel('iit_combined.xlsx')
        nit_data = pd.read_excel('nit_combined.xlsx')
        iiit_data = pd.read_excel('iiit_combined.xlsx')
        gfti_data = pd.read_excel('gfti_combined.xlsx')

        # Print column names for debugging
        logger.info(f"IIT data columns: {iit_data.columns.tolist()}")
        logger.info(f"NIT data columns: {nit_data.columns.tolist()}")
        logger.info(f"IIIT data columns: {iiit_data.columns.tolist()}")
        logger.info(f"GFTI data columns: {gfti_data.columns.tolist()}")

        # Ensure all dataframes have consistent column names
        for df in [iit_data, nit_data, iiit_data, gfti_data]:
            if 'Fees_2023_per_sem' in df.columns:
                df.rename(columns={'Fees_2023_per_sem': 'Fees'}, inplace=True)

        # Calculate all metrics
        min_closing_rank = min(df['Closing_Rank'].min() for df in [iit_data, nit_data, iiit_data, gfti_data])
        max_closing_rank = max(df['Closing_Rank'].max() for df in [iit_data, nit_data, iiit_data, gfti_data])
        min_fee = min(df['Fees'].min() for df in [iit_data, nit_data, iiit_data, gfti_data])
        max_fee = max(df['Fees'].max() for df in [iit_data, nit_data, iiit_data, gfti_data])
        
        # Use exact column names for placement data
        min_highest_package = min(df['Highest_Package'].min() for df in [iit_data, nit_data, iiit_data, gfti_data])
        max_highest_package = max(df['Highest_Package'].max() for df in [iit_data, nit_data, iiit_data, gfti_data])
        min_avg_package = min(df['Average_Package'].min() for df in [iit_data, nit_data, iiit_data, gfti_data])
        max_avg_package = max(df['Average_Package'].max() for df in [iit_data, nit_data, iiit_data, gfti_data])
        min_placement = min(df['Placement_Percentage'].min() for df in [iit_data, nit_data, iiit_data, gfti_data])
        max_placement = max(df['Placement_Percentage'].max() for df in [iit_data, nit_data, iiit_data, gfti_data])

        return (min_closing_rank, max_closing_rank, min_fee, max_fee, 
                min_highest_package, max_highest_package, min_avg_package, 
                max_avg_package, min_placement, max_placement)

    except Exception as e:
        logger.error(f"Error calculating min/max values: {str(e)}")
        logger.error("DataFrame columns:")
        for name, df in [("IIT", iit_data), ("NIT", nit_data), ("IIIT", iiit_data), ("GFTI", gfti_data)]:
            logger.error(f"{name} columns: {df.columns.tolist()}")
        raise

# Update the global variables with all values
(min_closing_rank, max_closing_rank, min_fee, max_fee, 
 min_highest_package, max_highest_package, min_avg_package, 
 max_avg_package, min_placement, max_placement) = calculate_min_max_values()

def calculate_composite_score(branch, options, use_custom_weights=False, custom_weights=None):
    weights = {
        'rank': 0.7,
        'fees': 0.3,
        'distance': 0.2,
        'nirf': 0.4,
        'highest_package': 0.3,
        'average_package': 0.3,
        'placement_percentage': 0.3
    } if not use_custom_weights else custom_weights

    # Calculate individual scores (all normalized to 0-10 range)
    rank_score = 10 * (1 - ((branch['Closing_Rank'] - min_closing_rank) / (max_closing_rank - min_closing_rank)))
    
    # Initialize additional scores
    fee_score = distance_score = nirf_score = highest_package_score = avg_package_score = placement_score = 0

    # Calculate scores for selected options
    if 'Fees' in options:
        fee_score = 10 * (1 - ((branch['Fees'] - min_fee) / (max_fee - min_fee)))
    if 'Distance' in options:
        distance_score = branch['Distance_Score']
    if 'NIRF' in options:
        nirf_score = branch['Nirf_Weightage']
    if 'Highest_Package' in options:
        highest_package_score = 10 * ((branch['Highest_Package'] - min_highest_package) / (max_highest_package - min_highest_package))
    if 'Average_Package' in options:
        avg_package_score = 10 * ((branch['Average_Package'] - min_avg_package) / (max_avg_package - min_avg_package))
    if 'Placement_Percentage' in options:
        placement_score = 10 * (branch['Placement_Percentage'] / 100)  # Assuming percentage is 0-100

    # Calculate weighted sum with all options
    total_score = weights['rank'] * rank_score
    total_weight = weights['rank']

    # Add scores for selected options
    option_scores = {
        'Fees': (weights['fees'], fee_score),
        'Distance': (weights['distance'], distance_score),
        'NIRF': (weights['nirf'], nirf_score),
        'Highest_Package': (weights['highest_package'], highest_package_score),
        'Average_Package': (weights['average_package'], avg_package_score),
        'Placement_Percentage': (weights['placement_percentage'], placement_score)
    }

    for option in options:
        if option in option_scores:
            weight, score = option_scores[option]
            total_score += weight * score
            total_weight += weight

    # Normalize final score
    normalized_score = (total_score / total_weight) if total_weight > 0 else rank_score
    normalized_score = max(1, min(10, normalized_score))
    
    return round(normalized_score, 10)

def calculate_distance_scores(distances):
    """Convert raw distances to scores where shorter distances get higher scores"""
    if not distances:
        return []
        
    max_dist = max(distances)
    min_dist = min(distances)
    
    # If all distances are the same, return maximum score for all
    if max_dist == min_dist:
        return [10] * len(distances)
    
    # Invert the normalization so shorter distances get higher scores
    return [10 * (1 - (distance - min_dist) / (max_dist - min_dist)) for distance in distances]

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
            
            # Validate weights if using custom weights
            if data.get('useCustomWeights'):
                weights = data.get('weights', {})
                total_weight = sum(weights.values())
                if abs(total_weight - 1) > 0.01:  # Using 0.01 to account for floating point precision
                    return JsonResponse({
                        'error': f'The sum of weights must equal 1. Current sum: {total_weight:.2f}'
                    }, status=400)
            
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
                
                # NEW: Filter for NIT rows based on home_state if provided
                if data.get('home_state'):
                    home_state = data.get('home_state')
                    filtered_dfs = []
                    for df in combined_dfs:
                        if 'State' in df.columns and 'State_Quota' in df.columns:
                            # For rows matching home_state, pick HS; for others, pick OS
                            df_filtered = df[((df['State'] == home_state) & (df['State_Quota'] == "HS")) | 
                                             ((df['State'] != home_state) & (df['State_Quota'] == "OS"))]
                            filtered_dfs.append(df_filtered)
                        else:
                            filtered_dfs.append(df)
                    combined_dfs = filtered_dfs
                
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

                # Apply filters before calculating scores
                # Filter by fees if option is selected
                if 'Fees' in data.get('options', []):
                    max_fees = float(data.get('max_fees', float('inf')))
                    logger.info(f"Filtering by max fees: {max_fees}")
                    before_fees = len(filtered_df)
                    filtered_df = filtered_df[filtered_df['Fees'] <= max_fees]
                    logger.info(f"Removed {before_fees - len(filtered_df)} colleges due to fees filter")

                # Calculate and filter by distance if option is selected
                if 'Distance' in data.get('options', []):
                    selected_city_data = cities_df[cities_df['City'] == data['city']]
                    if selected_city_data.empty:
                        raise ValueError("Selected city not found in the dataset")
                    selected_city_data = selected_city_data.iloc[0]
                    
                    # Calculate raw distances first
                    filtered_df['Distance'] = filtered_df.apply(
                        lambda row: round(geodesic(
                            (selected_city_data['Latitude'], selected_city_data['Longitude']),
                            (row['Latitude'], row['Longitude'])
                        ).km, 0),
                        axis=1
                    )
                    
                    # Apply distance filter
                    max_distance = float(data.get('max_distance', float('inf')))
                    logger.info(f"Filtering by max distance: {max_distance}")
                    before_distance = len(filtered_df)
                    filtered_df = filtered_df[filtered_df['Distance'] <= max_distance]
                    logger.info(f"Removed {before_distance - len(filtered_df)} colleges due to distance filter")
                    
                    # Calculate distance scores for remaining colleges
                    if len(filtered_df) > 0:
                        distances = filtered_df['Distance'].tolist()
                        distance_scores = calculate_distance_scores(distances)
                        filtered_df['Distance_Score'] = distance_scores

                # Calculate distances if needed for display or ranking
                if ('Distance' in data.get('options', []) or 'Distance' in data.get('displayOptions', [])) and data.get('city'):
                    selected_city_data = cities_df[cities_df['City'] == data['city']]
                    if selected_city_data.empty:
                        raise ValueError("Selected city not found in the dataset")
                    selected_city_data = selected_city_data.iloc[0]
                    
                    # Calculate raw distances
                    filtered_df['Distance'] = filtered_df.apply(
                        lambda row: round(geodesic(
                            (selected_city_data['Latitude'], selected_city_data['Longitude']),
                            (row['Latitude'], row['Longitude'])
                        ).km, 0),
                        axis=1
                    )
                    
                    # Calculate distance scores only if Distance is in ranking options
                    if 'Distance' in data.get('options', []):
                        distances = filtered_df['Distance'].tolist()
                        distance_scores = calculate_distance_scores(distances)
                        filtered_df['Distance_Score'] = distance_scores
                        
                        # Apply distance filter if max_distance is specified
                        if 'max_distance' in data:
                            max_distance = float(data['max_distance'])
                            filtered_df = filtered_df[filtered_df['Distance'] <= max_distance]

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
                        
                        # Add fields based on both ranking options and display options
                        all_options = set(data.get('options', []) + data.get('displayOptions', []))
                        
                        if 'Fees' in all_options:
                            result['fees'] = int(row['Fees']) if pd.notna(row['Fees']) else 0
                        
                        if 'Distance' in all_options:
                            result['distance'] = int(row['Distance']) if pd.notna(row['Distance']) else 0
                        
                        if 'NIRF' in all_options:
                            result['nirf_ranking'] = str(row['Nirf_Ranking']) if pd.notna(row['Nirf_Ranking']) else "Unranked"
                        
                        if 'Highest_Package' in all_options:
                            result['highest_package'] = float(row['Highest_Package']) if pd.notna(row['Highest_Package']) else 0
                        
                        if 'Average_Package' in all_options:
                            result['average_package'] = float(row['Average_Package']) if pd.notna(row['Average_Package']) else 0
                        
                        if 'Placement_Percentage' in all_options:
                            result['placement_percentage'] = float(row['Placement_Percentage']) if pd.notna(row['Placement_Percentage']) else 0
                        
                        # Calculate composite score using only ranking options
                        result['composite_score'] = calculate_composite_score(
                            row, 
                            data.get('options', []),
                            data.get('useCustomWeights', False),
                            data.get('weights')
                        )
                        results.append(result)
                        
                    except Exception as e:
                        logger.error(f"Error processing row: {e}")
                        logger.error(f"Row data: {row}")
                        continue

                # Normalize all composite scores to 0-10 range
                if results:
                    # Get min and max scores
                    min_score = min(result['composite_score'] for result in results)
                    max_score = max(result['composite_score'] for result in results)
                    
                    # Normalize scores only if there's more than one result
                    if len(results) > 1:
                        for result in results:
                            # Apply min-max normalization to scale between 0 and 10
                            result['composite_score'] = round(
                                10 * (result['composite_score'] - min_score) / (max_score - min_score)
                                if max_score != min_score
                                else 10,  # If all scores are the same, assign 10
                                3
                            )
                    else:
                        # If there's only one result, give it a score of 10
                        results[0]['composite_score'] = 10

                    # Sort results by normalized composite score
                    results.sort(key=lambda x: (x['composite_score'], -x['closing_rank']), reverse=True)

                return JsonResponse({'results': results, 'options': data.get('options', [])})

            except Exception as e:
                logger.error(f"Error processing data: {str(e)}")
                logger.error("Error trace:", exc_info=True)
                return JsonResponse({'error': str(e)}, status=500)

        except Exception as e:
            logger.error(f"Error processing request: {str(e)}")
            return JsonResponse({'error': 'Internal Server Error'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)
