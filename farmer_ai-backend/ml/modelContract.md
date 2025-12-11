# Crop Recommendation Model Contract

## Overview
This document defines the input features, preprocessing requirements, and output schema for the Crop Recommendation system.

## Input Vector (Features)
The model accepts a JSON object or flat vector with the following normalized features:

| Feature Name | Type | Description | Unit/Scale |
|---|---|---|---|
| `N` | Integer | Nitrogen ratio in soil | kg/ha |
| `P` | Integer | Phosphorus ratio in soil | kg/ha |
| `K` | Integer | Potassium ratio in soil | kg/ha |
| `temperature` | Float | Average temp | Celsius |
| `humidity` | Float | Relative humidity | % |
| `ph` | Float | Soil pH | 0-14 |
| `rainfall` | Float | Annual rainfall | mm |

> Note: Market trend data is NOT fed into this agronomic model. It is a post-processing boosting factor.

## Output Schema
The model returns a probability distribution or ranked list of the top crop classes.

Example raw output:
```json
[
  { "class": "rice", "probability": 0.95 },
  { "class": "jute", "probability": 0.35 },
  { "class": "coffee", "probability": 0.05 }
]
```

## Preprocessing Steps
1. **Handling Missing Values**: 
   - Soil: Impute with regional median or global median (N=50, P=53, K=48, pH=6.5).
   - Weather: OpenWeatherMap API fallback or seasonal average logic.
2. **Scaling**: Trees (RandomForest/XGBoost) don't strictly require scaling, but MinMax scaling [0,1] is recommended for stability.

## Explainability
The inference engine implementation MUST provide Feature Importance (via SHAP or Tree Split gain) for the top result.
Returns: Top 3 features contributing to the decision.
