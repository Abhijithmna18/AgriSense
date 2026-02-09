const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getPriceHistory,
    predictPriceTrend,
    seedMarketData
} = require('../controllers/marketPriceController');

// All routes are protected
router.use(protect);

router.post('/seed', seedMarketData); // Dev utility
router.post('/predict', predictPriceTrend);
router.get('/:crop', getPriceHistory);

module.exports = router;
