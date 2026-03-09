# Fix 404 and Toast Errors - Quick Guide

## Errors Identified

### Error 1: 404 on `/api/ml/validate-leaf`
```
Failed to load resource: the server responded with a status of 404 (Not Found)
:5002/api/ml/validate-leaf:1
```

### Error 2: `toast.warning is not a function`
```
Uncaught (in promise) TypeError: toast.warning is not a function
at validateImage (DiseasePredictionPage.jsx:101:19)
```

---

## Root Causes

### Error 1: Backend Not Restarted
The validation route exists in `farmer_ai-backend/src/routes/diseaseRoutes.js` but the backend server hasn't been restarted to load the new route.

### Error 2: Wrong Toast Method
`react-hot-toast` doesn't have a `warning` method. Should use `toast.error` instead.

---

## Fixes Applied

### Fix 1: Code Updated ✅
Changed `toast.warning` to `toast.error` in `DiseasePredictionPage.jsx`

**File:** `farmer_ai-frontend/src/pages/DiseasePredictionPage.jsx`
**Line:** 101
**Change:**
```javascript
// Before
toast.warning('Image validation unavailable...');

// After
toast.error('Image validation unavailable...');
```

### Fix 2: Temp Directory Created ✅
Created `farmer_ai-backend/uploads/temp/` directory for multer file uploads.

---

## Action Required: Restart Backend

The backend server needs to be restarted to load the validation route.

### Step 1: Stop Backend Server

In the terminal running the backend, press `Ctrl+C`

### Step 2: Restart Backend Server

```bash
cd farmer_ai-backend
npm start
```

Wait for: `Server running in development mode on port 5000`

### Step 3: Verify Route Loaded

Check the console output for:
```
POST /api/ml/validate-leaf
```

Or test directly:
```bash
curl http://localhost:5000/api/ml/health
```

---

## Verification Steps

### 1. Check ML Service Running

```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "model_loaded": true,
  "num_classes": 38,
  "device": "cpu"
}
```

If not running:
```bash
cd plant_disease_ml
python main.py
```

### 2. Check Backend Running

```bash
curl http://localhost:5000/api/ml/health
```

**Expected Response:**
```json
{
  "success": true,
  "mlService": {
    "status": "online",
    ...
  }
}
```

### 3. Test in Browser

1. Open Disease Detection page
2. Upload an image
3. Check browser console - should see:
   - ✅ No 404 errors
   - ✅ No toast.warning errors
   - ✅ Validation request succeeds

---

## Expected Behavior After Fix

### Face Image Upload
```
1. User uploads face image
2. POST /api/ml/validate-leaf → 200 OK
3. Response: { "is_leaf": false, "message": "...human face..." }
4. UI shows: ❌ Invalid Image
5. Diagnosis button: DISABLED
```

### Leaf Image Upload
```
1. User uploads leaf image
2. POST /api/ml/validate-leaf → 200 OK
3. Response: { "is_leaf": true, "confidence": 0.87 }
4. UI shows: ✅ Leaf Detected (87%)
5. Diagnosis button: ENABLED
```

---

## Troubleshooting

### Still Getting 404?

**Check 1: Route registered?**
```bash
# In farmer_ai-backend/server.js, verify line exists:
app.use('/api/ml', require('./src/routes/diseaseRoutes'));
```

**Check 2: Backend restarted?**
```bash
# Stop and restart backend
Ctrl+C
npm start
```

**Check 3: File exists?**
```bash
# Verify file exists
ls farmer_ai-backend/src/routes/diseaseRoutes.js
```

### Still Getting toast.warning Error?

**Check 1: File saved?**
```bash
# Verify the change in DiseasePredictionPage.jsx
grep "toast.error" farmer_ai-frontend/src/pages/DiseasePredictionPage.jsx
```

**Check 2: Frontend reloaded?**
```bash
# Refresh browser with Ctrl+F5 (hard refresh)
```

### ML Service Connection Error?

**Check 1: ML service running?**
```bash
curl http://localhost:8000/health
```

**Check 2: Start ML service**
```bash
cd plant_disease_ml
python main.py
```

**Check 3: Port conflict?**
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000
```

---

## Quick Fix Script

Run the automated fix script:

```bash
FIX_404_ERROR.bat
```

This will:
1. ✅ Create temp directory
2. ✅ Check ML service status
3. ⚠️ Remind you to restart backend
4. ✅ Verify fixes applied

---

## Summary of Changes

### Files Modified
1. ✅ `farmer_ai-frontend/src/pages/DiseasePredictionPage.jsx`
   - Changed `toast.warning` to `toast.error`

### Directories Created
2. ✅ `farmer_ai-backend/uploads/temp/`
   - Required for multer file uploads

### Action Required
3. ⚠️ **Restart backend server**
   - Stop with Ctrl+C
   - Start with `npm start`

---

## Testing Checklist

After restarting backend:

- [ ] ML service running (port 8000)
- [ ] Backend running (port 5000)
- [ ] Frontend running (port 5173)
- [ ] No 404 errors in console
- [ ] No toast.warning errors
- [ ] Face image rejected
- [ ] Leaf image accepted
- [ ] Validation status displays correctly

---

## Expected Console Output

### Before Fix ❌
```
Failed to load resource: 404 (Not Found)
:5002/api/ml/validate-leaf:1

TypeError: toast.warning is not a function
at validateImage (DiseasePredictionPage.jsx:101:19)
```

### After Fix ✅
```
POST /api/ml/validate-leaf 200 OK
Validation result: { is_leaf: true, confidence: 0.87 }
```

---

## If Issues Persist

1. **Clear browser cache:** Ctrl+Shift+Delete
2. **Hard refresh:** Ctrl+F5
3. **Check all services running:**
   ```bash
   # ML Service
   curl http://localhost:8000/health
   
   # Backend
   curl http://localhost:5000/api/ml/health
   
   # Frontend
   # Open http://localhost:5173
   ```

4. **Check logs:**
   - Backend terminal for errors
   - Browser console for errors
   - ML service terminal for errors

5. **Restart all services:**
   ```bash
   # Stop all (Ctrl+C in each terminal)
   
   # Start ML service
   cd plant_disease_ml && python main.py
   
   # Start backend
   cd farmer_ai-backend && npm start
   
   # Frontend should auto-reload
   ```

---

## Status

- ✅ Code fixes applied
- ✅ Temp directory created
- ⚠️ **Backend restart required**
- ⏳ Testing pending

**Next Action:** Restart backend server and test in browser

---

**Last Updated:** 2026-03-09
**Issue:** 404 and toast.warning errors
**Status:** Fixes applied, restart required
