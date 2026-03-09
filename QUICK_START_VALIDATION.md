# Quick Start - Leaf Validation System

## 🚀 Start in 3 Steps

### Step 1: Start ML Service
```bash
cd plant_disease_ml
python main.py
```
Wait for: `Model loaded successfully on cpu`

### Step 2: Start Backend
```bash
cd farmer_ai-backend
npm start
```
Wait for: `Server running on port 5000`

### Step 3: Start Frontend
```bash
cd farmer_ai-frontend
npm run dev
```
Open: `http://localhost:5173`

---

## ✅ Test the System

### Test 1: Upload a Face Image
1. Go to Disease Detection page
2. Upload a photo of a person
3. **Expected:** ❌ "Invalid Image - Not a plant leaf"
4. **Expected:** Diagnosis button DISABLED

### Test 2: Upload a Leaf Image
1. Remove the face image
2. Upload a plant leaf photo
3. **Expected:** ✅ "Leaf Detected - Confidence: 94%"
4. **Expected:** Diagnosis button ENABLED
5. Click "Run Diagnosis"
6. **Expected:** Disease prediction successful

---

## 🔧 Quick Commands

### Check ML Service
```bash
curl http://localhost:8000/health
```

### Test Validation API
```bash
curl -X POST http://localhost:8000/validate-leaf \
  -F "file=@your_image.jpg"
```

### Run Automated Tests
```bash
cd plant_disease_ml
python test_validation.py
```

---

## 📊 What Changed?

### Before
- ❌ Any image accepted
- ❌ Face classified as disease
- ❌ Unreliable results

### After
- ✅ Only leaf images accepted
- ✅ Automatic validation
- ✅ Clear error messages
- ✅ Accurate predictions

---

## 🐛 Troubleshooting

### ML Service won't start
```bash
pip install torch torchvision pillow opencv-python numpy fastapi uvicorn python-multipart
```

### Validation always fails
Edit `plant_disease_ml/leaf_validator.py` line 23:
```python
confidence_threshold=0.70  # Lower from 0.80
```

### Need help?
See full documentation: `LEAF_VALIDATION_SYSTEM.md`

---

## 📁 Files Modified

- ✅ `plant_disease_ml/main.py` - Added validation
- ✅ `plant_disease_ml/leaf_validator.py` - New validator
- ✅ `farmer_ai-backend/src/routes/diseaseRoutes.js` - New route
- ✅ `farmer_ai-frontend/src/pages/DiseasePredictionPage.jsx` - UI updates

---

## 🎯 Key Features

1. **Automatic Validation** - Runs on upload
2. **Real-time Feedback** - Instant status
3. **Blocked Invalid Images** - Cannot diagnose
4. **Clear Messages** - Helpful guidance
5. **Multi-layer Security** - 5 validation layers

---

**Status:** ✅ Ready to use
**Issue Fixed:** Face classification bug resolved
