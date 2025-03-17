import pandas as pd
from django.db import transaction
from .models import Institute, Branch, City
import os
from geopy.distance import geodesic

def get_data_files(institution_type):
    if institution_type == 'IIT':
        return {
            'combined': 'iit_combined.xlsx'
        }
    elif institution_type == 'NIT':
        return {
            'combined': 'nit_combined.xlsx'
        }
    elif institution_type == 'IIIT':
        return {
            'combined': 'iiit_combined.xlsx'
        }
    elif institution_type == 'GFTI':
        return {
            'combined': 'gfti_combined.xlsx'
        }
    return None  # Return None for invalid institution types

# Calculate min/max values considering all institution types
def calculate_min_max_values():
    iit_data = pd.read_excel('iit_combined.xlsx')
    nit_data = pd.read_excel('nit_combined.xlsx')
    iiit_data = pd.read_excel('iiit_combined.xlsx')
    gfti_data = pd.read_excel('gfti_combined.xlsx')

    # Rename fees column for consistency in all dataframes
    iit_data = iit_data.rename(columns={'Fees_2023_per_sem': 'Fees'})
    nit_data = nit_data.rename(columns={'Fees_2023_per_sem': 'Fees'})
    iiit_data = iiit_data.rename(columns={'Fees_2023_per_sem': 'Fees'})
    gfti_data = gfti_data.rename(columns={'Fees_2023_per_sem': 'Fees'})

    min_closing_rank = min(iit_data['Closing_Rank'].min(), nit_data['Closing_Rank'].min(), 
                          iiit_data['Closing_Rank'].min(), gfti_data['Closing_Rank'].min())
    max_closing_rank = max(iit_data['Closing_Rank'].max(), nit_data['Closing_Rank'].max(), 
                          iiit_data['Closing_Rank'].max(), gfti_data['Closing_Rank'].max())
    min_fee = min(iit_data['Fees'].min(), nit_data['Fees'].min(), 
                  iiit_data['Fees'].min(), gfti_data['Fees'].min())
    max_fee = max(iit_data['Fees'].max(), nit_data['Fees'].max(), 
                  iiit_data['Fees'].max(), gfti_data['Fees'].max())

    return min_closing_rank, max_closing_rank, min_fee, max_fee

min_closing_rank, max_closing_rank, min_fee, max_fee = calculate_min_max_values()

@transaction.atomic
def import_data():
    print("Starting data import...")

    # Check if files exist - as a precautionary measure
    files = [
        'iit_combined.xlsx',
        'nit_combined.xlsx',
        'iiit_combined.xlsx',
        'Geo_data_INDIA_all_cities.xlsx'
    ]
    for file in files:
        if not os.path.exists(file):
            print(f"Error: File {file} not found in the current directory.")
            return

    # Read all Excel files
    try:
        print("Reading Excel files...")
        combined_df = pd.read_excel('iit_combined.xlsx')
        cities_df = pd.read_excel('Geo_data_INDIA_all_cities.xlsx')

        print(f"Combined data shape: {combined_df.shape}")
        print(f"Cities data shape: {cities_df.shape}")
    except Exception as e:
        print(f"Error reading Excel files: {str(e)}")
        return
    
    # Extract min and max values for closing_rank and fee
    try:
        min_closing_rank = combined_df['Closing_Rank'].min()
        max_closing_rank = combined_df['Closing_Rank'].max()
        min_fee = combined_df['Fees'].min()
        max_fee = combined_df['Fees'].max()

        print(f"Min Closing Rank: {min_closing_rank}")
        print(f"Max Closing Rank: {max_closing_rank}")
        print(f"Min Fee: {min_fee}")
        print(f"Max Fee: {max_fee}")
    except KeyError as e:
        print(f"Error: Column not found - {str(e)}")
        return
    except Exception as e:
        print(f"Error extracting min and max values: {str(e)}")
        return

    # Importing Institute data with geodata
    print("Importing Institute data...")
    try:
        institutes = []
        for index, row in combined_df.iterrows():
            try:
                institute = Institute(
                    name=row['Institute'],
                    latitude=row['Latitude'],
                    longitude=row['Longitude']
                )
                institute.full_clean()
                institutes.append(institute)
            except Exception as e:
                print(f"Error with institute at index {index}: {str(e)}")
                print(f"Row data: {row}")
        
        Institute.objects.bulk_create(institutes)
        print(f"Created {len(institutes)} institutes")
    except Exception as e:
        print(f"Error creating institutes: {str(e)}")
        return

    # Creating a dictionary of fees
    institute_fees = dict(zip(combined_df['Institute'], combined_df['Fees']))

    # Import Branch data
    print("Importing Branch data...")
    try:
        branches = []
        for index, row in combined_df.iterrows():
            try:
                # Filter to find the correct institute by name
                institutes = Institute.objects.filter(name=row['Institute'])
                
                # Check if the institute exists
                if institutes.exists():
                    # Since we assume institute names are unique, take the first match
                    institute = institutes.first()  

                    # Use the institute to create the branch
                    fee = institute_fees.get(row['Institute'], 0)  # Get fee or default to 0
                    branch = Branch(
                        institute=institute,
                        name=row['Branch'],
                        closing_rank=row['Closing_Rank'],
                        fees=fee
                    )
                    branch.full_clean()
                    branches.append(branch)
                else:
                    print(f"No institute found with name {row['Institute']}")
            except Exception as e:
                print(f"Error with branch at index {index}: {str(e)}")
                print(f"Row data: {row}")
        
        # Bulk create branches after the loop
        Branch.objects.bulk_create(branches)
        print(f"Created {len(branches)} branches")
    except Exception as e:
        print(f"Error creating branches: {str(e)}")
        return


    # For importing City data
    print("Importing City data...")
    try:
        cities = []
        for index, row in cities_df.iterrows():
            try:
                city = City(
                    name=row['City'],
                    latitude=row['Latitude'],
                    longitude=row['Longitude']
                )
                city.full_clean()
                cities.append(city)
            except Exception as e:
                print(f"Error with city at index {index}: {str(e)}")
                print(f"Row data: {row}")
        
        City.objects.bulk_create(cities)
        print(f"Created {len(cities)} cities")
    except Exception as e:
        print(f"Error creating cities: {str(e)}")
        return

    print("Data import completed successfully.")

