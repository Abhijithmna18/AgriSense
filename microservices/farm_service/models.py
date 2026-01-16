from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime
from enum import Enum

class ZoneStatus(str, Enum):
    HEALTHY = "Healthy"
    RISK = "Risk"
    CRITICAL = "Critical"

class GeoJSONPolygon(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]] 

class SensorReadings(BaseModel):
    temperature: float
    humidity: float
    soil_moisture: float
    sunlight: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# --- NEW MODELS ---
class ActivityType(str, Enum):
    EXPENSE = "Expense" # Seeds, Fertilizer, Labor
    HARVEST = "Harvest"
    TREATMENT = "Treatment"
    NOTE = "Note"

class ZoneActivity(BaseModel):
    type: ActivityType
    category: str # e.g. "Fertilizer", "Labor"
    description: str
    amount: float = 0.0 # Qty or Hours
    cost: float = 0.0
    date: datetime = Field(default_factory=datetime.utcnow)
    
class ZoneInventoryItem(BaseModel):
    name: str
    quantity: float
    unit: str
    low_stock_threshold: float

class ZoneComplianceRecord(BaseModel):
    date: datetime = Field(default_factory=datetime.utcnow)
    drc_percent: Optional[float] = None # Dry Rubber Content
    latex_grade: Optional[str] = None
    inputs_used: List[str] = []

class ZoneBase(BaseModel):
    name: str
    type: str
    farm_id: str
    area_acres: float
    crop_name: Optional[str] = None
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    coordinates: GeoJSONPolygon
    status: ZoneStatus = ZoneStatus.HEALTHY
    crop_stage: Optional[str] = "Vegetative" # NEW

class ZoneCreate(ZoneBase):
    pass

class Zone(ZoneBase):
    id: str = Field(alias="_id")
    current_sensors: Optional[SensorReadings] = None
    activities: List[ZoneActivity] = []
    inventory: List[ZoneInventoryItem] = []
    compliance_logs: List[ZoneComplianceRecord] = []
    
    model_config = ConfigDict(populate_by_name=True)

class AIAnalysisRequest(BaseModel):
    zone_id: str
    context: str

class AIAnalysisResponse(BaseModel):
    zone_id: str
    recommendation: str
    confidence: float
    risk_level: str
