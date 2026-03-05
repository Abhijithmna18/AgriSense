const express = require('express');
const router = express.Router();
const {
    getInventoryInsights,
    getDemandForecast,
    getPriceRecommendations,
    getVendorPerformanceScore,
    getNegotiationSuggestion,
    getProfitAnalysis
} = require('../controllers/vendorIntelligenceController');

const { protect } = require('../middleware/auth');

// All routes are vendor-protected
router.use(protect);

// GET /api/vendor-intelligence/inventory
router.get('/inventory', getInventoryInsights);

// GET /api/vendor-intelligence/demand/:productType
router.get('/demand/:productType', getDemandForecast);

// GET /api/vendor-intelligence/price-recommendations
router.get('/price-recommendations', getPriceRecommendations);

// GET /api/vendor-intelligence/performance-score
router.get('/performance-score', getVendorPerformanceScore);

// POST /api/vendor-intelligence/negotiate
router.post('/negotiate', getNegotiationSuggestion);

// GET /api/vendor-intelligence/profit-analysis
router.get('/profit-analysis', getProfitAnalysis);

module.exports = router;
