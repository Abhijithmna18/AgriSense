const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');

// Rate limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { success: false, message: 'Too many requests, please try again later' }
});

const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: { success: false, message: 'Too many OTP requests, please try again later' }
});

// Auth routes
router.post('/register', authLimiter, authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-otp', otpLimiter, authController.resendOtp);
router.post('/login', authLimiter, authController.login);
router.post('/google-login', authController.googleLogin);
router.post('/logout', authController.logout);

module.exports = router;
