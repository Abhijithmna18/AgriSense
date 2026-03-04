from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import random
import math
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AgriSense AI Microservices", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------
# Pydantic Request / Response Schemas
# -----------------------------------------------

class FarmHealthRequest(BaseModel):
    soil_moisture: float          # 0-100 %
    temperature: float            # Celsius
    crop_stage: str               # seedling | vegetative | flowering | fruiting | harvest
    recent_rainfall_mm: float
    pest_risk_level: str          # Low | Medium | High

class YieldPredictionRequest(BaseModel):
    crop: str
    acreage: float
    soil_moisture: float
    historical_temp: List[float]
    fertilizer_applied_kg: Optional[float] = 0
    soil_type: Optional[str] = "loamy"

class PestRiskRequest(BaseModel):
    forecast_humidity: List[float]
    forecast_temp: List[float]
    crop: str
    growth_stage: Optional[str] = "vegetative"

class IrrigationRequest(BaseModel):
    soil_moisture: float          # Current %, 0-100
    temperature: float            # Celsius
    rain_forecast_mm: float       # Expected rainfall in next 24h
    crop_stage: Optional[str] = "vegetative"

class MarketPriceRequest(BaseModel):
    crop_type: str
    current_price_per_kg: float
    historical_prices: List[float]   # Last N weeks
    harvest_date_weeks_away: int

class FinancialRiskRequest(BaseModel):
    monthly_cashflow: List[float]
    recent_crop_failure: bool

# -----------------------------------------------
# Crop Knowledge Base
# -----------------------------------------------

CROP_BASE_YIELD = {
    "rice": 2500, "wheat": 3000, "maize": 4000, "pepper": 1200,
    "coconut": 800, "rubber": 1600, "cardamom": 300, "banana": 20000,
    "tomato": 18000, "potato": 15000, "cotton": 1800, "sugarcane": 60000,
    "default": 2000
}

CROP_PESTS = {
    "rice":     {"high": "Brown Planthopper",     "medium": "Stem Borer",      "low": "Leaf Folder"},
    "pepper":   {"high": "Pollu Beetle",           "medium": "Scale Insects",   "low": "Thrips"},
    "coconut":  {"high": "Rhinoceros Beetle",      "medium": "Red Palm Weevil", "low": "Leaf Caterpillar"},
    "tomato":   {"high": "Fruit Borer",            "medium": "Whitefly",        "low": "Aphids"},
    "maize":    {"high": "Fall Armyworm",          "medium": "Corn Earworm",    "low": "Aphids"},
    "default":  {"high": "Aphids / Whitefly",      "medium": "Fungal Spores",   "low": "Mites"},
}

PEST_RECOMMENDATIONS = {
    "high":   "Apply recommended pesticide immediately. Consult local agricultural officer within 24 hours.",
    "medium": "Apply Neem Oil spray (5ml/L) every 3 days for 2 weeks. Monitor daily.",
    "low":    "Maintain field hygiene. Monitor crop every 3 days. No immediate action needed.",
}

MARKET_SEASONALITY = {
    "pepper":    [1.05, 1.10, 1.08, 1.00, 0.95, 0.92, 0.90, 0.93, 0.98, 1.02, 1.07, 1.10],
    "rice":      [1.00, 0.98, 0.96, 0.95, 0.97, 1.00, 1.05, 1.08, 1.06, 1.02, 1.00, 0.99],
    "tomato":    [1.10, 1.05, 0.95, 0.90, 0.85, 0.88, 0.92, 1.00, 1.08, 1.15, 1.20, 1.12],
    "coconut":   [1.00, 1.00, 1.02, 1.05, 1.08, 1.05, 1.00, 0.98, 0.97, 0.98, 1.00, 1.02],
    "default":   [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00],
}

# -----------------------------------------------
# Helpers
# -----------------------------------------------

def moving_average(data: List[float], window: int = 3) -> float:
    if len(data) < window:
        return sum(data) / len(data) if data else 0
    return sum(data[-window:]) / window

def clamp(value, lo, hi):
    return max(lo, min(hi, value))

# -----------------------------------------------
# Endpoints
# -----------------------------------------------

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "AgriSense AI Engine", "version": "2.0"}


@app.post("/predict/farm-health")
def predict_farm_health(req: FarmHealthRequest):
    """
    Composite Farm Health Score (0-100).
    Uses a weighted model across soil, temperature, stage, rain, and pest risk.
    """
    # 1. Soil moisture score (ideal: 40-70%)
    if 40 <= req.soil_moisture <= 70:
        moisture_score = 100
    elif req.soil_moisture < 40:
        moisture_score = (req.soil_moisture / 40) * 100
    else:
        moisture_score = max(0, 100 - (req.soil_moisture - 70) * 3)

    # 2. Temperature score (ideal: 20-30°C)
    if 20 <= req.temperature <= 30:
        temp_score = 100
    elif req.temperature < 20:
        temp_score = max(0, 80 - (20 - req.temperature) * 4)
    else:
        temp_score = max(0, 100 - (req.temperature - 30) * 3)

    # 3. Crop stage score (mid-stage crops are most productive)
    stage_map = {"seedling": 60, "vegetative": 80, "flowering": 90, "fruiting": 85, "harvest": 70}
    stage_score = stage_map.get(req.crop_stage.lower(), 70)

    # 4. Rainfall adequacy (ideal ~30-80mm recent)
    if 30 <= req.recent_rainfall_mm <= 80:
        rain_score = 100
    elif req.recent_rainfall_mm < 30:
        rain_score = (req.recent_rainfall_mm / 30) * 100
    else:
        rain_score = max(0, 100 - (req.recent_rainfall_mm - 80) * 1.5)

    # 5. Pest pressure penalty
    pest_penalty = {"Low": 0, "Medium": 10, "High": 25}.get(req.pest_risk_level, 0)

    # Weighted composite
    raw_score = (
        moisture_score * 0.30 +
        temp_score * 0.25 +
        stage_score * 0.20 +
        rain_score * 0.25
    ) - pest_penalty

    health_score = round(clamp(raw_score, 0, 100), 1)

    # Diagnosis
    water_stress = "High" if req.soil_moisture < 30 else "Medium" if req.soil_moisture < 45 else "Low"
    nutrient_risk = "High" if req.soil_moisture > 85 else "Medium" if req.soil_moisture > 75 else "Low"
    label = "Critical" if health_score < 40 else "Poor" if health_score < 60 else "Fair" if health_score < 75 else "Good" if health_score < 90 else "Excellent"

    return {
        "health_score": health_score,
        "label": label,
        "breakdown": {
            "soil_moisture_score": round(moisture_score, 1),
            "temperature_score": round(temp_score, 1),
            "crop_stage_score": stage_score,
            "rainfall_score": round(rain_score, 1),
            "pest_pressure_penalty": pest_penalty
        },
        "diagnosis": {
            "water_stress": water_stress,
            "nutrient_deficiency_risk": nutrient_risk,
            "pest_risk": req.pest_risk_level
        },
        "recommendations": [
            f"{'Irrigate immediately — soil moisture critically low.' if water_stress == 'High' else 'Soil water balance is adequate.'}",
            f"{'Apply balanced NPK — leaching risk from over-saturation.' if nutrient_risk == 'High' else 'Nutrient levels appear stable.'}",
            f"{'Take urgent pest control action.' if req.pest_risk_level == 'High' else 'Maintain regular monitoring.'}"
        ]
    }


@app.post("/predict/yield")
def predict_yield(req: YieldPredictionRequest):
    """
    Enhanced yield prediction with crop multipliers and environmental adjustments.
    """
    base_yield_per_acre = CROP_BASE_YIELD.get(req.crop.lower(), CROP_BASE_YIELD["default"])

    # Temperature adjustment (ideal 25°C)
    avg_temp = sum(req.historical_temp) / len(req.historical_temp) if req.historical_temp else 25
    temp_factor = 1.0 - abs(avg_temp - 25) * 0.01  # -1% per degree deviation

    # Soil moisture factor (ideal 55%)
    moisture_factor = 1.0 - abs(req.soil_moisture - 55) * 0.008

    # Fertilizer bonus (up to +15%)
    fertilizer_acreage_ratio = (req.fertilizer_applied_kg or 0) / max(req.acreage, 0.1)
    fertilizer_factor = 1.0 + min(0.15, fertilizer_acreage_ratio * 0.005)

    # Soil type factor
    soil_factors = {"loamy": 1.05, "clayey": 0.95, "sandy": 0.88, "silty": 1.00, "black": 1.10}
    soil_factor = soil_factors.get((req.soil_type or "loamy").lower(), 1.0)

    total_factors = clamp(temp_factor * moisture_factor * fertilizer_factor * soil_factor, 0.5, 1.3)
    predicted_yield = req.acreage * base_yield_per_acre * total_factors

    # Confidence: higher when temp is moderate and moisture is good
    confidence = clamp(0.70 + (temp_factor - 0.85) + (moisture_factor - 0.85), 0.55, 0.96)

    shortfall = predicted_yield < (req.acreage * base_yield_per_acre * 0.9)
    return {
        "predicted_yield_kg": round(predicted_yield, 1),
        "confidence_score": round(confidence, 2),
        "yield_per_acre_kg": round(predicted_yield / req.acreage, 1),
        "baseline_yield_kg": round(req.acreage * base_yield_per_acre, 1),
        "below_average": shortfall,
        "factors": {
            "temperature_factor": round(temp_factor, 3),
            "moisture_factor": round(moisture_factor, 3),
            "fertilizer_factor": round(fertilizer_factor, 3),
            "soil_factor": soil_factor
        },
        "recommendation": "Yield is on track." if not shortfall else "Consider supplemental irrigation and fertilization to boost yield.",
        "model_version": "rf-enhanced-v2.0"
    }


@app.post("/predict/pest-risk")
def predict_pest_risk(req: PestRiskRequest):
    """
    Extended pest risk with crop-specific pest identification and spray schedule.
    """
    avg_humidity = sum(req.forecast_humidity) / len(req.forecast_humidity)
    avg_temp = sum(req.forecast_temp) / len(req.forecast_temp)
    max_humidity = max(req.forecast_humidity)
    max_temp = max(req.forecast_temp)

    crop_key = req.crop.lower() if req.crop.lower() in CROP_PESTS else "default"

    # Risk scoring
    risk_score = 0
    triggers = []

    if avg_humidity > 75:
        risk_score += 3
        triggers.append(f"High average humidity ({avg_humidity:.0f}%)")
    elif avg_humidity > 60:
        risk_score += 1
        triggers.append(f"Elevated humidity ({avg_humidity:.0f}%)")

    if max_humidity > 90:
        risk_score += 2
        triggers.append("Humidity spike > 90% detected")

    if avg_temp > 28:
        risk_score += 2
        triggers.append(f"Warm temperatures ({avg_temp:.1f}°C)")
    elif avg_temp > 24:
        risk_score += 1

    if req.growth_stage in ["flowering", "fruiting"]:
        risk_score += 2
        triggers.append(f"Vulnerable crop stage: {req.growth_stage}")

    # Map to risk level
    if risk_score >= 6:
        risk_level = "High"
    elif risk_score >= 3:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    pest = CROP_PESTS[crop_key][risk_level.lower()]
    recommendation = PEST_RECOMMENDATIONS[risk_level.lower()]

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "pest": pest,
        "crop": req.crop,
        "trigger_conditions": triggers,
        "recommendation": recommendation,
        "spray_window": "Within 24 hours" if risk_level == "High" else "Within 72 hours" if risk_level == "Medium" else "No immediate action",
        "model_version": "pest-classifier-v2.0"
    }


@app.post("/predict/irrigation")
def predict_irrigation(req: IrrigationRequest):
    """
    Soil-moisture & weather-based irrigation recommendation.
    """
    # Thresholds
    CRITICAL_DRY = 25
    OPTIMAL_LOW = 40
    OPTIMAL_HIGH = 65

    irrigation_needed = False
    reasoning = []
    duration_minutes = 0
    suggested_time = "06:00"

    # Soil moisture analysis
    if req.soil_moisture < CRITICAL_DRY:
        irrigation_needed = True
        duration_minutes = 45
        reasoning.append(f"Soil critically dry ({req.soil_moisture:.0f}% < {CRITICAL_DRY}%)")
    elif req.soil_moisture < OPTIMAL_LOW:
        irrigation_needed = True
        duration_minutes = 25
        reasoning.append(f"Soil moisture below optimal ({req.soil_moisture:.0f}% < {OPTIMAL_LOW}%)")
    elif req.soil_moisture > OPTIMAL_HIGH:
        irrigation_needed = False
        reasoning.append(f"Soil moisture already high ({req.soil_moisture:.0f}%) — skip irrigation")

    # Rain forecast override
    if req.rain_forecast_mm > 20:
        irrigation_needed = False
        duration_minutes = 0
        reasoning.append(f"Rain forecast of {req.rain_forecast_mm:.0f}mm will satisfy crop needs")
    elif req.rain_forecast_mm > 5 and irrigation_needed:
        duration_minutes = max(0, duration_minutes - 10)
        reasoning.append(f"Partial rain expected ({req.rain_forecast_mm:.0f}mm) — reduced duration")

    # Temperature adjustment (hot = irrigate longer)
    if req.temperature > 35 and irrigation_needed:
        duration_minutes += 10
        reasoning.append(f"High heat ({req.temperature}°C) — extended irrigation")
        suggested_time = "05:30"

    # Crop stage
    if req.crop_stage == "flowering" and req.soil_moisture < 55:
        if not irrigation_needed:
            irrigation_needed = True
            duration_minutes = 20
        reasoning.append("Flowering stage — consistent moisture is critical")

    severity = "Critical" if req.soil_moisture < CRITICAL_DRY else "Advisory" if irrigation_needed else "None"

    return {
        "irrigation_needed": irrigation_needed,
        "severity": severity,
        "recommended_duration_minutes": duration_minutes,
        "suggested_time": suggested_time,
        "reasoning": reasoning,
        "pump_command": "ACTIVATE" if irrigation_needed and req.soil_moisture < CRITICAL_DRY else "STANDBY",
        "next_check_hours": 4 if irrigation_needed else 8
    }


@app.post("/predict/market-price")
def predict_market_price(req: MarketPriceRequest):
    """
    Market trend analysis using moving averages and seasonal multipliers.
    """
    import datetime
    prices = req.historical_prices
    crop_key = req.crop_type.lower() if req.crop_type.lower() in MARKET_SEASONALITY else "default"
    
    if len(prices) < 2:
        trend_pct = 0.0
    else:
        short_ma = moving_average(prices, 3)
        long_ma = moving_average(prices, min(6, len(prices)))
        trend_pct = ((short_ma - long_ma) / long_ma * 100) if long_ma > 0 else 0

    # Seasonal projection for target month
    target_month = (datetime.date.today().month + req.harvest_date_weeks_away // 4) % 12
    seasonality = MARKET_SEASONALITY[crop_key][target_month]
    projected_price = req.current_price_per_kg * seasonality * (1 + trend_pct / 100)
    price_change_pct = ((projected_price - req.current_price_per_kg) / req.current_price_per_kg) * 100

    # Decision logic
    if price_change_pct > 8 and req.harvest_date_weeks_away > 2:
        action = "HOLD"
        reason = f"{req.crop_type.title()} prices expected to rise {price_change_pct:.1f}%. Store harvest and sell in {req.harvest_date_weeks_away} weeks."
    elif price_change_pct < -5:
        action = "SELL_NOW"
        reason = f"Price declining trend detected ({price_change_pct:.1f}%). Sell now to maximize revenue."
    else:
        action = "SELL_NOW"
        reason = f"Market stable. No significant upside — selling now is advisable."

    return {
        "current_price_per_kg": req.current_price_per_kg,
        "projected_price_per_kg": round(projected_price, 2),
        "price_change_pct": round(price_change_pct, 1),
        "trend": "Upward" if trend_pct > 1 else "Downward" if trend_pct < -1 else "Stable",
        "seasonality_factor": seasonality,
        "action": action,
        "reason": reason,
        "model_version": "price-intelligence-v2.0"
    }


@app.post("/analyze/financial-risk")
def analyze_financial_risk(request: FinancialRiskRequest):
    total_flow = sum(request.monthly_cashflow)
    base_score = 600
    if total_flow > 50000:
        base_score += 100
    elif total_flow < 10000:
        base_score -= 50
    if request.recent_crop_failure:
        base_score -= 150
    eligibility = base_score >= 650
    return {
        "credit_score": max(300, min(850, base_score)),
        "eligibility": eligibility,
        "max_loan_recommended": 50000 if eligibility else 0
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)


# -------------------------
# Request Models (Pydantic)
# -------------------------
class YieldPredictionRequest(BaseModel):
    crop: str
    acreage: float
    historical_temp: List[float]
    soil_type: str

class PestRiskRequest(BaseModel):
    forecast_humidity: List[float]
    forecast_temp: List[float]
    crop: str

class FinancialRiskRequest(BaseModel):
    monthly_cashflow: List[float]
    recent_crop_failure: bool

# -------------------------
# Endpoints
# -------------------------

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "AgriSense AI Engine"}

@app.post("/predict/yield")
def predict_yield(request: YieldPredictionRequest):
    """
    Placeholder for Random Forest Regressor.
    Currently returns a mocked algorithmic prediction.
    """
    try:
        # Mock calculation: 1 acre roughly yields 2000kg for standard crops
        base_yield_per_acre = 2000 
        predicted_total = request.acreage * base_yield_per_acre
        
        # Add some random variance to simulate model
        variance = random.uniform(0.85, 1.15)
        final_yield = predicted_total * variance
        
        return {
            "predicted_yield_kg": round(final_yield, 2),
            "confidence_score": round(random.uniform(0.75, 0.95), 2),
            "model_version": "rf-v1.0-mock"
        }
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/pest-risk")
def predict_pest_risk(request: PestRiskRequest):
    """
    Placeholder for Time-Series Classification model.
    """
    avg_humidity = sum(request.forecast_humidity) / len(request.forecast_humidity)
    avg_temp = sum(request.forecast_temp) / len(request.forecast_temp)
    
    risk_level = "Low"
    pest = "None"
    trigger = []
    
    if avg_humidity > 70 and avg_temp > 25:
        risk_level = "High"
        pest = "Aphids / Whitefly"
        trigger = ["High Humidity", "Warm Temperature"]
    elif avg_humidity > 80:
        risk_level = "Medium"
        pest = "Fungal Spores"
        trigger = ["High Humidity"]
        
    return {
        "risk_level": risk_level,
        "pest": pest,
        "trigger_conditions": trigger
    }

@app.post("/analyze/financial-risk")
def analyze_financial_risk(request: FinancialRiskRequest):
    """
    Placeholder for Logistic Regression micro-loan qualifier.
    """
    total_flow = sum(request.monthly_cashflow)
    base_score = 600
    
    # Calculate simple score
    if total_flow > 50000:
        base_score += 100
    elif total_flow < 10000:
        base_score -= 50
        
    if request.recent_crop_failure:
        base_score -= 150
        
    eligibility = base_score >= 650
    
    return {
        "credit_score": max(300, min(850, base_score)), # Cap between 300 and 850
        "eligibility": eligibility,
        "max_loan_recommended": 50000 if eligibility else 0
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
