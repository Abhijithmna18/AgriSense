const express = require('express');
const router = express.Router();
const { getEvents, getEvent, registerForEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/:id/register', protect, registerForEvent);

module.exports = router;
