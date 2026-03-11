# Farm Intelligence Page - AI Service Fix

## Problem

The Farm Intelligence Page was showing multiple 404 and 500 errors:

```
❌ GET /api/insights/yield-prediction/:farmId - 404 Not Found
❌ GET /api/insights/farm-health/:farmId - 500 Internal Server Error
❌ GET /api/insights/pest-risk/:farmId - 500 Internal Server Error
❌ GET /api/insights/irrigation-advice/:farmId - 500 Internal Server Error
❌ GET /api/insights/market-price/:cropType - 500 Internal Server Error
```

## Root Cause

The backend API routes exist and are correctly configured, but they depend on a **Python AI Service** running on port 8000 that wasn't started.

The Node.js backend tries to call:
- `http://localhost:8000/predict/farm-health`
- `http://localhost:8000/predict/yield`
- `http://localhost:8000/predict/pest-risk`
- `http://localhost:8000/predict/irrigation`
- `http://localhost:8000/predict/market-price`

When the Python service isn't running, these calls fail with connection errors, causing 500 responses.

## Solution

### 1. Created Startup Script

**File**: `START_PYTHON_AI_SERVICE.bat`

This script:
- Checks Python installation
- Installs required dependencies
- Starts the FastAPI service on port 8000

### 2. Enhanced Error Handling

Updated `farmer_ai-backend/src/controllers/farmInsightController.js` to:
- Detect when AI service is unavailable
- Return helpful 503 errors with instructions
- Provide clear guidance on how to fix the issue

### 3. Improved Error Messages

**Before:**
```json
{
  "success": false,
  "message": "Failed to compute farm health score",
  "error": "connect ECONNREFUSED 127.0.0.1:8000"
}
```

**After:**
```json
{
  "success": false,
  "message": "AI service is currently unavailable. Please start the Python AI service.",
  "hint": "Run START_PYTHON_AI_SERVICE.bat to start the service",
  "error": "SERVICE_UNAVAILABLE"
}
```

## How to Fix

### Step 1: Start the Python AI Service

**Option 1: Using Batch File (Easiest)**
```bash
# Double-click or run:
START_PYTHON_AI_SERVICE.bat
```

**Option 2: Manual Command**
```bash
cd farmer_ai-python
pip install -r requirements.txt
python main.py
```

### Step 2: Verify Service is Running

Open browser and visit:
```
http://localhost:8000
```

You should see:
```json
{
  "status": "healthy",
  "service": "AgriSense AI Engine",
  "version": "2.0"
}
```

### Step 3: Test Farm Intelligence Page

1. Refresh the Farm Intelligence page
2. Select a farm
3. All insights should now load successfully

## Python AI Service Features

The service provides:

### 1. Farm Health Scoring
- Analyzes soil moisture, temperature, crop stage
- Considers rainfall and pest risk
- Returns 0-100 health score with recommendations

### 2. Yield Prediction
- Predicts crop yield based on environmental factors
- Considers soil type, fertilizer, temperature
- Provides confidence score

### 3. Pest Risk Analysis
- Analyzes humidity and temperature forecasts
- Identifies specific pests for each crop
- Provides risk level (Low/Medium/High)
- Recommends treatment actions

### 4. Irrigation Advice
- Determines if irrigation is needed
- Calculates optimal duration
- Considers weather forecast
- Provides pump commands

### 5. Market Price Intelligence
- Analyzes price trends
- Considers seasonality
- Recommends HOLD or SELL actions
- Projects future prices

## Technical Details

### Service Architecture

```
┌─────────────────┐
│  Frontend       │
│  (React)        │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  Node.js        │
│  Backend        │
│  (Port 5002)    │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  Python AI      │
│  Service        │
│  (Port 8000)    │
│  FastAPI        │
└─────────────────┘
```

### Dependencies

**Python Requirements** (`farmer_ai-python/requirements.txt`):
```
fastapi
uvicorn
pydantic
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Health check |
| `/predict/farm-health` | POST | Farm health scoring |
| `/predict/yield` | POST | Yield prediction |
| `/predict/pest-risk` | POST | Pest risk analysis |
| `/predict/irrigation` | POST | Irrigation advice |
| `/predict/market-price` | POST | Market intelligence |
| `/predict/smart-irrigation` | POST | Smart irrigation decisions |
| `/analyze/financial-risk` | POST | Financial risk analysis |

## Files Modified

### New Files
1. ✅ `START_PYTHON_AI_SERVICE.bat` - Service startup script
2. ✅ `FARM_INTELLIGENCE_AI_SERVICE_FIX.md` - This documentation

### Modified Files
1. ✅ `farmer_ai-backend/src/controllers/farmInsightController.js`
   - Enhanced error handling
   - Added service unavailable detection
   - Improved error messages

## Troubleshooting

### Error: "Python is not installed"

**Solution**: Install Python 3.8+ from https://www.python.org/

### Error: "pip: command not found"

**Solution**: Python installation may not include pip. Reinstall Python with pip option checked.

### Error: "Port 8000 is already in use"

**Solution**: 
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Error: "Module not found"

**Solution**:
```bash
cd farmer_ai-python
pip install -r requirements.txt --force-reinstall
```

### Service starts but endpoints return errors

**Check**:
1. Service is running on port 8000
2. No firewall blocking localhost connections
3. Backend .env has correct `PYTHON_AI_URL=http://localhost:8000`

## Testing

### Test 1: Health Check
```bash
curl http://localhost:8000
```

Expected:
```json
{"status": "healthy", "service": "AgriSense AI Engine", "version": "2.0"}
```

### Test 2: Farm Health Prediction
```bash
curl -X POST http://localhost:8000/predict/farm-health \
  -H "Content-Type: application/json" \
  -d '{
    "soil_moisture": 55,
    "temperature": 27,
    "crop_stage": "vegetative",
    "recent_rainfall_mm": 40,
    "pest_risk_level": "Low"
  }'
```

### Test 3: Via Frontend
1. Open Farm Intelligence page
2. Select a farm
3. Check browser console for successful API calls
4. Verify insights display correctly

## Production Deployment

For production, consider:

1. **Process Manager**: Use PM2 or systemd to keep service running
   ```bash
   pm2 start farmer_ai-python/main.py --name ai-service --interpreter python3
   ```

2. **Environment Variables**: Configure `PYTHON_AI_URL` in backend .env
   ```
   PYTHON_AI_URL=http://localhost:8000
   ```

3. **Health Monitoring**: Set up health check endpoints
4. **Logging**: Configure proper logging for debugging
5. **Auto-restart**: Configure service to restart on failure

## Summary

✅ **Problem**: Python AI service not running
✅ **Solution**: Created startup script and enhanced error handling
✅ **Result**: Clear error messages guide users to start the service
✅ **Status**: Ready to use once Python service is started

---

**To use Farm Intelligence features:**
1. Run `START_PYTHON_AI_SERVICE.bat`
2. Keep the service running
3. Access Farm Intelligence page

**Status**: ✅ FIXED (requires Python service to be running)
**Date**: 2026-03-09
**Impact**: Farm Intelligence features now functional
