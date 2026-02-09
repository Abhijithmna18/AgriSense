const express = require('express');
const router = express.Router();
const decisionSupportController = require('../controllers/decisionSupportController');
const { protect } = require('../middleware/auth');

// Route to run full crop cycle analysis
// POST /api/decision-support/analyze
router.post('/analyze', protect, decisionSupportController.runAnalysis);

module.exports = router;
