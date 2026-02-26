const axios = require('axios');

const YIELD_ML_URL = process.env.YIELD_ML_SERVICE_URL || 'http://127.0.0.1:8001';

/**
 * @desc    Health check for the Yield Prediction ML service
 * @route   GET /api/yield/health
 * @access  Public
 */
exports.checkYieldMLHealth = async (req, res) => {
    try {
        const response = await axios.get(`${YIELD_ML_URL}/health`, { timeout: 5000 });
        res.status(200).json({ success: true, mlService: { ...response.data, status: 'online' } });
    } catch (error) {
        res.status(503).json({
            success: false,
            mlService: {
                status: 'offline',
                message: 'Yield ML service not running. Start with: uvicorn main:app --port 8001 in crop_yield_ml/'
            }
        });
    }
};

/**
 * @desc    Get feature metadata for frontend dropdowns
 * @route   GET /api/yield/metadata
 * @access  Private
 */
exports.getMetadata = async (req, res) => {
    try {
        const response = await axios.get(`${YIELD_ML_URL}/metadata`, { timeout: 10000 });
        res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ success: false, message: 'Yield ML service is offline.' });
        }
        res.status(500).json({ success: false, message: 'Failed to fetch model metadata.' });
    }
};

/**
 * @desc    Predict crop yield
 * @route   POST /api/yield/predict
 * @access  Private
 */
exports.predictYield = async (req, res) => {
    const { inputs } = req.body;

    if (!inputs || typeof inputs !== 'object' || Object.keys(inputs).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Request body must contain an "inputs" object with farm/crop features.'
        });
    }

    try {
        const response = await axios.post(
            `${YIELD_ML_URL}/predict-yield`,
            { inputs },
            { timeout: 15000 }
        );
        res.status(200).json({ success: true, ...response.data });
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                message: 'Yield ML service is not running. Please start the Python server on port 8001.'
            });
        }
        console.error('Yield prediction error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.detail || 'Prediction failed. Please try again.'
        });
    }
};
