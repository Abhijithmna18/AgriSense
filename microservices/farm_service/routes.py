from fastapi import APIRouter, HTTPException, status
from typing import List
from models import Zone, ZoneCreate, SensorReadings, AIAnalysisRequest, AIAnalysisResponse, ZoneActivity
from database import db
from bson import ObjectId

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "farm-service"}

# --- ZONE MANAGEMENT ---
@router.get("/zones/{farm_id}", response_model=List[Zone])
async def get_zones(farm_id: str):
    zones = await db.zones.find({"farm_id": farm_id}).to_list(100)
    for z in zones:
        z["_id"] = str(z["_id"])
    return zones

@router.post("/zones", response_model=Zone)
async def create_zone(zone: ZoneCreate):
    zone_dict = zone.model_dump()
    result = await db.zones.insert_one(zone_dict)
    created_zone = await db.zones.find_one({"_id": result.inserted_id})
    created_zone["_id"] = str(created_zone["_id"])
    return created_zone

# --- RECORD KEEPING ---
@router.post("/zones/{zone_id}/activity", response_model=Zone)
async def add_activity(zone_id: str, activity: ZoneActivity):
    result = await db.zones.update_one(
        {"_id": ObjectId(zone_id)},
        {"$push": {"activities": activity.model_dump()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    updated_zone = await db.zones.find_one({"_id": ObjectId(zone_id)})
    updated_zone["_id"] = str(updated_zone["_id"])
    return updated_zone

# --- AI ADVISORY (STUB) ---
@router.post("/ai/analyze", response_model=AIAnalysisResponse)
async def analyze_zone(request: AIAnalysisRequest):
    # TODO: Integrate real Ollama call here
    # For now, return a smart stub based on context
    
    # Simulate different advice based on context keywords
    rec_text = "Nitrogen levels are low based on recent sensor data. Recommend applying generic NPK 10-26-26 fertilizer."
    if "disease" in request.context.lower():
        rec_text = "Potential Fungal Infection detected. Isolate affected area and apply Copper Oxychloride fungicide."
    
    return AIAnalysisResponse(
        zone_id=request.zone_id,
        recommendation=rec_text,
        confidence=0.88,
        risk_level="High" if "disease" in request.context.lower() else "Moderate"
    )
