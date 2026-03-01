# Weather Alerts Page - Debugging Guide

## Current Status

The Weather Alerts page has been fixed with the following improvements:

### Fixed Issues:
1. ✅ Authentication - Added `useAuth` hook and proper user/logout props
2. ✅ Farm fetching - Enhanced to handle multiple API response formats
3. ✅ Weather data fetching - Added comprehensive logging
4. ✅ Error handling - Better error messages and fallbacks

## How It Should Work

### 1. Page Load
When you navigate to `/weather-alerts`:
1. Page fetches all farms for the logged-in user
2. Automatically selects the first farm
3. Fetches weather data for that farm
4. Displays Kerala-specific weather alert (always visible)
5. Shows current weather conditions
6. Shows 5-day forecast

### 2. Farm Selection
When you select a different farm from the dropdown:
1. Fetches weather data for the new farm location
2. Updates current weather display
3. Updates forecast for the new location
4. Checks for weather alerts specific to that farm

### 3. Check All Farms Button
When you click "Check All Farms":
1. Backend checks weather conditions for all your farms
2. Generates alerts if conditions are unfavorable
3. Sends notifications if needed
4. Shows summary of alerts sent

## Debugging Steps

### Step 1: Check Browser Console
Open the Weather Alerts page and check the browser console (F12) for these logs:

```
Farms API response: {...}
Parsed farms list: [...]
Fetching weather for farm: <farmId>
Weather API response: {...}
Found farm for forecast: {...}
Fetching forecast for city: <city>
Forecast API response: {...}
```

### Step 2: Verify Farm Data Structure
Your farms should have this structure:
```json
{
  "_id": "farm123",
  "name": "My Farm",
  "location": {
    "district": "Kottayam",
    "state": "Kerala",
    "coordinates": [76.5, 9.5]  // [longitude, latitude]
  }
}
```

### Step 3: Check API Endpoints
Verify these endpoints are working:

1. **Get Farms**: `GET /api/farms`
   - Should return array of farms
   - Check: `response.data` or `response.data.data`

2. **Get Weather for Farm**: `GET /api/weather/farm/:farmId`
   - Should return current weather data
   - Check: `response.data.data` contains weather info

3. **Get Forecast**: `GET /api/weather/forecast?city=Kottayam, Kerala`
   - Should return 7-day forecast
   - Check: `response.data.data` is an array

### Step 4: Common Issues and Solutions

#### Issue: "No Farms Added Yet" message
**Possible Causes:**
- Farms API returning empty array
- Farms in different response structure
- Authentication token missing/invalid

**Solution:**
Check console logs for "Farms API response" and "Parsed farms list"

#### Issue: Weather data not loading
**Possible Causes:**
- Farm doesn't have location data
- Weather API endpoint not responding
- Invalid coordinates or city name

**Solution:**
Check console logs for "Weather API response" and error messages

#### Issue: Forecast not showing
**Possible Causes:**
- Farm location missing district/state
- Forecast API endpoint failing
- City name format incorrect

**Solution:**
Check console logs for "Fetching forecast for city" and "Forecast API response"

## Expected Console Output (Success)

```
Farms API response: {success: true, data: [{...}]}
Parsed farms list: [{_id: "...", name: "...", location: {...}}]
Fetching weather for farm: 65f8a9b2c3d4e5f6a7b8c9d0
Weather API response: {success: true, data: {temp: 28, humidity: 75, ...}}
Found farm for forecast: {_id: "...", name: "My Farm", location: {...}}
Fetching forecast for city: Kottayam, Kerala
Forecast API response: {success: true, data: [{date: "...", temp_max: 32, ...}]}
```

## Expected Console Output (Errors)

### No Farms
```
Farms API response: {success: true, data: []}
Parsed farms list: []
```
**Action:** Add farms using the "Add Your First Farm" button

### Weather API Error
```
Fetching weather for farm: 65f8a9b2c3d4e5f6a7b8c9d0
Failed to fetch weather: Error: Request failed with status code 500
Error details: {success: false, message: "Failed to fetch weather data"}
```
**Action:** Check backend weather API service and Open-Meteo API

### Forecast API Error
```
Fetching forecast for city: undefined, undefined
Failed to fetch weather: Error: Request failed with status code 400
```
**Action:** Ensure farm has valid location.district and location.state

## Testing Checklist

- [ ] Navigate to Weather Alerts page
- [ ] Check browser console for logs
- [ ] Verify farms are loaded in dropdown
- [ ] Select a farm and verify weather loads
- [ ] Check Kerala alert is always visible
- [ ] Verify current weather shows correct data
- [ ] Expand forecast section and verify 5-day forecast
- [ ] Click "Check All Farms" button
- [ ] Verify no authentication errors
- [ ] Check TopBar shows correct user info

## API Response Examples

### Successful Farm Fetch
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f8a9b2c3d4e5f6a7b8c9d0",
      "name": "Cheruvally Farm",
      "location": {
        "district": "Kottayam",
        "state": "Kerala",
        "coordinates": [76.5219, 9.5916]
      },
      "size": 5,
      "soilType": "Black"
    }
  ]
}
```

### Successful Weather Fetch
```json
{
  "success": true,
  "farm": {
    "id": "65f8a9b2c3d4e5f6a7b8c9d0",
    "name": "Cheruvally Farm"
  },
  "data": {
    "temp": 28,
    "feels_like": 30,
    "humidity": 75,
    "wind_speed": 3.5,
    "rain_1h": 0,
    "cloud_cover": 40,
    "uv_index": 6,
    "description": "Partly cloudy",
    "alerts": [
      {
        "type": "info",
        "message": "Favorable conditions for farming"
      }
    ]
  }
}
```

### Successful Forecast Fetch
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-03-02",
      "temp_max": 32,
      "temp_min": 24,
      "rain_mm": 2,
      "description": "Light rain"
    },
    // ... 6 more days
  ]
}
```

## Next Steps

1. Open Weather Alerts page
2. Open browser console (F12)
3. Look for the console logs mentioned above
4. Share any error messages you see
5. Verify the farm data structure matches expected format

## Support

If issues persist:
1. Check backend server is running on port 5002
2. Verify weather API service is configured
3. Check database has farm records with valid location data
4. Ensure authentication token is valid
