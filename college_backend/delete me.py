import pandas as pd

# Load data from the Excel files
orcr_df = pd.read_excel('nit_orcr.xlsx')
fee_df = pd.read_excel('nit_fee.xlsx')
geo_df = pd.read_excel('nit_geodata.xlsx')

# Merge fee data with orcr data
combined_df = pd.merge(orcr_df, fee_df, on='Institute', how='left')

# Merge geographical data with the previously combined data
combined_df = pd.merge(combined_df, geo_df, on='Institute', how='left')

# Save the combined data to a new Excel file
combined_df.to_excel('combined_nit_data.xlsx', index=False)