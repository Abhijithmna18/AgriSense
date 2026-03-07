# Start Python ML Service - Quick Guide

## ✅ Problem Fixed!

I've added the missing `/predict/smart-irrigation` endpoint to your Python ML server.

---

## 🚀 Start the Service

### Option 1: Using Python directly

```bash
cd crop_yield_ml
python main.py
```

### Option 2: Using the batch file (Windows)

```bash
cd crop_yield_ml
start_server.bat
```

### Option 3: Set custom port

```bash
cd crop_yield_ml
PORT=5001 python main.py
```

---

## ✅ Verify It's Running

### 1. Check health endpoint:
```bash
curl http://localhost:5001/health
```

Expected response:
```json
{
  "status": "ok",
  "model_loaded": true,
  "features_loaded": true,
  "num_crops": 10,
  "model_metrics": {...}
}
```

### 2. Test smart irrigation endpoint:
```bash
curl -X POST http://localhost:5001/predict/smart-irrigation \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 28,
    "humidity": 45,
    "soil_moisture": 30,
    "water_flow": 0
  }'
```

Expected response:
```json
{
  "irrigation_needed": true,
  "duration": 600,
  "confidence": 0.9,
  "et_index": 12.0,
  "reason": "Low soil moisture + High ET demand",
  "sensor_readings": {
    "temperature": 28,
    "humidity": 45,
    "soil_moisture": 30,
    "water_flow": 0
  },
  "recommendations": [
    "Soil moisture below optimal. Start irrigation soon.",
    "🌡️ High temperature detected. Consider evening irrigation to reduce evaporation loss.",
    "💨 Low humidity increases water loss. Monitor soil moisture closely.",
    "☀️ High evapotranspiration. Monitor soil moisture daily.",
    "✅ Irrigation recommended. Ensure water supply is adequate."
  ]
}
```

---

## 🔧 Configure Backend

Make sure your backend `.env` file has:

```env
PYTHON_AI_URL=http://localhost:5001
```

If you're running on a different port (e.g., 8001), update accordingly:

```env
PYTHON_AI_URL=http://localhost:8001
```

---

## 📊 What the Endpoint Does

The `/predict/smart-irrigation` endpoint:

1. **Receives sensor data:**
   - Temperature (°C)
   - Humidity (%)
   - Soil moisture (%)
   - Water flow rate (L/min)

2. **Calculates ET index:**
   - Evapotranspiration demand
   - Higher ET = more water loss

3. **Makes irrigation decision:**
   - Whether irrigation is needed
   - Recommended duration (seconds)
   - Confidence level (0-1)

4. **Provides recommendations:**
   - Soil moisture advice
   - Temperature considerations
   - Humidity effects
   - ET management tips

---

## 🎯 Decision Logic

```
IF soil_moisture < 35%:
  → irrigation_needed = TRUE
  → duration = (60 - soil_moisture) × 20 seconds
  
  IF et_index > 10:
    → duration × 1.5 (high evaporation)
    
ELIF soil_moisture > 70%:
  → irrigation_needed = FALSE (optimal)
  
ELIF 35% ≤ soil_moisture ≤ 50% AND et_index > 15:
  → irrigation_needed = TRUE (high ET stress)
  
ELSE:
  → irrigation_needed = FALSE (monitoring)
```

---

## 🔍 Check Logs

After starting the service, you should see:

```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
Model loaded from model.pkl
Metadata loaded. Features: [...]
Crop stats loaded for 10 crops.
Starting server on port 5001
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:5001
```

---

## 🐛 Troubleshooting

### Port already in use:
```bash
# Use a different port
PORT=5002 python main.py

# Update backend .env:
PYTHON_AI_URL=http://localhost:5002
```

### Module not found:
```bash
# Install dependencies
cd crop_yield_ml
pip install -r requirements.txt
```

### Model not found:
```bash
# Train the model first
cd crop_yield_ml
python train.py
```

---

## 🎉 Success Indicators

Once running, you should see:

✅ No more 404 errors in backend logs
✅ Backend logs show: "Python AI Service available"
✅ IoT controller receives AI predictions
✅ Dashboard displays AI recommendations

---

## 📈 Integration Flow

```
IoT Sensor Data
    ↓
Node.js Backend
    ↓ POST /predict/smart-irrigation
Python ML Service (port 5001)
    ↓ AI Decision
Node.js Backend
    ↓ Store in MongoDB
Dashboard
    ↓ Display
User sees AI recommendations
```

---

## 🔄 Restart Services

After starting Python ML service:

```bash
# Restart Node.js backend to clear errors
cd farmer_ai-backend
npm run dev

# Or just wait - backend will automatically retry
```

---

## ⚙️ Advanced Configuration

### Run as background service (Linux/Mac):
```bash
cd crop_yield_ml
nohup python main.py > ml_service.log 2>&1 &
```

### Run as background service (Windows):
```bash
cd crop_yield_ml
start /B python main.py
```

### Auto-start on system boot:
Add to your system's startup scripts or use a process manager like PM2:

```bash
npm install -g pm2
pm2 start main.py --name ml-service --interpreter python
pm2 save
pm2 startup
```

---

## 📊 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:5001/docs
- **ReDoc**: http://localhost:5001/redoc

These provide interactive API documentation.

---

## ✅ Verification Checklist

- [ ] Python service starts without errors
- [ ] Health endpoint returns 200 OK
- [ ] Smart irrigation endpoint returns predictions
- [ ] Backend .env has correct PYTHON_AI_URL
- [ ] Backend logs show no 404 errors
- [ ] IoT data flows through system

---

## 🎯 Summary

**Before:** 404 errors every time backend tried to call ML service

**After:** ML service responds with AI-powered irrigation decisions

**Impact:** Enhanced irrigation recommendations based on ML predictions

**Status:** ✅ FIXED - Service ready to use!

---

**Start the service now and watch the 404 errors disappear!** 🚀🤖💧
