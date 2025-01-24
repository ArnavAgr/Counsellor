import pandas as pd
from django.db import transaction
from .models import Institute, Branch, City
import os
from geopy.distance import geodesic

orcr_df = pd.read_excel('combined_ORCR.xlsx')
fee_df = pd.read_excel('combined_fee.xlsx')
geodata_df = pd.read_excel('combined_geodata_college.xlsx')
cities_df = pd.read_excel('Geo_data_INDIA_all_cities.xlsx')

min_closing_rank = orcr_df['Closing_Rank'].min()
max_closing_rank = orcr_df['Closing_Rank'].max()
min_fee = fee_df['Fees_2023_per_sem'].min()
max_fee = fee_df['Fees_2023_per_sem'].max()

@transaction.atomic
def import_data():
    print("Starting data import...")

    # Check if files exist - as a precautionary measure
    files = ['combined_ORCR.xlsx', 'combined_fee.xlsx', 'combined_geodata_college.xlsx', 'Geo_data_INDIA_all_cities.xlsx']
    for file in files:
        if not os.path.exists(file):
            print(f"Error: File {file} not found in the current directory.")
            return

    # Read all Excel files
    try:
        print("Reading Excel files...")
        orcr_df = pd.read_excel('combined_ORCR.xlsx')
        fee_df = pd.read_excel('combined_fee.xlsx')
        geodata_df = pd.read_excel('combined_geodata_college.xlsx')
        cities_df = pd.read_excel('Geo_data_INDIA_all_cities.xlsx')

        print(f"ORCR data shape: {orcr_df.shape}")
        print(f"Fee data shape: {fee_df.shape}")
        print(f"Geodata shape: {geodata_df.shape}")
        print(f"Cities data shape: {cities_df.shape}")
    except Exception as e:
        print(f"Error reading Excel files: {str(e)}")
        return
    
    # Extract min and max values for closing_rank and fee
    try:
        min_closing_rank = orcr_df['Closing_Rank'].min()
        max_closing_rank = orcr_df['Closing_Rank'].max()
        min_fee = fee_df['Fees_2023_per_sem'].min()
        max_fee = fee_df['Fees_2023_per_sem'].max()

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
        for index, row in geodata_df.iterrows():
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
    institute_fees = dict(zip(fee_df['Institute'], fee_df['Fees_2023_per_sem']))

    # Import Branch data
    print("Importing Branch data...")
    try:
        branches = []
        for index, row in orcr_df.iterrows():
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

