import csv
import json

input_csv = 'regression_coefficients.csv'  # Replace with your CSV file path
output_json = 'gcm_data_rc.json'  # Replace with your desired JSON file path

data = []

# Read the CSV file
with open(input_csv, mode='r') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    
    # Process each row
    for row in csv_reader:
        # Convert and round the regression coefficient
        lat = float(row['lat'])
        lon = float(row['lon'])
        regression_coefficient = float(row['regression_coefficient'])
        rounded_regression_coefficient =regression_coefficient*(10**(3))
        
        # Add to the data list
        data.append({
            'lat': lat,
            'lon': lon,
            'regression_coefficient': rounded_regression_coefficient
        })

# Write to JSON file
with open(output_json, mode='w') as json_file:
    json.dump({"locations": data},json_file, indent=4)
