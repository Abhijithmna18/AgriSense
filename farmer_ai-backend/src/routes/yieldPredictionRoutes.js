const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    checkYieldMLHealth,
    getMetadata,
    predictYield
} = require('../controllers/yieldPredictionController');

// @route   GET /api/yield/health
router.get('/health', checkYieldMLHealth);

// @route   GET /api/yield/metadata
router.get('/metadata', protect, getMetadata);

// @route   POST /api/yield/predict
router.post('/predict', protect, predictYield);

module.exports = router;
