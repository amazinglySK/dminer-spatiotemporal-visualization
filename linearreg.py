import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

#new_data=new_data.drop(new_data.columns[0], axis=1)
date_range = pd.date_range(start='2025-01-01', end='2100-12-31', freq='M')
new_column_names = date_range.strftime('%b %Y')

# Load fils
new_data=pd.read_csv('GCM_CESM2_SSP585_pr_2025_2100_processed_block_maxima.csv', header = None)
lat_lon=pd.read_csv('GCM_lat_lon.csv')

# Change column headings
new_data.columns = new_column_names
lat_lon.columns = ['lat', 'lon']

print(new_data.head())
print(new_data.shape)

print(lat_lon.head())
print(lat_lon.shape)

date_columns = [col for col in new_data.columns]


# Convert the column names (dates) to datetime
dates = pd.to_datetime(date_columns)

# Convert each date to ordinal
ordinal_dates = [date.toordinal() for date in dates]

latitudes = []
longitudes = []
regression_coefficients = []

# Perform linear regression
for _, row in new_data.iterrows():
    measurements = row[date_columns].values
    #dates = np.array(dates).reshape(-1, 1)
    measurements = np.array(measurements)
    dates=np.array([i for i in range(len(measurements))])
    dates = np.array(dates).reshape(-1, 1)

    #print(dates)
    model = LinearRegression().fit(dates, measurements)
    regression_coefficients.append(model.coef_[0])

results_df = pd.Dat`aFrame({ 
    'lat': lat_lon['lat'],
    'lon': lat_lon['lon'],
    'regression_coefficient': regression_coefficients
})
print(results_df.head())

results_df.to_csv('gcm_pr_regression_coefficients.csv', index=False)

final_values = pd.concat([lat_lon, new_data], axis = 1)
final_values.to_csv('gcm_data_precvalues.csv', index=False)