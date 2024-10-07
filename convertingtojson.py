import csv
import json

# File paths
temperature_file = 'gcm_data_tempvalues.csv'
lat_lon='lat_lon_grid.csv'
output_json_file = 'gcm_temp_values.json'

# Read lat/lon data
lat_lon_data = []
with open(lat_lon, 'r') as file:
    reader = csv.DictReader(file)
    for row in reader:
        lat_lon_data.append({
            "lat": float(row['lat']),
            "lon": float(row['lon']),
        })

# Read temperature data and combine with lat/lon
with open(temperature_file, 'r') as file:
    reader = csv.DictReader(file)
    for i, row in enumerate(reader):
        if i < len(lat_lon_data):
            lat_lon_data[i]['ta'] = {k: float(v) for k, v in row.items()}

# Write combined data to JSON
with open(output_json_file, 'w') as file:
    json.dump({"locations": lat_lon_data}, file, indent=4)

print("CSV files have been successfully converted to JSON!")
