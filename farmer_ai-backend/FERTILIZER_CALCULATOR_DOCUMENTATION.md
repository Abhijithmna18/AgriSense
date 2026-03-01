# Fertilizer Calculator - Complete Documentation

## Overview
The Fertilizer Calculator is an intelligent feature that calculates precise fertilizer requirements (Urea, DAP, MOP) based on soil test data, crop type, and farm area. It converts existing soil test data into actionable fertilizer recommendations.

## Features Implemented

### 1. Backend Components

#### Crop Nutrient Requirements Database
- **File**: `src/data/cropNutrientRequirements.js`
- **Crops Covered**: 25+ crops across 6 categories
  - Cereals: Rice, Wheat, Maize
  - Pulses: Chickpea, Pigeon Pea, Lentil
  - Oilseeds: Groundnut, Soybean, Mustard
  - Vegetables: Tomato, Potato, Onion, Cabbage, Cauliflower
  - Cash Crops: Cotton, Sugarcane
  - Spices: Turmeric, Ginger, Chilli

#### Fertilizer Composition Data
- Urea: 46% Nitrogen
- DAP: 18% Nitrogen, 46% Phosphorus
- MOP: 60% Potassium

#### Calculation Service
- **File**: `src/services/fertilizerCalculationService.js`
- **Functions**:
  - `calculateFertilizerRequirement()` - Main calculation logic
  - `validateSoilData()` - Validates soil test data
  - `generateRecommendations()` - Generates agronomic recommendations
  - `generateApplicationSchedule()` - Creates fertilizer application timeline

#### Controller
- **File**: `src/controllers/fertilizerCalculatorController.js`
- **Endpoints**:
  - `GET /api/fertilizer-calculator/crops` - Get all available crops
  - `GET /api/fertilizer-calculator/crops/:cropName` - Get crop details
  - `GET /api/fertilizer-calculator/farms` - Get farms with soil test status
  - `GET /api/fertilizer-calculator/soil-data/:farmId` - Get soil data for farm
  - `POST /api/fertilizer-calculator/calculate` - Calculate fertilizer requirement

### 2. Frontend Components

#### Main Page
- **File**: `src/pages/FertilizerCalculatorPage.jsx`
- **Features**:
  - Farm selection dropdown
  - Crop selection dropdown
  - Acres input with validation
  - Real-time soil data display
  - Calculation results display
  - NPK analysis chart
  - Application schedule
  - Cost estimation
  - Recommendations

#### Navigation
- Added to Sidebar under Smart Farming section
- Route: `/fertilizer-calculator`
- Icon: Calculator
- Accessible to Farmer and Admin roles

## Calculation Logic

### Step 1: Nutrient Deficit Calculation
```
Deficit N = Crop Required N - Soil Available N
Deficit P = Crop Required P - Soil Available P
Deficit K = Crop Required K - Soil Available K
```

### Step 2: Fertilizer Quantity Calculation

**DAP Calculation** (for Phosphorus):
```
DAP (kg/acre) = (Deficit P / 46) × 100
N from DAP = (DAP × 18) / 100
```

**MOP Calculation** (for Potassium):
```
MOP (kg/acre) = (Deficit K / 60) × 100
```

**Urea Calculation** (for remaining Nitrogen):
```
Remaining N = Deficit N - N from DAP
Urea (kg/acre) = (Remaining N / 46) × 100
```

### Step 3: Total Calculation
```
Total Fertilizer = Fertilizer per acre × Total acres
```

### Step 4: Cost Estimation
```
Cost = (Urea × ₹6) + (DAP × ₹27) + (MOP × ₹17)
```

## Validation Rules

### Input Validation
1. ✅ Farm selection is required
2. ✅ Crop selection is required
3. ✅ Acres must be a positive number
4. ✅ Acres cannot exceed 10,000 (unrealistic check)
5. ✅ No spacebar-only entries allowed
6. ✅ Numeric values only for acreage
7. ✅ Soil test data must exist for selected farm

### Soil Data Validation
1. ✅ NPK values cannot be negative
2. ✅ NPK values cannot exceed 500 kg/acre (unrealistic check)
3. ✅ Soil test must be available before calculation

## API Endpoints

### 1. Get Available Crops
```http
GET /api/fertilizer-calculator/crops
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "crops": [...],
    "groupedCrops": {
      "Cereal": [...],
      "Pulse": [...],
      ...
    },
    "totalCount": 25
  }
}
```

### 2. Get Farms with Soil Test Status
```http
GET /api/fertilizer-calculator/farms
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "farm123",
      "name": "My Farm",
      "hasSoilTest": true,
      "soilTestDate": "2025-01-15",
      "soilData": {
        "nitrogen": 40,
        "phosphorus": 20,
        "potassium": 25
      }
    }
  ],
  "totalFarms": 2,
  "farmsWithSoilTest": 1
}
```

### 3. Get Soil Data for Farm
```http
GET /api/fertilizer-calculator/soil-data/:farmId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "farmId": "farm123",
    "farmName": "My Farm",
    "soilTest": {
      "nitrogen": 40,
      "phosphorus": 20,
      "potassium": 25,
      "ph": 6.5,
      "organicMatter": 2.5,
      "testDate": "2025-01-15"
    }
  }
}
```

### 4. Calculate Fertilizer Requirement
```http
POST /api/fertilizer-calculator/calculate
Authorization: Bearer <token>
Content-Type: application/json

{
  "farmId": "farm123",
  "cropName": "rice",
  "acres": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "crop": {
      "name": "Rice",
      "category": "Cereal",
      "duration": "120-150 days"
    },
    "farmArea": 5,
    "soilStatus": {
      "nitrogen": 40,
      "phosphorus": 20,
      "potassium": 25
    },
    "cropRequirement": {
      "nitrogen": 60,
      "phosphorus": 30,
      "potassium": 30
    },
    "nutrientDeficit": {
      "nitrogen": 20,
      "phosphorus": 10,
      "potassium": 5
    },
    "fertilizerPerAcre": {
      "urea": 43.5,
      "dap": 21.7,
      "mop": 8.3
    },
    "fertilizerTotal": {
      "urea": 217.5,
      "dap": 108.5,
      "mop": 41.5
    },
    "nutrientSupplied": {
      "nitrogen": 119.7,
      "phosphorus": 49.9,
      "potassium": 24.9
    },
    "costEstimate": {
      "urea": 1305,
      "dap": 2930,
      "mop": 706,
      "total": 4941,
      "currency": "INR"
    },
    "recommendations": [...],
    "applicationSchedule": [...]
  }
}
```

## Example Calculation

### Input:
- **Farm**: My Farm (5 acres)
- **Crop**: Rice
- **Soil NPK**: N=40, P=20, K=25 kg/acre

### Calculation:
1. **Nutrient Deficit**:
   - N: 60 - 40 = 20 kg/acre
   - P: 30 - 20 = 10 kg/acre
   - K: 30 - 25 = 5 kg/acre

2. **Fertilizer per Acre**:
   - DAP: (10 / 46) × 100 = 21.7 kg
   - N from DAP: (21.7 × 18) / 100 = 3.9 kg
   - Remaining N: 20 - 3.9 = 16.1 kg
   - Urea: (16.1 / 46) × 100 = 35.0 kg
   - MOP: (5 / 60) × 100 = 8.3 kg

3. **Total for 5 Acres**:
   - Urea: 35.0 × 5 = 175.0 kg
   - DAP: 21.7 × 5 = 108.5 kg
   - MOP: 8.3 × 5 = 41.5 kg

4. **Cost**:
   - Urea: 175.0 × ₹6 = ₹1,050
   - DAP: 108.5 × ₹27 = ₹2,930
   - MOP: 41.5 × ₹17 = ₹706
   - **Total: ₹4,686**

## Application Schedule

### Basal (Day 0):
- Urea: 33% of total
- DAP: 100% of total
- MOP: 100% of total

### First Top Dressing (20-30 days):
- Urea: 33% of total

### Second Top Dressing (40-50 days):
- Urea: 34% of total (remaining)

## Error Handling

### Frontend Errors:
- Empty field validation
- Numeric validation
- Range validation
- Soil test availability check

### Backend Errors:
- 400: Invalid input parameters
- 404: Farm not found / Crop not found / No soil test data
- 500: Server error

## Testing Checklist

- [ ] Farm selection works
- [ ] Crop selection works
- [ ] Acres input validates correctly
- [ ] Soil data displays when farm is selected
- [ ] Error shown when no soil test available
- [ ] Calculation completes successfully
- [ ] Results display correctly
- [ ] Chart renders properly
- [ ] Application schedule shows
- [ ] Recommendations display
- [ ] Cost estimation accurate
- [ ] Reset button works
- [ ] Navigation from sidebar works

## Future Enhancements

1. Save calculation history
2. Export results as PDF
3. Compare multiple crops
4. Seasonal recommendations
5. Organic fertilizer alternatives
6. Micro-nutrient recommendations
7. Integration with marketplace for fertilizer purchase
8. SMS/Email alerts for application schedule
9. Weather-based application timing
10. Soil test reminder notifications

## Dependencies

### Backend:
- Express.js
- Mongoose (for Farm and SoilTest models)
- Authentication middleware

### Frontend:
- React
- Framer Motion (animations)
- Recharts (charts)
- Axios (API calls)
- React Hot Toast (notifications)
- Lucide React (icons)

## File Structure

```
farmer_ai-backend/
├── src/
│   ├── data/
│   │   └── cropNutrientRequirements.js
│   ├── services/
│   │   └── fertilizerCalculationService.js
│   ├── controllers/
│   │   └── fertilizerCalculatorController.js
│   └── routes/
│       └── fertilizerCalculatorRoutes.js

farmer_ai-frontend/
├── src/
│   ├── pages/
│   │   └── FertilizerCalculatorPage.jsx
│   ├── components/
│   │   └── dashboard/
│   │       └── Sidebar.jsx (updated)
│   └── App.jsx (updated)
```

## Support

For issues or questions:
1. Check soil test data exists for the farm
2. Verify crop name is in the database
3. Check API endpoints are accessible
4. Review browser console for errors
5. Check backend logs for calculation errors
