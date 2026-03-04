const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getRotationAdvice } = require('../controllers/cropRotationController');
const { generateCalendar } = require('../controllers/cropCalendarController');
const { handleQuery } = require('../controllers/cropIntelligenceController');

router.use(protect);

router.post('/rotation', getRotationAdvice);
router.post('/calendar', generateCalendar);
router.post('/query', handleQuery);

module.exports = router;
