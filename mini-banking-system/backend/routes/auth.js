const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { register, login, verifyOTP, getMe, logout } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
