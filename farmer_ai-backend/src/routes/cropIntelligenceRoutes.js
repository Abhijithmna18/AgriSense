const express = require('express');
const router = express.Router();
const cropIntelligenceController = require('../controllers/cropIntelligenceController');
const { protect } = require('../middleware/auth');

// Route to handle AI queries
// POST /api/crop-intelligence/query
router.post('/query', protect, cropIntelligenceController.handleQuery);

module.exports = router;
