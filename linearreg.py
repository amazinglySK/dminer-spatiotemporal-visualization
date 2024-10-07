import pandas as pd
lat_lon=pd.read_csv('lat_lon_grid.csv')
new_data=pd.read_csv('GCM_CESM2_tas_2025_2100_processed_block_maxima.csv')
num_columns = len(new_data.columns)
print(num_columns)
print(new_data.shape)
#result = pd.concat([lat_lon, new_data], axis=1)
#print(result.head())

import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

#new_data=new_data.drop(new_data.columns[0], axis=1)
date_range = pd.date_range(start='2025-01-01', end='2100-12-31', freq='M')
new_column_names = date_range.strftime('%b %Y')
new_data.columns = new_column_names
print(new_data.head())

date_columns = [col for col in new_data.columns]


# Convert the column names (dates) to datetime
dates = pd.to_datetime(date_columns)

# Convert each date to ordinal
ordinal_dates = [date.toordinal() for date in dates]

latitudes = []
longitudes = []
regression_coefficients = []

for _, row in new_data.iterrows():
    measurements = row[date_columns].values
    #dates = np.array(dates).reshape(-1, 1)
    measurements = np.array(measurements)
    dates=np.array([i for i in range(len(measurements))])
    dates = np.array(dates).reshape(-1, 1)

    #print(dates)
    model = LinearRegression().fit(dates, measurements)
    regression_coefficients.append(model.coef_[0])
print(len(regression_coefficients),len(lat_lon['lat']),len(lat_lon['lon']))
results_df = pd.DataFrame({ 
    'lat': lat_lon['lat'],
    'lon': lat_lon['lon'],
    'regression_coefficient': regression_coefficients
})
print(results_df.head())

new_data.to_csv('gcm_data_tempvalues.csv', index=False)
results_df.to_csv('regression_coefficients.csv', index=False)
  