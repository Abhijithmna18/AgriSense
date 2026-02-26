const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getRotationAdvice } = require('../controllers/cropRotationController');
const { generateCalendar } = require('../controllers/cropCalendarController');

router.use(protect);

router.post('/rotation', getRotationAdvice);
router.post('/calendar', generateCalendar);

module.exports = router;
