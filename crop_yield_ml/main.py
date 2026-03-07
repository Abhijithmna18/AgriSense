"""
main.py — Crop Yield Prediction FastAPI Inference Server
=========================================================
Runs on port 8001 (separate from the disease ML server on 8000).

Endpoints:
  GET  /health               — Service health + model info
  POST /predict-yield        — Predict yield for given inputs
  GET  /metadata             — Returns feature names, valid options for dropdowns
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Any

app = FastAPI(
    title="AgriSense — Crop Yield Prediction API",
    description="Predicts crop yield (kg/ha) from farm, soil, and climate inputs using an ensemble ML model.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "model.pkl"
FEATURE_COLS_PATH = "feature_columns.json"
CROP_STATS_PATH = "crop_stats.json"

# Global state
model = None
metadata = {}
crop_stats = {}


@app.on_event("startup")
async def load_model():
    global model, metadata, crop_stats

    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            print(f"[OK] Model loaded from {MODEL_PATH}")
        except Exception as e:
            print(f"[WARNING] Could not load model: {e}")
            print(f"[WARNING] Model version mismatch. Crop yield predictions will be unavailable.")
            print(f"[WARNING] Smart irrigation endpoint will still work!")
            model = None
    else:
        print(f"[WARNING] {MODEL_PATH} not found. Train the model first with: python train.py")
        print(f"[OK] Smart irrigation endpoint will still work!")

    if os.path.exists(FEATURE_COLS_PATH):
        with open(FEATURE_COLS_PATH, "r") as f:
            metadata = json.load(f)
        print(f"[OK] Metadata loaded. Features: {metadata.get('feature_columns', [])}")
    else:
        print(f"[WARNING] {FEATURE_COLS_PATH} not found.")

    if os.path.exists(CROP_STATS_PATH):
        with open(CROP_STATS_PATH, "r") as f:
            crop_stats = json.load(f)
        print(f"[OK] Crop stats loaded for {len(crop_stats)} crops.")
    else:
        print(f"[WARNING] No crop stats available.")
    
    print(f"\n{'='*60}")
    print(f"[OK] Smart Irrigation Endpoint: READY")
    print(f"  POST /predict/smart-irrigation")
    print(f"{'='*60}\n")


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "features_loaded": bool(metadata),
        "num_crops": len(crop_stats),
        "model_metrics": metadata.get("metrics", {})
    }


@app.get("/metadata")
async def get_metadata():
    """Returns feature options for frontend dropdowns and validation."""
    if not metadata:
        raise HTTPException(status_code=503, detail="Model metadata not loaded. Train the model first.")
    return {
        "feature_columns": metadata.get("feature_columns", []),
        "categorical_columns": metadata.get("categorical_columns", []),
        "numerical_columns": metadata.get("numerical_columns", []),
        "unique_values": metadata.get("unique_values", {}),
        "numerical_ranges": metadata.get("numerical_ranges", {}),
        "metrics": metadata.get("metrics", {}),
        "crop_stats": crop_stats
    }


class YieldPredictRequest(BaseModel):
    """
    Dynamic input — accepts any key-value pairs that match the training feature columns.
    The frontend sends whatever fields the form has; we map them to model features.
    """
    inputs: dict[str, Any] = Field(
        ...,
        example={
            "crop": "Wheat",
            "region": "Punjab",
            "rainfall_mm": 850.0,
            "temperature_c": 22.5,
            "fertilizer_used_tons": 2.1,
            "pesticide_used_tons": 0.5,
            "area_under_cultivation_ha": 3.0
        }
    )


@app.post("/predict-yield")
async def predict_yield(request: YieldPredictRequest):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="ML model not loaded. Train first: python train.py"
        )

    feature_cols = metadata.get("feature_columns", [])
    if not feature_cols:
        raise HTTPException(status_code=503, detail="Feature metadata not available.")

    # Build a single-row DataFrame with all expected features
    input_data = {}
    missing_cols = []
    for col in feature_cols:
        val = request.inputs.get(col)
        if val is None:
            # Also try common variations (spaces, case)
            for key in request.inputs:
                if key.lower().replace(' ', '_') == col.lower().replace(' ', '_'):
                    val = request.inputs[key]
                    break
        if val is None:
            missing_cols.append(col)
            input_data[col] = np.nan  # Use NaN — imputer in pipeline will handle it
        else:
            input_data[col] = val

    df_input = pd.DataFrame([input_data])

    try:
        predicted_yield = float(model.predict(df_input)[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    # Pull crop-specific statistics for context
    crop_col = metadata.get("crop_column")
    crop_name = request.inputs.get(crop_col, "") if crop_col else ""
    crop_reference = crop_stats.get(str(crop_name), {})

    # Classify performance vs historical average
    avg_yield = crop_reference.get("mean", predicted_yield)
    if avg_yield > 0:
        pct_vs_avg = ((predicted_yield - avg_yield) / avg_yield) * 100
    else:
        pct_vs_avg = 0.0

    if pct_vs_avg >= 10:
        performance = "Above Average"
    elif pct_vs_avg <= -10:
        performance = "Below Average"
    else:
        performance = "Average"

    # Simple recommendations based on prediction
    recommendations = _generate_recommendations(
        predicted_yield, avg_yield, request.inputs, metadata
    )

    return {
        "prediction": {
            "predicted_yield": round(predicted_yield, 2),
            "unit": metadata.get("target_column", "yield").replace("_", " "),
            "performance_vs_average": performance,
            "percent_vs_average": round(pct_vs_avg, 1),
            "confidence_note": f"Model R² = {metadata.get('metrics', {}).get('r2', 'N/A')}"
        },
        "crop_reference": {
            "crop": crop_name,
            "historical_avg_yield": round(avg_yield, 2) if crop_reference else None,
            "historical_min_yield": round(crop_reference.get("min", 0), 2) if crop_reference else None,
            "historical_max_yield": round(crop_reference.get("max", 0), 2) if crop_reference else None,
        },
        "recommendations": recommendations,
        "missing_inputs": missing_cols
    }


def _generate_recommendations(predicted, avg, inputs: dict, meta: dict) -> list[str]:
    """Generate basic agronomic recommendations based on the prediction and inputs."""
    recs = []
    num_ranges = meta.get("numerical_ranges", {})

    # Rainfall check
    for key in inputs:
        if 'rainfall' in key.lower() or 'rain' in key.lower():
            val = inputs[key]
            rng = num_ranges.get(key, {})
            if rng and val < rng.get('mean', val) * 0.6:
                recs.append("Rainfall is significantly lower than average — consider supplemental irrigation to protect yield.")

    # Temperature check
    for key in inputs:
        if 'temp' in key.lower():
            val = inputs[key]
            rng = num_ranges.get(key, {})
            if rng and val > rng.get('max', val) * 0.9:
                recs.append("Temperature is high — ensure adequate irrigation and consider heat-tolerant varieties.")
            elif rng and val < rng.get('min', val) * 1.1:
                recs.append("Temperature is low — monitor for frost risk and consider crop protection measures.")

    # Fertilizer check
    for key in inputs:
        if 'fertilizer' in key.lower():
            val = inputs[key]
            rng = num_ranges.get(key, {})
            if rng and val < rng.get('mean', val) * 0.5:
                recs.append("Fertilizer application is below average — increasing NPK inputs may significantly improve yield.")

    # Performance-based advice
    if avg > 0 and predicted < avg * 0.8:
        recs.append("Predicted yield is well below historical average. Review soil health and irrigation schedule.")
    elif avg > 0 and predicted >= avg * 1.2:
        recs.append("Excellent predicted yield! Ensure timely harvesting and adequate storage capacity.")

    if not recs:
        recs.append("Conditions appear normal. Maintain current farming practices and monitor regularly.")

    return recs


if __name__ == "__main__":
    import uvicorn
    # Run on port 5001 to match backend PYTHON_AI_URL configuration
    # Or update backend .env: PYTHON_AI_URL=http://localhost:8001
    port = int(os.getenv("PORT", "5001"))
    print(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False)


# ============================================================================
# SMART IRRIGATION ENDPOINT (for IoT integration)
# ============================================================================

class SmartIrrigationRequest(BaseModel):
    """Request model for smart irrigation predictions."""
    temperature: float = Field(..., description="Temperature in Celsius", example=28.0)
    humidity: float = Field(..., description="Relative humidity percentage", example=45.0)
    soil_moisture: float = Field(..., description="Soil moisture percentage", example=30.0)
    water_flow: float = Field(0.0, description="Current water flow rate (L/min)", example=0.0)


@app.post("/predict/smart-irrigation")
async def predict_smart_irrigation(request: SmartIrrigationRequest):
    """
    AI-powered irrigation decision endpoint.
    
    Analyzes sensor data and provides irrigation recommendations including:
    - Whether irrigation is needed
    - Recommended duration
    - Confidence level
    - ET (Evapotranspiration) index
    """
    try:
        temp = request.temperature
        humidity = request.humidity
        soil_moisture = request.soil_moisture
        water_flow = request.water_flow
        
        # Calculate ET (Evapotranspiration) index
        # Higher ET = more water loss through evaporation and plant transpiration
        et_index = (temp - 15) / 2 + (100 - humidity) / 10
        et_index = max(0, et_index)  # Ensure non-negative
        
        # Initialize decision variables
        irrigation_needed = False
        duration = 0  # seconds
        confidence = 0.8
        reason = ""
        
        # Decision Logic
        if soil_moisture < 35:
            irrigation_needed = True
            # Calculate duration based on moisture deficit
            moisture_deficit = 60 - soil_moisture
            duration = int(moisture_deficit * 20)  # Base duration
            
            # Adjust for high ET conditions
            if et_index > 10:
                duration = int(duration * 1.5)
                reason = "Low soil moisture + High ET demand"
                confidence = 0.95
            else:
                reason = "Low soil moisture detected"
                confidence = 0.9
                
        elif soil_moisture > 70:
            irrigation_needed = False
            reason = "Soil moisture optimal"
            confidence = 0.95
            
        elif 35 <= soil_moisture <= 50 and et_index > 15:
            # Moderate moisture but very high ET
            irrigation_needed = True
            duration = int((50 - soil_moisture) * 15)
            reason = "Moderate moisture with very high ET"
            confidence = 0.85
            
        else:
            irrigation_needed = False
            reason = "Monitoring conditions - no action needed"
            confidence = 0.8
        
        # Safety check: if water is already flowing, don't recommend more
        if water_flow > 0.1:
            irrigation_needed = False
            reason = "Irrigation already active"
            confidence = 1.0
        
        # Cap duration at reasonable maximum (30 minutes = 1800 seconds)
        duration = min(duration, 1800)
        
        return {
            "irrigation_needed": irrigation_needed,
            "duration": duration,
            "confidence": round(confidence, 2),
            "et_index": round(et_index, 2),
            "reason": reason,
            "sensor_readings": {
                "temperature": temp,
                "humidity": humidity,
                "soil_moisture": soil_moisture,
                "water_flow": water_flow
            },
            "recommendations": _generate_irrigation_recommendations(
                soil_moisture, temp, humidity, et_index, irrigation_needed
            )
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Smart irrigation prediction failed: {str(e)}"
        )


def _generate_irrigation_recommendations(
    soil_moisture: float,
    temperature: float,
    humidity: float,
    et_index: float,
    irrigation_needed: bool
) -> list[str]:
    """Generate irrigation-specific recommendations."""
    recs = []
    
    # Soil moisture recommendations
    if soil_moisture < 25:
        recs.append("[CRITICAL] Soil moisture very low. Immediate irrigation required to prevent crop stress.")
    elif soil_moisture < 35:
        recs.append("Soil moisture below optimal. Start irrigation soon.")
    elif soil_moisture > 80:
        recs.append("[WARNING] Soil moisture very high. Risk of waterlogging and root rot. Stop irrigation.")
    elif soil_moisture > 70:
        recs.append("Soil moisture optimal. No irrigation needed.")
    
    # Temperature recommendations
    if temperature > 35:
        recs.append("🌡️ High temperature detected. Consider evening irrigation to reduce evaporation loss.")
    elif temperature < 15:
        recs.append("🌡️ Low temperature. Reduce irrigation frequency to prevent root diseases.")
    
    # Humidity recommendations
    if humidity < 30:
        recs.append("💨 Low humidity increases water loss. Monitor soil moisture closely.")
    elif humidity > 80:
        recs.append("💨 High humidity reduces evaporation. Reduce irrigation frequency.")
    
    # ET index recommendations
    if et_index > 15:
        recs.append("🔥 Very high evapotranspiration. Increase irrigation frequency and duration.")
    elif et_index > 10:
        recs.append("☀️ High evapotranspiration. Monitor soil moisture daily.")
    elif et_index < 5:
        recs.append("☁️ Low evapotranspiration. Reduce irrigation to prevent overwatering.")
    
    # General advice
    if irrigation_needed:
        recs.append("[OK] Irrigation recommended. Ensure water supply is adequate.")
    else:
        recs.append("[OK] Current conditions are good. Continue monitoring.")
    
    return recs
