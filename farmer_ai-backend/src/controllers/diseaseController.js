const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * @desc    Health check — pings the Python FastAPI ML service
 * @route   GET /api/ml/health
 * @access  Public
 */
exports.checkMLHealth = async (req, res) => {
    try {
        const response = await axios.get(`${ML_SERVICE_URL}/health`, {
            timeout: 5000  // 5 second timeout for health checks
        });

        res.status(200).json({
            success: true,
            mlService: {
                ...response.data,
                status: 'online'  // Must come AFTER spread so it's not overwritten by Python's "ok"
            }
        });
    } catch (error) {
        const isOffline = error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED';

        res.status(503).json({
            success: false,
            mlService: {
                status: 'offline',
                message: isOffline
                    ? 'The Python ML service is not running. Please start it with: uvicorn main:app --port 8000'
                    : `ML service error: ${error.message}`
            }
        });
    }
};
