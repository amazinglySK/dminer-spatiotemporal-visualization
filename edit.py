import pandas as pd
tempdata=pd.read_csv('gcm_data_tempvalues.csv')
lat_lon=pd.read_csv('lat_lon_grid.csv')

combined=pd.concat([lat_lon, tempdata], axis=1)
print(combined.head())

combined.to_csv('gcm_data_tempvalues.csv', index=False)