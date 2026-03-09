# Testing Guide - Leaf Validation System

## Quick Start Testing

### 1. Start the ML Service

```bash
cd plant_disease_ml
python main.py
```

Or use the batch file:
```bash
START_LEAF_VALIDATION.bat
```

### 2. Run Automated Tests

```bash
cd plant_disease_ml
python test_validation.py
```

### 3. Manual Testing via Frontend

1. Start backend: `cd farmer_ai-backend && npm start`
2. Start frontend: `cd farmer_ai-frontend && npm run dev`
3. Navigate to Disease Detection page
4. Upload test images

## Test Cases

### Test Case 1: Valid Plant Leaf ✅

**Input:** Clear photo of a plant leaf (tomato, apple, corn, etc.)

**Expected Behavior:**
1. Image uploads successfully
2. Validation runs automatically
3. Status shows: "✅ Leaf Detected"
4. Confidence: > 80%
5. "Run Diagnosis" button is ENABLED
6. Clicking diagnosis runs disease detection

**Success Criteria:**
- Validation passes
- Diagnosis completes successfully
- Treatment plan displayed

---

### Test Case 2: Human Face ❌

**Input:** Photo of a person's face

**Expected Behavior:**
1. Image uploads successfully
2. Validation runs automatically
3. Status shows: "❌ Invalid Image"
4. Message: "Image does not appear to contain plant material..."
5. "Run Diagnosis" button is DISABLED
6. Cannot proceed to diagnosis

**Success Criteria:**
- Validation fails
- Clear error message displayed
- Diagnosis blocked

---

### Test Case 3: Object/Tool ❌

**Input:** Photo of farming equipment, tools, or objects

**Expected Behavior:**
1. Image uploads successfully
2. Validation runs automatically
3. Status shows: "❌ Invalid Image"
4. Message: "Image does not match expected leaf patterns..."
5. "Run Diagnosis" button is DISABLED

**Success Criteria:**
- Validation fails
- Diagnosis blocked

---

### Test Case 4: Landscape/Background ❌

**Input:** Wide field photo, landscape, or background scene

**Expected Behavior:**
1. Image uploads successfully
2. Validation runs automatically
3. Status shows: "❌ Invalid Image"
4. Message: "Image does not appear to contain plant material..."
5. "Run Diagnosis" button is DISABLED

**Success Criteria:**
- Validation fails
- Diagnosis blocked

---

### Test Case 5: Diseased Leaf ✅

**Input:** Photo of a diseased or damaged leaf (brown, yellow, spotted)

**Expected Behavior:**
1. Image uploads successfully
2. Validation runs automatically
3. Status shows: "✅ Leaf Detected"
4. Confidence: > 70% (may be lower due to discoloration)
5. "Run Diagnosis" button is ENABLED
6. Disease detection runs successfully

**Success Criteria:**
- Validation passes (diseased leaves are valid)
- Diagnosis identifies disease correctly

---

### Test Case 6: Low Resolution Image ❌

**Input:** Image smaller than 224x224 pixels

**Expected Behavior:**
1. Image uploads successfully
2. Validation runs automatically
3. Status shows: "❌ Invalid Image"
4. Message: "Image resolution too low. Please upload an image at least 224x224 pixels."
5. "Run Diagnosis" button is DISABLED

**Success Criteria:**
- Validation fails with quality message
- Diagnosis blocked

---

### Test Case 7: Blurry Image ❌

**Input:** Out-of-focus or motion-blurred leaf photo

**Expected Behavior:**
1. Image uploads successfully
2. Validation runs automatically
3. Status shows: "❌ Invalid Image"
4. Message: "Image appears blurry. Please upload a clearer photo."
5. "Run Diagnosis" button is DISABLED

**Success Criteria:**
- Validation fails with quality message
- Diagnosis blocked

---

### Test Case 8: Multiple Leaves ✅

**Input:** Photo containing multiple leaves

**Expected Behavior:**
1. Image uploads successfully
2. Validation runs automatically
3. Status shows: "✅ Leaf Detected"
4. Confidence: > 80%
5. "Run Diagnosis" button is ENABLED
6. Disease detection analyzes the image

**Success Criteria:**
- Validation passes
- Diagnosis runs (may analyze dominant leaf)

---

### Test Case 9: Document/Screenshot ❌

**Input:** Screenshot, PDF, or document image

**Expected Behavior:**
1. Image uploads successfully
2. Validation runs automatically
3. Status shows: "❌ Invalid Image"
4. Message: "Image does not appear to contain plant material..."
5. "Run Diagnosis" button is DISABLED

**Success Criteria:**
- Validation fails
- Diagnosis blocked

---

### Test Case 10: Animal/Pet ❌

**Input:** Photo of an animal or pet

**Expected Behavior:**
1. Image uploads successfully
2. Validation runs automatically
3. Status shows: "❌ Invalid Image"
4. Message: "Image does not match expected leaf patterns..."
5. "Run Diagnosis" button is DISABLED

**Success Criteria:**
- Validation fails
- Diagnosis blocked

---

## API Testing

### Test Validation Endpoint

```bash
# Test with a leaf image
curl -X POST http://localhost:8000/validate-leaf \
  -F "file=@test_leaf.jpg"

# Expected response:
{
  "is_leaf": true,
  "confidence": 0.94,
  "message": "Leaf detected successfully"
}
```

```bash
# Test with a face image
curl -X POST http://localhost:8000/validate-leaf \
  -F "file=@test_face.jpg"

# Expected response:
{
  "is_leaf": false,
  "confidence": 0.12,
  "message": "Image does not appear to contain plant material..."
}
```

### Test Disease Prediction with Validation

```bash
# Test with a leaf image (should succeed)
curl -X POST http://localhost:8000/predict-disease \
  -F "file=@test_leaf.jpg"

# Expected: Disease prediction result
```

```bash
# Test with a face image (should fail)
curl -X POST http://localhost:8000/predict-disease \
  -F "file=@test_face.jpg"

# Expected response (400 Bad Request):
{
  "detail": {
    "error": "INVALID_IMAGE",
    "message": "Image does not appear to contain plant material...",
    "confidence": 0.12,
    "suggestion": "Please upload a clear photo of a plant leaf..."
  }
}
```

## Performance Testing

### Load Test

Test validation performance under load:

```python
import requests
import time
import concurrent.futures

def validate_image(image_path):
    start = time.time()
    with open(image_path, 'rb') as f:
        response = requests.post(
            'http://localhost:8000/validate-leaf',
            files={'file': f}
        )
    duration = time.time() - start
    return duration, response.status_code

# Test 10 concurrent requests
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    futures = [executor.submit(validate_image, 'test_leaf.jpg') for _ in range(10)]
    results = [f.result() for f in futures]

avg_time = sum(r[0] for r in results) / len(results)
print(f"Average validation time: {avg_time:.2f}s")
```

**Expected Performance:**
- Single request: 0.5 - 1.5 seconds
- 10 concurrent: < 3 seconds average
- Memory usage: < 500MB

## Integration Testing

### Full Workflow Test

1. **Setup:**
   - ML service running on port 8000
   - Backend running on port 5000
   - Frontend running on port 5173

2. **Test Steps:**
   ```
   1. Open browser → http://localhost:5173
   2. Login as farmer
   3. Navigate to Disease Detection
   4. Upload face image
      → Expect: Validation fails, diagnosis blocked
   5. Remove image
   6. Upload leaf image
      → Expect: Validation passes, diagnosis enabled
   7. Click "Run Diagnosis"
      → Expect: Disease prediction successful
   8. Verify treatment plan displayed
   ```

3. **Success Criteria:**
   - All steps complete without errors
   - Validation correctly identifies leaf vs non-leaf
   - Disease detection only runs for valid images

## Regression Testing

### Before Deployment Checklist

- [ ] All 10 test cases pass
- [ ] API endpoints respond correctly
- [ ] Frontend displays validation status
- [ ] Diagnosis button state correct
- [ ] Error messages clear and helpful
- [ ] Performance within acceptable range
- [ ] No console errors in browser
- [ ] No Python exceptions in logs

## Troubleshooting Tests

### Test Fails: Validation always passes

**Debug Steps:**
1. Check confidence threshold: `leaf_validator.py` line 23
2. Verify color analysis working: Add debug prints
3. Test with extreme cases (pure black image, pure white image)

### Test Fails: Validation always fails

**Debug Steps:**
1. Lower confidence threshold to 0.70
2. Check MobileNetV2 loaded correctly
3. Verify image preprocessing working

### Test Fails: Slow validation (> 3 seconds)

**Debug Steps:**
1. Check if GPU available: `torch.cuda.is_available()`
2. Reduce image size in preprocessing
3. Profile code to find bottleneck

## Test Data

### Recommended Test Images

Create a `test_images/` directory with:

1. **valid_leaves/**
   - tomato_healthy.jpg
   - tomato_diseased.jpg
   - apple_leaf.jpg
   - corn_leaf.jpg
   - wheat_leaf.jpg

2. **invalid_images/**
   - human_face.jpg
   - farming_tool.jpg
   - landscape.jpg
   - document.jpg
   - animal.jpg

3. **edge_cases/**
   - blurry_leaf.jpg
   - low_res_leaf.jpg
   - multiple_leaves.jpg
   - partial_leaf.jpg

### Download Test Dataset

```bash
# PlantVillage dataset (valid leaves)
# Download from: https://www.kaggle.com/datasets/emmarex/plantdisease

# Non-leaf images (for negative testing)
# Use any personal photos or download from:
# https://unsplash.com/ (faces, objects, landscapes)
```

## Continuous Testing

### Automated Testing Script

```bash
#!/bin/bash
# test_validation_suite.sh

echo "Starting Leaf Validation Test Suite..."

# Start ML service
cd plant_disease_ml
python main.py &
ML_PID=$!
sleep 5

# Run tests
python test_validation.py

# Cleanup
kill $ML_PID

echo "Test suite complete!"
```

### CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
name: Test Leaf Validation

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: |
          cd plant_disease_ml
          pip install -r requirements.txt
      - name: Run validation tests
        run: |
          cd plant_disease_ml
          python test_validation.py
```

## Success Metrics

### Validation Accuracy

Target metrics:
- **True Positive Rate (Leaves):** > 95%
- **True Negative Rate (Non-leaves):** > 90%
- **False Positive Rate:** < 5%
- **False Negative Rate:** < 10%

### User Experience

Target metrics:
- **Validation Time:** < 2 seconds
- **Clear Error Messages:** 100% of failures
- **User Satisfaction:** > 90% (from feedback)

## Reporting Issues

If tests fail, report with:
1. Test case number
2. Input image (if possible)
3. Expected vs actual result
4. Console logs (frontend + backend + Python)
5. System info (OS, Python version, GPU)

---

**Last Updated:** 2026-03-09
**Version:** 1.0.0
