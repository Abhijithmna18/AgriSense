const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { sendOTP, verifyOTP, changePin } = require('../controllers/securityController');

router.use(protect);

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/change-pin', changePin);

module.exports = router;
