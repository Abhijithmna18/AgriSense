# Troubleshooting Guide

## Common Issues and Solutions

### Weather Alerts Page Errors

#### Error: "Failed to load resource: 500 (Internal Server Error)" on weather endpoints

**Symptoms:**
- Weather data not loading
- Forecast not displaying
- Console shows 500 errors for `/api/weather/farm/...` or `/api/weather/forecast`

**Possible Causes:**
1. Farm location data is incomplete or invalid
2. Weather API (Open-Meteo) is temporarily unavailable
3. City name cannot be geocoded

**Solutions:**

1. **Check Farm Location Data:**
   - Ensure farm has valid `district` and `state` in location
   - Or ensure farm has valid GPS coordinates
   - Example valid location:
     ```json
     {
       "district": "Kottayam",
       "state": "Kerala",
       "coordinates": [76.5219, 9.5916]
     }
     ```

2. **Check Backend Logs:**
   - Look for detailed error messages in backend console
   - Check what city name is being sent to weather API
   - Verify if geocoding is successful

3. **Test Weather API Directly:**
   ```bash
   # Test if Open-Meteo API is accessible
   curl "https://api.open-meteo.com/v1/forecast?latitude=9.5916&longitude=76.5219&current=temperature_2m"
   ```

4. **Temporary Workaround:**
   - Kerala weather alert will still show (it's generated client-side)
   - Farm-specific weather will load once API issues are resolved

### Fertilizer Calculator Errors

#### Error: "Failed to load resource: 404 (Not Found)" on soil-data endpoint

**Symptoms:**
- "No soil test data found" message
- Cannot calculate fertilizer requirements
- Console shows 404 error for `/api/fertilizer-calculator/soil-data/...`

**Cause:**
- Selected farm doesn't have soil test data in the database

**Solution:**

1. **Add Soil Test Data:**
   - Navigate to Soil Test page
   - Conduct a soil test for the farm
   - Enter NPK values (Nitrogen, Phosphorus, Potassium)
   - Save the soil test

2. **Use Seeding Script (Development):**
   ```bash
   # If you need sample soil test data
   node farmer_ai-backend/scripts/seedSoilTests.js
   ```

3. **Verify Soil Test Exists:**
   - Check MongoDB for SoilTest collection
   - Ensure soil test is linked to correct farm ID
   - Verify soil test has nitrogen, phosphorus, and potassium values

### API Connection Issues

#### Error: "Failed to load resource: the server responded with a status of 404"

**Symptoms:**
- Multiple 404 errors in console
- APIs not responding
- Features not working

**Possible Causes:**
1. Backend server not running
2. Wrong API base URL
3. Routes not registered properly

**Solutions:**

1. **Check Backend Server:**
   ```bash
   # Ensure backend is running
   cd farmer_ai-backend
   npm start
   # Should see: Server running on port 5002
   ```

2. **Verify API Base URL:**
   - Check `.env` file has correct `VITE_API_URL`
   - Default should be: `http://localhost:5002`
   - Frontend should use: `http://localhost:5002/api`

3. **Check Route Registration:**
   - Verify routes are registered in `server.js`
   - Look for: `app.use('/api/fertilizer-calculator', ...)`
   - Look for: `app.use('/api/weather', ...)`

### Authentication Issues

#### Error: "401 Unauthorized" or "403 Forbidden"

**Symptoms:**
- Redirected to login page
- API calls failing with auth errors
- "Access denied" messages

**Solutions:**

1. **Check Token:**
   ```javascript
   // In browser console
   localStorage.getItem('auth_token')
   localStorage.getItem('token')
   // Should return a JWT token string
   ```

2. **Re-login:**
   - Logout and login again
   - This refreshes the authentication token

3. **Check Token Expiry:**
   - Tokens may expire after certain time
   - Backend logs will show "Token expired" if this is the case

## Debugging Steps

### 1. Check Browser Console
- Open DevTools (F12)
- Go to Console tab
- Look for error messages
- Note the failing API endpoints

### 2. Check Network Tab
- Open DevTools (F12)
- Go to Network tab
- Filter by "Fetch/XHR"
- Click on failed requests
- Check Response tab for error details

### 3. Check Backend Logs
- Look at terminal where backend is running
- Check for error stack traces
- Note any database connection errors
- Verify API endpoints are being hit

### 4. Verify Database
```bash
# Connect to MongoDB
mongosh

# Check if collections exist
use agrisense
show collections

# Check if data exists
db.farms.find().pretty()
db.soiltests.find().pretty()
```

## Quick Fixes

### Reset Everything
```bash
# Stop all servers
# Clear browser cache and localStorage
localStorage.clear()

# Restart backend
cd farmer_ai-backend
npm start

# Restart frontend
cd farmer_ai-frontend
npm run dev
```

### Reseed Database (Development Only)
```bash
cd farmer_ai-backend

# Seed farms
node scripts/seedFarms.js

# Seed soil tests (if script exists)
node scripts/seedSoilTests.js
```

## Getting Help

If issues persist:

1. **Check Documentation:**
   - `FERTILIZER_CALCULATOR_DOCUMENTATION.md`
   - `WEATHER_ALERTS_DEBUGGING.md`
   - `WEATHER_ALERTS_FIX_SUMMARY.md`

2. **Collect Information:**
   - Browser console errors
   - Backend console logs
   - Network tab screenshots
   - Steps to reproduce

3. **Common Patterns:**
   - 404 = Resource not found (check if data exists)
   - 500 = Server error (check backend logs)
   - 401/403 = Auth issue (check token)
   - Network error = Server not running

## Prevention

### Before Using Features:

1. **Weather Alerts:**
   - ✅ Ensure farms have valid location data
   - ✅ Check backend server is running
   - ✅ Verify internet connection (for Open-Meteo API)

2. **Fertilizer Calculator:**
   - ✅ Ensure farms exist
   - ✅ Conduct soil tests for farms
   - ✅ Verify soil test has NPK values
   - ✅ Check backend server is running

3. **General:**
   - ✅ Keep backend server running
   - ✅ Stay logged in
   - ✅ Use supported browsers (Chrome, Firefox, Edge)
   - ✅ Check internet connection
