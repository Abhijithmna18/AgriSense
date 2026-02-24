const express = require('express');
const router = express.Router();
const {
    getRecommendation,
    getMetrics,
    getComparison,
    getHistory,
    runSimulation,
} = require('../controllers/rlIrrigationController');
const { protect, authorize } = require('../middleware/auth');

// All routes require JWT authentication
router.use(protect);

// Irrigation Recommendation
router.get('/recommendation/:farmId', getRecommendation);
router.get('/history/:farmId', getHistory);

// Training Metrics & Research Comparison
router.get('/metrics', getMetrics);
router.get('/compare', getComparison);

// Simulation
router.post('/simulate', runSimulation);

module.exports = router;
