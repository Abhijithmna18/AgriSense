const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getRotationAdvice } = require('../controllers/cropRotationController');

router.use(protect);

router.post('/rotation', getRotationAdvice);

module.exports = router;
