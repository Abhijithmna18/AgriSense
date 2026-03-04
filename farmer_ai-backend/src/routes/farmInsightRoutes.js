const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getFarmHealth,
    getYieldPrediction,
    getPestRisk,
    getIrrigationAdvice,
    getMarketIntelligence,
    getInsightHistory
} = require('../controllers/farmInsightController');

router.use(protect);

// GET /api/insights/farm-health/:farmId
router.get('/farm-health/:farmId', getFarmHealth);

// GET /api/insights/yield-prediction/:farmId
router.get('/yield-prediction/:farmId', getYieldPrediction);

// GET /api/insights/pest-risk/:farmId
router.get('/pest-risk/:farmId', getPestRisk);

// GET /api/insights/irrigation-advice/:farmId
router.get('/irrigation-advice/:farmId', getIrrigationAdvice);

// GET /api/insights/market-price/:cropType?weeksAway=4
router.get('/market-price/:cropType', getMarketIntelligence);

// GET /api/insights/history/:farmId
router.get('/history/:farmId', getInsightHistory);

module.exports = router;
