import csv
import numpy as np

# Define the latitude and longitude ranges and steps
lat_start, lat_end = -90, 90
lon_start, lon_end = 0, 360

# Create the latitude and longitude values
lat_values = np.linspace(lat_start, lat_end, 192)
lon_values = np.linspace(lon_start, lon_end, 288)

# Open a CSV file for writing
with open('lat_lon_grid.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    # Write header
    writer.writerow(['Lat', 'Lon'])

    # Generate and write the latitude-longitude pairs
    for lat in lat_values:
        for lon in lon_values:
            # Round the values to 2 decimal places
            rounded_lat = round(lat, 2)
            rounded_lon = round(lon, 2)
            writer.writerow([rounded_lat, rounded_lon])

print("CSV file created successfully with 55,296 rows and values rounded to 2 decimal places!")
