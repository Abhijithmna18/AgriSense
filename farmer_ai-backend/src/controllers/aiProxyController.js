const axios = require('axios');

// Default to local python server if env var is missing
const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:8000';

/**
 * @desc    Get Yield Prediction from Python AI Service
 * @route   POST /api/ai/yield-prediction
 * @access  Private (Farmer)
 */
exports.getYieldPrediction = async (req, res) => {
    try {
        const { crop, acreage, historical_temp, soil_type } = req.body;

        // Pass payload to Python
        const response = await axios.post(`${PYTHON_AI_URL}/predict/yield`, {
            crop,
            acreage,
            historical_temp,
            soil_type
        });

        res.status(200).json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error("AI Proxy Error (Yield):", error.message);
        res.status(500).json({
            success: false,
            error: 'AI Engine unreachable or failed to process prediction.'
        });
    }
};

/**
 * @desc    Get Pest Risk Prediction from Python AI Service
 * @route   POST /api/ai/pest-risk
 * @access  Private
 */
exports.getPestRiskPrediction = async (req, res) => {
    try {
        const { forecast_humidity, forecast_temp, crop } = req.body;

        const response = await axios.post(`${PYTHON_AI_URL}/predict/pest-risk`, {
            forecast_humidity,
            forecast_temp,
            crop
        });

        res.status(200).json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error("AI Proxy Error (Pest Risk):", error.message);
        res.status(500).json({
            success: false,
            error: 'AI Engine unreachable or failed to process prediction.'
        });
    }
};
