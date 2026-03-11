const express = require('express');
const router = express.Router();
const { getYieldPrediction, getPestRiskPrediction, getAgronomyAdvice } = require('../controllers/aiProxyController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/yield-prediction', getYieldPrediction);
router.post('/pest-risk', getPestRiskPrediction);
router.post('/agronomy-advice', getAgronomyAdvice);

module.exports = router;
