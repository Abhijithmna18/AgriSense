const axios = require('axios');
const FarmInsight = require('../models/FarmInsight');
const SensorData = require('../models/SensorData');
const Farm = require('../models/Farm');
const CropCycle = require('../models/CropCycle');
const MarketPrice = require('../models/MarketPrice');

const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:8000';

// Helper: call Python AI service
const callAI = async (endpoint, payload) => {
    const res = await axios.post(`${PYTHON_AI_URL}${endpoint}`, payload, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
};

// Helper: save insight to MongoDB
const saveInsight = async (farmId, userId, type, data, score, summary, inputSnapshot, cropCycleId = null) => {
    return await FarmInsight.create({
        farm: farmId,
        user: userId,
        cropCycle: cropCycleId,
        type,
        score,
        summary,
        data,
        inputSnapshot
    });
};

// Helper: get latest sensor reading for a farm
const getLatestSensor = async (farmId) => {
    return await SensorData.findOne({ farm: farmId }).sort({ timestamp: -1 }).lean();
};

// Helper: get active crop cycle for a farm
const getActiveCycle = async (farmId) => {
    return await CropCycle.findOne({ farm: farmId, status: 'Active' }).sort({ createdAt: -1 }).lean();
};


// @desc   Get Farm Health Score
// @route  GET /api/insights/farm-health/:farmId
// @access Private
exports.getFarmHealth = async (req, res) => {
    try {
        const { farmId } = req.params;
        const userId = req.user._id;

        const [sensor, cycle] = await Promise.all([
            getLatestSensor(farmId),
            getActiveCycle(farmId)
        ]);

        const moisture = sensor?.metrics?.soilMoisture ?? 50;
        const temperature = sensor?.metrics?.temperature ?? 27;
        const stage = cycle?.stage || cycle?.currentStage || 'vegetative';

        // Get previous pest risk for context
        const latestPestInsight = await FarmInsight.findOne({ farm: farmId, type: 'pest' }).sort({ createdAt: -1 }).lean();
        const pestRisk = latestPestInsight?.data?.risk_level || 'Low';

        const payload = {
            soil_moisture: moisture,
            temperature: temperature,
            crop_stage: stage,
            recent_rainfall_mm: 40, // TODO: integrate weather API
            pest_risk_level: pestRisk
        };

        const aiResult = await callAI('/predict/farm-health', payload);

        const saved = await saveInsight(
            farmId, userId, 'health',
            aiResult,
            aiResult.health_score,
            `Farm health is ${aiResult.label} (${aiResult.health_score}/100)`,
            { sensor: payload, crop_stage: stage }
        );

        res.status(200).json({ success: true, data: { ...aiResult, insightId: saved._id, generatedAt: saved.createdAt } });
    } catch (error) {
        console.error('Farm health error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to compute farm health score', error: error.message });
    }
};


// @desc   Get Yield Prediction
// @route  GET /api/insights/yield-prediction/:farmId
// @access Private
exports.getYieldPrediction = async (req, res) => {
    try {
        const { farmId } = req.params;
        const userId = req.user._id;

        const [farm, sensor, cycle] = await Promise.all([
            Farm.findById(farmId).lean(),
            getLatestSensor(farmId),
            getActiveCycle(farmId)
        ]);

        if (!cycle) return res.status(404).json({ success: false, message: 'No active crop cycle found for this farm.' });

        const payload = {
            crop: cycle.cropName || cycle.cropType || 'wheat',
            acreage: farm?.size || farm?.acreage || 1,
            soil_moisture: sensor?.metrics?.soilMoisture ?? 50,
            historical_temp: [27, 28, 26, 29, 27],
            fertilizer_applied_kg: 0,
            soil_type: farm?.soilType || 'loamy'
        };

        const aiResult = await callAI('/predict/yield', payload);

        const saved = await saveInsight(
            farmId, userId, 'yield',
            aiResult,
            Math.round(aiResult.confidence_score * 100),
            `Predicted yield: ${aiResult.predicted_yield_kg.toLocaleString()} kg (${Math.round(aiResult.confidence_score * 100)}% confidence)`,
            payload,
            cycle._id
        );

        res.status(200).json({ success: true, data: { ...aiResult, cropCycle: cycle.cropName || cycle.cropType, cropCycleId: cycle._id, insightId: saved._id } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Yield prediction failed', error: error.message });
    }
};


// @desc   Get Pest Risk Prediction
// @route  GET /api/insights/pest-risk/:farmId
// @access Private
exports.getPestRisk = async (req, res) => {
    try {
        const { farmId } = req.params;
        const userId = req.user._id;

        const [sensor, cycle] = await Promise.all([
            getLatestSensor(farmId),
            getActiveCycle(farmId)
        ]);

        const humidity = sensor?.metrics?.humidity ?? 65;
        const temp = sensor?.metrics?.temperature ?? 27;

        const payload = {
            forecast_humidity: [humidity, humidity + 2, humidity - 1, humidity + 4, humidity + 1],
            forecast_temp: [temp, temp + 1, temp - 0.5, temp + 2, temp],
            crop: cycle?.cropName || cycle?.cropType || 'wheat',
            growth_stage: cycle?.stage || cycle?.currentStage || 'vegetative'
        };

        const aiResult = await callAI('/predict/pest-risk', payload);
        const riskScore = aiResult.risk_level === 'High' ? 85 : aiResult.risk_level === 'Medium' ? 55 : 20;

        const saved = await saveInsight(
            farmId, userId, 'pest',
            aiResult,
            riskScore,
            `Pest risk: ${aiResult.risk_level} — ${aiResult.pest}`,
            payload
        );

        res.status(200).json({ success: true, data: { ...aiResult, insightId: saved._id } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Pest risk prediction failed', error: error.message });
    }
};


// @desc   Get Irrigation Advice
// @route  GET /api/insights/irrigation-advice/:farmId
// @access Private
exports.getIrrigationAdvice = async (req, res) => {
    try {
        const { farmId } = req.params;
        const userId = req.user._id;

        const [sensor, cycle] = await Promise.all([
            getLatestSensor(farmId),
            getActiveCycle(farmId)
        ]);

        const moisture = sensor?.metrics?.soilMoisture ?? 45;
        const temp = sensor?.metrics?.temperature ?? 28;

        const payload = {
            soil_moisture: moisture,
            temperature: temp,
            rain_forecast_mm: 5,
            crop_stage: cycle?.stage || cycle?.currentStage || 'vegetative'
        };

        const aiResult = await callAI('/predict/irrigation', payload);
        const score = aiResult.irrigation_needed ? (aiResult.severity === 'Critical' ? 10 : 40) : 90;

        const saved = await saveInsight(
            farmId, userId, 'irrigation',
            aiResult,
            score,
            aiResult.irrigation_needed
                ? `Irrigate for ${aiResult.recommended_duration_minutes} min at ${aiResult.suggested_time}`
                : 'No irrigation needed currently',
            payload
        );

        res.status(200).json({ success: true, data: { ...aiResult, insightId: saved._id } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Irrigation advice failed', error: error.message });
    }
};


// @desc   Get Market Price Intelligence
// @route  GET /api/insights/market-price/:cropType
// @access Private
exports.getMarketIntelligence = async (req, res) => {
    try {
        const { cropType } = req.params;
        const { weeksAway = 4 } = req.query;
        const userId = req.user._id;

        // Fetch historical price data from DB (last 8 weeks)
        const priceRecords = await MarketPrice.find({ crop: new RegExp(cropType, 'i') })
            .sort({ date: -1 }).limit(8).lean();

        const prices = priceRecords.map(p => p.pricePerKg || p.price || 0).reverse();
        const currentPrice = prices[prices.length - 1] || 100;

        if (prices.length === 0) {
            // Return with mock price if no market data
            prices.push(100, 102, 99, 104);
        }

        const payload = {
            crop_type: cropType,
            current_price_per_kg: currentPrice,
            historical_prices: prices,
            harvest_date_weeks_away: parseInt(weeksAway)
        };

        const aiResult = await callAI('/predict/market-price', payload);

        res.status(200).json({ success: true, data: { ...aiResult, cropType, priceHistory: prices } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Market intelligence failed', error: error.message });
    }
};


// @desc   Get all previous insights for a farm (history)
// @route  GET /api/insights/history/:farmId
// @access Private
exports.getInsightHistory = async (req, res) => {
    try {
        const { farmId } = req.params;
        const insights = await FarmInsight.find({ farm: farmId })
            .sort({ createdAt: -1 }).limit(20).lean();
        res.status(200).json({ success: true, data: insights });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch insight history', error: error.message });
    }
};
