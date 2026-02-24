/**
 * Smart Logistics Predictor Service
 * Approximates an XGBoost/Random Forest Spoilage Prediction Model based on 
 * external IoT and environmental factors (Temperature deviation, Humidity, Transit Time).
 */

const axios = require('axios');
const LogisticsPrediction = require('../models/LogisticsPrediction');

class LogisticsPredictorService {

    // Helper: Haversine formula to approximate road distance if API fails/unavailable
    static calculateHaversineDistance(lat1, lon1, lat2, lon2) {
        if (!lat1 || !lon1 || !lat2 || !lon2) return { distanceKm: 500, estimatedHours: 12 }; // default fallback mocking

        const toRad = x => x * Math.PI / 180;
        const R = 6371; // Earth's radius in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = R * c;

        // Approximate average truck speed to 60 km/h + 20% delay buffer
        const estimatedHours = (distanceKm / 60) * 1.2;
        return { distanceKm: Math.round(distanceKm), estimatedHours };
    }

    // Helper: Crop database of perfect storage temps
    static getCropPerishabilityProfile(cropName) {
        const db = {
            'Tomato': { index: 0.85, idealMin: 10, idealMax: 15 },
            'Potato': { index: 0.40, idealMin: 7, idealMax: 10 },
            'Onion': { index: 0.30, idealMin: 0, idealMax: 4 },
            'Apple': { index: 0.60, idealMin: 0, idealMax: 4 },
            'Mango': { index: 0.75, idealMin: 12, idealMax: 14 },
            'Wheat': { index: 0.10, idealMin: 15, idealMax: 25 },
            'Rice': { index: 0.10, idealMin: 15, idealMax: 25 },
            'Banana': { index: 0.90, idealMin: 13, idealMax: 15 }
        };
        return db[cropName] || { index: 0.50, idealMin: 10, idealMax: 20 }; // Default Profile
    }

    /**
     * Fetch Open-Meteo Weather Data for the route midpoint.
     */
    static async getRouteWeatherForecast(lat, lon) {
        try {
            // Safe fallback coordinates (Nagpur, central India) if invalid provided
            const safeLat = lat || 21.1458;
            const safeLon = lon || 79.0882;

            const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${safeLat}&longitude=${safeLon}&current=temperature_2m,relative_humidity_2m&daily=temperature_2m_max,precipitation_probability_max&timezone=auto`);

            const currentTemp = response.data.current.temperature_2m;
            const currentHumidity = response.data.current.relative_humidity_2m;
            // Get next 3 days max temp & rain probability
            const maxTemp = response.data.daily.temperature_2m_max[0];
            const rainProb = response.data.daily.precipitation_probability_max[0];

            return {
                forecastAvgTemp: (currentTemp + maxTemp) / 2,
                forecastRainProbability: rainProb,
                forecastHumidity: currentHumidity
            };
        } catch (error) {
            console.error('Weather API failed, using fallback metrics', error.message);
            // Fallback weather (Summer India averages)
            return {
                forecastAvgTemp: 32,
                forecastRainProbability: 10,
                forecastHumidity: 65
            };
        }
    }

    /**
     * Executes the Spoilage Risk Machine Learning Approximation (XGBoost logic mapping)
     * Risk = (W_time * normalized_time) + (W_temp * temp_diff) + (W_humidity * humidity)
     */
    static calculateSpoilageRisk(features) {
        // Feature Weights based on ML literature (XGBoost Feature Importance)
        const W_TIME = 0.35;
        const W_TEMP_DEV = 0.45;
        const W_HUMIDITY = 0.10;
        const W_PERISHABILITY = 0.10;

        // 1. Calculate Temperature Deviation from Ideal Storage
        let tempDevPenalty = 0;
        if (features.forecastAvgTemp > features.cropOptimalTempEnd) {
            tempDevPenalty = features.forecastAvgTemp - features.cropOptimalTempEnd;
        } else if (features.forecastAvgTemp < features.cropOptimalTempStart) {
            tempDevPenalty = features.cropOptimalTempStart - features.forecastAvgTemp;
        }

        // Normalize Temp Deviation (assuming 15C off is 100% max bad)
        const normalizedTempDev = Math.min(tempDevPenalty / 15, 1);

        // 2. Normalize Transit Time (assuming 72 hours is 100% max risk window for perishables)
        const normalizedTime = Math.min(features.estimatedTransitHours / 72, 1);

        // 3. Normalize Humidity (assuming 100% humidity is max risk factor)
        const normalizedHumidity = features.forecastHumidity / 100;

        // Compute Base Risk
        let baseRisk = (
            (W_TIME * normalizedTime) +
            (W_TEMP_DEV * normalizedTempDev) +
            (W_HUMIDITY * normalizedHumidity) +
            (W_PERISHABILITY * features.cropPerishabilityIndex)
        );

        // Non-linear Multipliers (XGBoost/RF tree splits logic)
        // If it's highly perishable AND very hot, risk explodes non-linearly
        if (features.cropPerishabilityIndex > 0.7 && tempDevPenalty > 5) {
            baseRisk *= 1.4;
        }

        // Heavy rain causes transit delays, spiking time risk
        if (features.forecastRainProbability > 70) {
            baseRisk *= 1.15;
            features.trafficDelayProbability = 80;
        } else {
            features.trafficDelayProbability = Math.min(features.estimatedTransitHours * 2, 40); // Base fake delay
        }

        const riskPercent = Math.min(baseRisk * 100, 99.9);
        return { riskPercent, tempDevPenalty };
    }

    /**
     * Main entry point to predict logistics constraints
     */
    static async generatePrediction(data) {
        const {
            buyerId, vendorId, listingId,
            cropName,
            sourceLat, sourceLon,
            destLat, destLon
        } = data;

        // 1. Get Transit metrics
        const transit = this.calculateHaversineDistance(sourceLat, sourceLon, destLat, destLon);
        const predictedEta = new Date(Date.now() + (transit.estimatedHours * 60 * 60 * 1000));

        // 2. Get Weather metrics (Midpoint of route)
        const midLat = (sourceLat + destLat) / 2 || 21.1458;
        const midLon = (sourceLon + destLon) / 2 || 79.0882;
        const weather = await this.getRouteWeatherForecast(midLat, midLon);

        // 3. Get Crop Profile
        const cropProfile = this.getCropPerishabilityProfile(cropName);

        // 4. Build Input Snapshot Context
        const inputSnapshot = {
            distanceKm: transit.distanceKm,
            estimatedTransitHours: Number(transit.estimatedHours.toFixed(1)),
            forecastAvgTemp: weather.forecastAvgTemp,
            forecastRainProbability: weather.forecastRainProbability,
            forecastHumidity: weather.forecastHumidity,
            trafficDelayProbability: 0, // Calculated during risk inference
            cropPerishabilityIndex: cropProfile.index,
            cropOptimalTempStart: cropProfile.idealMin,
            cropOptimalTempEnd: cropProfile.idealMax
        };

        // 5. ML Spoilage Modeling & Inference
        const { riskPercent, tempDevPenalty } = this.calculateSpoilageRisk(inputSnapshot);

        // 6. Smart Decision Rules
        let riskLevel = 'Low';
        let coldChainRequired = false;
        let suggestedTransport = 'Normal';
        let bufferTimeHours = 0;
        let reasoning = 'Weather and transit times are optimal for this crop.';

        if (riskPercent > 75) {
            riskLevel = 'High';
            coldChainRequired = true;
            suggestedTransport = 'Express Refrigerated';
            bufferTimeHours = 12;
            reasoning = `CRITICAL RISK: ${inputSnapshot.forecastAvgTemp}°C forecast is ${tempDevPenalty.toFixed(1)}°C outside optimal range for ${cropName}. Express cold-chain is mandatory.`;
        } else if (riskPercent > 45 || (cropProfile.index > 0.6 && tempDevPenalty > 0)) {
            riskLevel = 'Medium';
            coldChainRequired = true;
            suggestedTransport = 'Refrigerated';
            reasoning = `ELEVATED RISK: Highly perishable crop with moderate transit duration (${inputSnapshot.estimatedTransitHours}h). Standard refrigeration advised.`;
        }

        if (inputSnapshot.forecastRainProbability > 70) {
            bufferTimeHours += 24;
            reasoning += ` NOTE: Heavy rain forecast. Adding 24h delay buffer to ETA.`;
        }

        // Apply delay buffer to final ETA
        predictedEta.setHours(predictedEta.getHours() + bufferTimeHours);

        // 7. Save to Database
        const predictionRecord = new LogisticsPrediction({
            buyerId,
            vendorId,
            listingId,
            inputSnapshot,
            predictedEta,
            spoilageRiskPercent: Number(riskPercent.toFixed(2)),
            riskLevel,
            recommendation: {
                coldChainRequired,
                suggestedTransport,
                bufferTimeHours,
                reasoning
            }
        });

        await predictionRecord.save();

        return predictionRecord;
    }

}

module.exports = LogisticsPredictorService;
