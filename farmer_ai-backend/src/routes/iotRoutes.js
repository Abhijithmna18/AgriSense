const express = require('express');
const router = express.Router();
const { ingestTelemetry, getLatestReadings } = require('../controllers/iotController');
const { protect } = require('../middleware/auth');

// Public route for hardware devices (protected internally via API Key header)
router.post('/ingest', ingestTelemetry);

// Protected routes for React dashboard
router.get('/farm/:farmId/latest', protect, getLatestReadings);

module.exports = router;
