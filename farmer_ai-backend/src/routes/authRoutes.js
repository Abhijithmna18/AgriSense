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

const { protect } = require('../middleware/auth');

// Auth routes
router.post('/register', authLimiter, authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-otp', otpLimiter, authController.resendOtp);
router.post('/login', authLimiter, authController.login);
router.post('/google-login', authController.googleLogin);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/verify-reset', authLimiter, authController.verifyReset);
router.post('/resend-reset', otpLimiter, authController.resendReset);
router.post('/logout', authController.logout);
router.post('/switch-role', protect, authController.switchRole);
router.post('/add-role', protect, authController.addRole);
router.post('/change-password', protect, authController.changePassword);
router.post('/2fa/enable', protect, authController.enable2FA);
router.post('/2fa/verify', protect, authController.verify2FA);
router.post('/2fa/disable', protect, authController.disable2FA);
router.post('/logout-all', protect, authController.logoutAll);
router.post('/vendor/apply', protect, authController.submitVendorApplication);
router.get('/vendor/me', protect, authController.getSellerProfile);

module.exports = router;
