const User = require('../models/User');
const crypto = require('crypto');
const { generateAccessToken } = require('../utils/jwt');
const { sendVerificationEmail } = require('../services/mailer');
const { body, validationResult } = require('express-validator');
const admin = require('../config/firebase');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user and send OTP
 * @access  Public
 */
exports.register = [
    // Validation middleware
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').matches(/^\+?\d{10,15}$/).withMessage('Valid phone number is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),

    async (req, res) => {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { firstName, lastName, email, phone, password, role, organization, addresses, preferences } = req.body;

            // Check if user exists
            const existingUser = await User.findOne({ email: email.toLowerCase() });

            if (existingUser) {
                if (existingUser.provider === 'google') {
                    return res.status(400).json({
                        success: false,
                        message: 'Account exists with Google Sign-In. Please use Google Sign-In to login.'
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: 'User already exists with this email'
                });
            }

            // Generate 6-digit OTP
            const otp = crypto.randomInt(100000, 999999).toString();

            // Create user
            const user = new User({
                firstName,
                lastName,
                email: email.toLowerCase(),
                phone,
                password, // Will be hashed by pre-save hook
                role: role || 'farmer',
                organization,
                addresses,
                preferences,
                provider: 'local',
                isEmailVerified: false
            });

            // Set OTP
            user.setOtp(otp, 'email_verification');

            // Save user
            // Save user
            // Save user
            await user.save();

            // Send verification email
            const verificationLink = `${process.env.FRONTEND_URL}/verify?email=${encodeURIComponent(email)}&otp=${otp}`;

            await sendVerificationEmail({
                to: email,
                name: firstName,
                otp,
                link: verificationLink
            });

            res.status(201).json({
                success: true,
                message: 'Registration successful. OTP sent to your email.'
            });

        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during registration'
            });
        }
    }
];

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with OTP
 * @access  Public
 */
exports.verifyEmail = [
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric(),

    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { email, otp } = req.body;

            // Find user
            const user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email or OTP'
                });
            }

            // Verify OTP
            const verificationResult = user.verifyOtp(otp);

            if (!verificationResult.success) {
                await user.save(); // Save incremented tries
                return res.status(400).json({
                    success: false,
                    message: verificationResult.message
                });
            }

            // Mark email as verified
            user.isEmailVerified = true;
            user.emailVerifiedAt = new Date();
            user.clearOtp();

            await user.save();

            // Generate JWT token
            const token = generateAccessToken({
                userId: user._id,
                email: user.email
            });

            res.status(200).json({
                success: true,
                message: 'Email verified successfully',
                token,
                user: user.toJSON()
            });

        } catch (error) {
            console.error('Verify email error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during verification'
            });
        }
    }
];

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP to email
 * @access  Public
 */
exports.resendOtp = [
    body('email').isEmail().normalizeEmail(),

    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { email } = req.body;

            // Find user
            const user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (user.isEmailVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already verified'
                });
            }

            // Check rate limiting
            const OTP_RESEND_LIMIT_PER_HOUR = parseInt(process.env.OTP_RESEND_LIMIT_PER_HOUR) || 3;
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

            if (user.otp && user.otp.lastSentAt > oneHourAgo && user.otp.sentCount >= OTP_RESEND_LIMIT_PER_HOUR) {
                return res.status(429).json({
                    success: false,
                    message: 'Too many OTP requests. Please try again later.'
                });
            }

            // Generate new OTP
            const otp = crypto.randomInt(100000, 999999).toString();
            user.setOtp(otp, 'email_verification');
            await user.save();

            // Send email
            const verificationLink = `${process.env.FRONTEND_URL}/verify?email=${encodeURIComponent(email)}&otp=${otp}`;

            await sendVerificationEmail({
                to: email,
                name: user.firstName,
                otp,
                link: verificationLink
            });

            res.status(200).json({
                success: true,
                message: 'OTP resent successfully'
            });

        } catch (error) {
            console.error('Resend OTP error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while resending OTP'
            });
        }
    }
];

/**
 * @route   POST /api/auth/login
 * @desc    Login user with email and password
 * @access  Public
 */
exports.login = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),

    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { email, password } = req.body;

            // Find user with password field
            const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check if Google user
            if (user.provider === 'google' && !user.password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please use Google Sign-In to login'
                });
            }

            // Check if email is verified
            if (!user.isEmailVerified) {
                return res.status(401).json({
                    success: false,
                    message: 'Please verify your email before logging in',
                    needsVerification: true
                });
            }

            // Verify password
            const isMatch = await user.comparePassword(password);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Generate token
            const token = generateAccessToken({
                userId: user._id,
                email: user.email
            });

            res.status(200).json({
                success: true,
                message: 'Login successful',
                token,
                user: user.toJSON()
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during login'
            });
        }
    }
];

/**
 * @route   POST /api/auth/google-login
 * @desc    Login/Register with Google
 * @access  Public
 */
exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: 'ID token is required'
            });
        }

        // Verify Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, name, uid: googleSub, picture } = decodedToken;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Google account must have an email address'
            });
        }

        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            // User exists
            if (user.provider === 'local' && !user.isEmailVerified) {
                // Trust Google verification
                user.isEmailVerified = true;
                user.emailVerifiedAt = new Date();
                await user.save();
            }

            // If user exists but doesn't have googleSub, update it (linking accounts)
            if (!user.googleSub) {
                user.googleSub = googleSub;
                user.provider = 'google'; // Or keep 'local' but allow google login? Let's switch to google or keep hybrid.
                // For simplicity, let's just ensure googleSub is set so we know they can login with google.
                // But our schema has provider enum.
                // If provider is local, they have password. If google, they might not.
                // Let's just update googleSub.
                await user.save();
            }
        } else {
            // Create new user
            const [firstName, ...lastNameParts] = (name || email.split('@')[0]).split(' ');
            user = new User({
                firstName: firstName || 'User',
                lastName: lastNameParts.join(' ') || 'Name',
                email: email.toLowerCase(),
                phone: '', // Optional for Google users
                provider: 'google',
                googleSub,
                isEmailVerified: true,
                emailVerifiedAt: new Date(),
                // Password not required for google provider
            });
            await user.save();
        }

        const token = generateAccessToken({
            userId: user._id,
            email: user.email
        });

        res.status(200).json({
            success: true,
            message: 'Google login successful',
            token,
            user: user.toJSON()
        });

    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during Google login'
        });
    }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
exports.logout = async (req, res) => {
    try {
        // If using refresh tokens, invalidate them here
        // For now, client-side will remove token from localStorage

        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};
