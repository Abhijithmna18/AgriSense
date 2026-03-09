# Leaf Validation System - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│                  (Disease Detection Page)                            │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ 1. Upload Image
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND VALIDATION                               │
│  • File type check (JPG, PNG, WebP)                                 │
│  • File size check (< 10MB)                                         │
│  • Create preview                                                    │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ 2. Auto-validate
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NODE.JS BACKEND                                   │
│              POST /api/ml/validate-leaf                              │
│  • Receive multipart/form-data                                      │
│  • Proxy to Python ML service                                       │
│  • Handle errors                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ 3. Forward to ML
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  PYTHON ML SERVICE (FastAPI)                         │
│                POST /validate-leaf                                   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────┐        │
│  │           LEAF VALIDATOR MODULE                         │        │
│  │                                                          │        │
│  │  ┌──────────────────────────────────────────┐          │        │
│  │  │  1. Image Quality Checks                 │          │        │
│  │  │     • Resolution >= 224x224              │          │        │
│  │  │     • Blur detection (Laplacian)         │          │        │
│  │  └──────────────────────────────────────────┘          │        │
│  │                    ▼                                     │        │
│  │  ┌──────────────────────────────────────────┐          │        │
│  │  │  2. Color Composition Analysis           │          │        │
│  │  │     • Green pixel ratio                  │          │        │
│  │  │     • Brown/yellow detection             │          │        │
│  │  │     • Plant color score (0-1)            │          │        │
│  │  └──────────────────────────────────────────┘          │        │
│  │                    ▼                                     │        │
│  │  ┌──────────────────────────────────────────┐          │        │
│  │  │  3. ImageNet Classification              │          │        │
│  │  │     • MobileNetV2 inference              │          │        │
│  │  │     • Organic vs artificial detection    │          │        │
│  │  │     • Confidence score (0-1)             │          │        │
│  │  └──────────────────────────────────────────┘          │        │
│  │                    ▼                                     │        │
│  │  ┌──────────────────────────────────────────┐          │        │
│  │  │  4. Combined Score Calculation           │          │        │
│  │  │     Score = (color × 0.4) +              │          │        │
│  │  │             (imagenet × 0.6)             │          │        │
│  │  └──────────────────────────────────────────┘          │        │
│  │                    ▼                                     │        │
│  │  ┌──────────────────────────────────────────┐          │        │
│  │  │  5. Threshold Check                      │          │        │
│  │  │     Is score >= 0.80?                    │          │        │
│  │  └──────────────────────────────────────────┘          │        │
│  └────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                   YES                       NO
                    │                         │
                    ▼                         ▼
        ┌───────────────────┐    ┌───────────────────┐
        │  is_leaf: true    │    │  is_leaf: false   │
        │  confidence: 0.94 │    │  confidence: 0.12 │
        │  message: "✓"     │    │  message: "✗"     │
        └───────────────────┘    └───────────────────┘
                    │                         │
                    └────────────┬────────────┘
                                 │
                                 │ 4. Return result
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND UI UPDATE                                │
│                                                                      │
│  IF is_leaf = true:                                                 │
│    ✅ Show "Leaf Detected"                                          │
│    ✅ Display confidence                                            │
│    ✅ ENABLE "Run Diagnosis" button                                 │
│                                                                      │
│  IF is_leaf = false:                                                │
│    ❌ Show "Invalid Image"                                          │
│    ❌ Display error message                                         │
│    ❌ DISABLE "Run Diagnosis" button                                │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ 5. User clicks "Run Diagnosis"
                                 │    (only if validation passed)
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  DISEASE DETECTION PIPELINE                          │
│              POST /api/ml/predict-disease                            │
│                                                                      │
│  ┌────────────────────────────────────────────────────────┐        │
│  │  1. RE-VALIDATE IMAGE (Security Layer)                 │        │
│  │     • Run leaf validator again                          │        │
│  │     • Reject if validation fails                        │        │
│  │     • Return 400 error with message                     │        │
│  └────────────────────────────────────────────────────────┘        │
│                              ▼                                       │
│  ┌────────────────────────────────────────────────────────┐        │
│  │  2. DISEASE CLASSIFICATION                              │        │
│  │     • EfficientNet inference                            │        │
│  │     • Predict disease class                             │        │
│  │     • Calculate confidence                              │        │
│  └────────────────────────────────────────────────────────┘        │
│                              ▼                                       │
│  ┌────────────────────────────────────────────────────────┐        │
│  │  3. TREATMENT LOOKUP                                    │        │
│  │     • Match disease to medicine map                     │        │
│  │     • Get recommended treatments                        │        │
│  │     • Format dosage & application                       │        │
│  └────────────────────────────────────────────────────────┘        │
│                              ▼                                       │
│  ┌────────────────────────────────────────────────────────┐        │
│  │  4. VISUAL EXPLANATION (Grad-CAM)                       │        │
│  │     • Generate heatmap                                  │        │
│  │     • Highlight diseased regions                        │        │
│  │     • Encode as base64                                  │        │
│  └────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ 6. Return diagnosis
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DISPLAY RESULTS                                   │
│  • Disease name & crop                                              │
│  • Confidence score                                                 │
│  • Severity estimation                                              │
│  • Visual explanation (heatmap)                                     │
│  • Treatment plan with medicines                                    │
│  • Marketplace links                                                │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Validation Request Flow

```
Frontend                 Backend                  ML Service
   │                        │                         │
   │─────(1) Upload────────>│                         │
   │                        │                         │
   │                        │────(2) Validate────────>│
   │                        │                         │
   │                        │                         │──┐
   │                        │                         │  │ Run
   │                        │                         │  │ Validator
   │                        │                         │<─┘
   │                        │                         │
   │                        │<───(3) Result──────────│
   │                        │    {is_leaf, conf}      │
   │<───(4) Display────────│                         │
   │    Status              │                         │
   │                        │                         │
```

### Disease Prediction Flow (with Validation)

```
Frontend                 Backend                  ML Service
   │                        │                         │
   │─────(1) Diagnose──────>│                         │
   │                        │                         │
   │                        │────(2) Predict─────────>│
   │                        │                         │
   │                        │                         │──┐
   │                        │                         │  │ Validate
   │                        │                         │<─┘
   │                        │                         │
   │                        │                         │──┐ If valid:
   │                        │                         │  │ Run Disease
   │                        │                         │  │ Detection
   │                        │                         │<─┘
   │                        │                         │
   │                        │<───(3) Result──────────│
   │                        │    {disease, treatment} │
   │<───(4) Display────────│                         │
   │    Results             │                         │
   │                        │                         │
```

## Component Interaction

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                             │
│  ┌────────────────────────────────────────────────────┐      │
│  │  DiseasePredictionPage.jsx                         │      │
│  │  • State: validating, validationResult             │      │
│  │  • Function: validateImage()                       │      │
│  │  • Function: handlePredict()                       │      │
│  │  • UI: Validation status badge                     │      │
│  │  • UI: Conditional diagnosis button                │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND LAYER (Node.js)                    │
│  ┌────────────────────────────────────────────────────┐      │
│  │  diseaseRoutes.js                                  │      │
│  │  • Route: POST /api/ml/validate-leaf               │      │
│  │  • Route: POST /api/ml/predict-disease             │      │
│  │  • Middleware: multer (file upload)                │      │
│  │  • Middleware: protect (authentication)            │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    ML SERVICE LAYER (Python)                  │
│  ┌────────────────────────────────────────────────────┐      │
│  │  main.py (FastAPI)                                 │      │
│  │  • Endpoint: POST /validate-leaf                   │      │
│  │  • Endpoint: POST /predict-disease                 │      │
│  │  • Endpoint: GET /health                           │      │
│  └────────────────────────────────────────────────────┘      │
│                            │                                  │
│  ┌────────────────────────────────────────────────────┐      │
│  │  leaf_validator.py                                 │      │
│  │  • Class: LeafValidator                            │      │
│  │  • Method: validate()                              │      │
│  │  • Method: is_leaf_image()                         │      │
│  │  • Method: validate_image_quality()                │      │
│  └────────────────────────────────────────────────────┘      │
│                            │                                  │
│  ┌────────────────────────────────────────────────────┐      │
│  │  model.py                                          │      │
│  │  • Class: DiseaseClassifier                        │      │
│  │  • Model: EfficientNet-B0                          │      │
│  └────────────────────────────────────────────────────┘      │
│                            │                                  │
│  ┌────────────────────────────────────────────────────┐      │
│  │  grad_cam.py                                       │      │
│  │  • Class: GradCAM                                  │      │
│  │  • Method: generate_heatmap()                      │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Frontend Validation                           │
│  • File type check                                      │
│  • File size check                                      │
│  • Basic format validation                              │
└─────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Backend Validation                            │
│  • Authentication (JWT token)                           │
│  • Multer file filter                                   │
│  • Size limits                                          │
└─────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 3: ML Service Validation (Pre-check)             │
│  • Content-type verification                            │
│  • Image decoding check                                 │
│  • File size re-validation                              │
└─────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Leaf Validation (Content Analysis)            │
│  • Image quality checks                                 │
│  • Color composition analysis                           │
│  • AI-based leaf detection                              │
│  • Confidence threshold enforcement                     │
└─────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 5: Disease Detection (Re-validation)             │
│  • Re-run leaf validator                                │
│  • Reject if validation fails                           │
│  • Only proceed if leaf confirmed                       │
└─────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
                    Upload Image
                         │
                         ▼
                  ┌──────────────┐
                  │  File Valid? │
                  └──────────────┘
                    │          │
                   YES        NO
                    │          │
                    │          └──> ❌ "Invalid file type"
                    ▼
              ┌──────────────┐
              │ Size Valid?  │
              └──────────────┘
                │          │
               YES        NO
                │          │
                │          └──> ❌ "File too large"
                ▼
          ┌──────────────┐
          │ ML Service   │
          │   Online?    │
          └──────────────┘
            │          │
           YES        NO
            │          │
            │          └──> ⚠️  "Service unavailable"
            ▼
      ┌──────────────┐
      │ Image        │
      │ Decodable?   │
      └──────────────┘
        │          │
       YES        NO
        │          │
        │          └──> ❌ "Cannot decode image"
        ▼
  ┌──────────────┐
  │ Resolution   │
  │   Valid?     │
  └──────────────┘
    │          │
   YES        NO
    │          │
    │          └──> ❌ "Resolution too low"
    ▼
┌──────────────┐
│ Image Clear? │
└──────────────┘
  │          │
 YES        NO
  │          │
  │          └──> ❌ "Image blurry"
  ▼
┌──────────────┐
│ Contains     │
│   Leaf?      │
└──────────────┘
  │          │
 YES        NO
  │          │
  │          └──> ❌ "Not a leaf image"
  ▼
✅ Proceed to
   Disease Detection
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────┐
│  Optimization Strategy                                  │
│                                                          │
│  1. Model Loading (Startup)                             │
│     • Load MobileNetV2 once at startup                  │
│     • Cache in global variable                          │
│     • Reuse for all requests                            │
│                                                          │
│  2. Image Preprocessing                                 │
│     • Resize to 224x224 (standard)                      │
│     • Use efficient transforms                          │
│     • Batch processing if multiple images               │
│                                                          │
│  3. Inference Optimization                              │
│     • Use torch.no_grad() for validation                │
│     • GPU acceleration if available                     │
│     • FP16 inference for speed                          │
│                                                          │
│  4. Caching (Future)                                    │
│     • Cache validation results by image hash            │
│     • TTL: 1 hour                                       │
│     • Reduce redundant validations                      │
│                                                          │
│  5. Async Processing                                    │
│     • FastAPI async endpoints                           │
│     • Non-blocking I/O                                  │
│     • Concurrent request handling                       │
└─────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                     │
│                                                              │
│  ┌────────────────┐      ┌────────────────┐               │
│  │   Frontend     │      │   Backend      │               │
│  │   (React)      │◄────►│   (Node.js)    │               │
│  │   Port: 80     │      │   Port: 5000   │               │
│  └────────────────┘      └────────────────┘               │
│                                  │                          │
│                                  │                          │
│                                  ▼                          │
│                          ┌────────────────┐                │
│                          │   ML Service   │                │
│                          │   (FastAPI)    │                │
│                          │   Port: 8000   │                │
│                          └────────────────┘                │
│                                  │                          │
│                                  ▼                          │
│                          ┌────────────────┐                │
│                          │   GPU Server   │                │
│                          │   (Optional)   │                │
│                          └────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

---

**Last Updated:** 2026-03-09
**Version:** 1.0.0
