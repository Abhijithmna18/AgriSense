# Troubleshooting Guide - Leaf Validation System

## Quick Diagnosis

Run this command to check all services:
```bash
CHECK_SERVICES.bat
```

This will tell you which services are running and which need to be started.

---

## Common Errors and Solutions

### Error 1: 404 on `/api/ml/validate-leaf`

**Error Message:**
```
Failed to load resource: the server responded with a status of 404 (Not Found)
:5002/api/ml/validate-leaf:1
```

**Cause:** Backend server not restarted after code changes

**Solution:**
1. Stop backend server (Ctrl+C in its terminal)
2. Restart backend:
   ```bash
   cd farmer_ai-backend
   npm start
   ```
3. Wait for: "Server running on port 5000"
4. Refresh browser

---

### Error 2: `toast.warning is not a function`

**Error Message:**
```
Uncaught (in promise) TypeError: toast.warning is not a function
at validateImage (DiseasePredictionPage.jsx:101:19)
```

**Cause:** Code used wrong toast method

**Solution:** ✅ Already fixed in code (pushed to GitHub)
- Changed `toast.warning` to `toast.error`
- Pull latest changes: `git pull origin main`
- Refresh browser with Ctrl+F5

---

### Error 3: ML Service Connection Refused

**Error Message:**
```
Machine Learning service is currently unavailable
ECONNREFUSED
```

**Cause:** Python ML service not running

**Solution:**
1. Start ML service:
   ```bash
   cd plant_disease_ml
   python main.py
   ```
2. Wait for: "Model loaded successfully on cpu"
3. Test: `curl http://localhost:8000/health`

---

### Error 4: Temp Directory Missing

**Error Message:**
```
ENOENT: no such file or directory, open 'uploads/temp/...'
```

**Cause:** Multer temp directory doesn't exist

**Solution:**
```bash
mkdir farmer_ai-backend\uploads\temp
```

Or run: `CHECK_SERVICES.bat` (creates it automatically)

---

### Error 5: Port Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Cause:** Another process using the port

**Solution:**

**Option 1: Find and kill the process**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use Task Manager
```

**Option 2: Use different port**
```bash
# In farmer_ai-backend/.env
PORT=5001
```

---

### Error 6: Module Not Found

**Error Message:**
```
Error: Cannot find module 'form-data'
```

**Cause:** Missing npm packages

**Solution:**
```bash
cd farmer_ai-backend
npm install
```

---

### Error 7: Python Module Not Found

**Error Message:**
```
ModuleNotFoundError: No module named 'leaf_validator'
```

**Cause:** Missing Python packages or wrong directory

**Solution:**
```bash
cd plant_disease_ml
pip install -r requirements.txt
```

---

## Step-by-Step Restart Procedure

### Method 1: Automated (Recommended)

```bash
# Check status first
CHECK_SERVICES.bat

# Restart all services
RESTART_ALL_SERVICES.bat
```

### Method 2: Manual

**Step 1: Stop All Services**
- In each terminal, press Ctrl+C

**Step 2: Start ML Service**
```bash
cd plant_disease_ml
python main.py
```
Wait for: "Model loaded successfully"

**Step 3: Start Backend**
```bash
cd farmer_ai-backend
npm start
```
Wait for: "Server running on port 5000"

**Step 4: Frontend Auto-Reloads**
- Should reload automatically
- If not, refresh browser (Ctrl+F5)

---

## Verification Checklist

After restarting, verify each service:

### 1. ML Service (Port 8000)
```bash
curl http://localhost:8000/health
```
**Expected:**
```json
{
  "status": "ok",
  "model_loaded": true,
  "num_classes": 38,
  "device": "cpu"
}
```

### 2. Backend (Port 5000)
```bash
curl http://localhost:5000/api/ml/health
```
**Expected:**
```json
{
  "success": true,
  "mlService": {
    "status": "online"
  }
}
```

### 3. Frontend (Port 5173)
Open browser: http://localhost:5173
- Should load without errors
- Navigate to Disease Detection page

### 4. Validation Endpoint
```bash
# Create a test image first, then:
curl -X POST http://localhost:5000/api/ml/validate-leaf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_image.jpg"
```

---

## Browser Testing

### Test 1: Upload Face Image

1. Go to Disease Detection page
2. Upload a face photo
3. **Expected:**
   - ❌ Invalid Image
   - Message: "Image appears to contain a human face..."
   - Diagnosis button: DISABLED
   - No 404 errors in console
   - No toast.warning errors

### Test 2: Upload Leaf Image

1. Remove face image
2. Upload a plant leaf photo
3. **Expected:**
   - ✅ Leaf Detected
   - Confidence: 80-95%
   - Diagnosis button: ENABLED
   - No errors in console

---

## Console Errors to Ignore

These are safe to ignore:

```
DevTools failed to load source map
```
- Not related to validation system

```
[HMR] Waiting for update signal from WDS...
```
- Normal Vite/Webpack behavior

---

## When to Restart Each Service

### Restart ML Service When:
- Changed `leaf_validator.py`
- Changed `main.py`
- Updated Python packages
- Getting ECONNREFUSED errors

### Restart Backend When:
- Changed `diseaseRoutes.js`
- Changed `server.js`
- Updated npm packages
- Getting 404 errors on new routes

### Restart Frontend When:
- Changed React components
- Updated npm packages
- Getting stale code errors
- (Usually auto-reloads)

---

## Environment Variables Check

### Backend (.env)
```bash
# Check these exist:
PORT=5000
ML_SERVICE_URL=http://localhost:8000
MONGODB_URI=mongodb://localhost:27017/agrisense
JWT_SECRET=your_secret_key
```

### Frontend (.env)
```bash
# Check these exist:
VITE_API_URL=http://localhost:5000
```

---

## Log Files to Check

### Backend Logs
```bash
# In terminal running backend
# Look for:
POST /api/ml/validate-leaf
POST /api/ml/predict-disease
```

### ML Service Logs
```bash
# In terminal running ML service
# Look for:
Model loaded successfully
Grad-CAM initialized
```

### Browser Console
```bash
# Press F12 in browser
# Check Console tab for:
- No 404 errors
- No toast.warning errors
- Validation requests succeeding
```

---

## Performance Issues

### Validation Too Slow (> 5 seconds)

**Cause:** CPU-only inference

**Solution:**
1. Check if GPU available:
   ```python
   import torch
   print(torch.cuda.is_available())
   ```
2. If True, ML service will use GPU automatically
3. If False, consider:
   - Reducing image size
   - Using faster model
   - Caching results

### High Memory Usage

**Cause:** Multiple model instances

**Solution:**
1. Ensure only one ML service running
2. Check with: `CHECK_SERVICES.bat`
3. Kill duplicate processes

---

## Getting Help

### Check Documentation
1. `LEAF_VALIDATION_SYSTEM.md` - Complete guide
2. `FIX_404_AND_TOAST_ERRORS.md` - Error fixes
3. `TESTING_LEAF_VALIDATION.md` - Testing procedures

### Run Diagnostics
```bash
# Check all services
CHECK_SERVICES.bat

# Test validation
cd plant_disease_ml
python test_face_rejection.py
```

### Collect Debug Info
If issues persist, collect:
1. Browser console errors (F12)
2. Backend terminal output
3. ML service terminal output
4. Output of `CHECK_SERVICES.bat`

---

## Quick Reference Commands

```bash
# Check services
CHECK_SERVICES.bat

# Restart all
RESTART_ALL_SERVICES.bat

# Test ML service
curl http://localhost:8000/health

# Test backend
curl http://localhost:5000/api/ml/health

# Test validation (with auth token)
curl -X POST http://localhost:5000/api/ml/validate-leaf \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@image.jpg"

# Pull latest code
git pull origin main

# Install dependencies
cd farmer_ai-backend && npm install
cd plant_disease_ml && pip install -r requirements.txt
```

---

## Success Indicators

You'll know everything is working when:

✅ All three services running (ML, Backend, Frontend)
✅ No 404 errors in browser console
✅ No toast.warning errors
✅ Face images rejected with clear message
✅ Leaf images accepted with confidence score
✅ Diagnosis button state correct
✅ Validation completes in < 2 seconds

---

**Last Updated:** 2026-03-09
**Version:** 1.0.0
