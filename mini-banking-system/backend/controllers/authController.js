const User = require('../models/User');
const Wallet = require('../models/Wallet');
const OTP = require('../models/OTP');
const { generateToken } = require('../middleware/auth');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { phone }] });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or phone'
            });
        }

        // Generate account number and VPA
        const accountNumber = await User.generateAccountNumber();
        const vpa = User.generateVPA(name);

        // Create user
        const user = await User.create({
            name,
            email,
            phone,
            password,
            accountNumber,
            vpa
        });

        // Create wallet for user
        await Wallet.create({ user: user._id });

        // Generate OTP for verification
        const otp = await OTP.createOTP(user._id, 'registration');

        // TODO: Send OTP via SMS/Email
        console.log(`Registration OTP for ${phone}: ${otp.otp}`);

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please verify OTP.',
            data: {
                userId: user._id,
                email: user.email,
                phone: user.phone,
                accountNumber: user.accountNumber,
                vpa: user.vpa
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user with password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Generate OTP for login
        const otp = await OTP.createOTP(user._id, 'login');

        // TODO: Send OTP via SMS/Email
        console.log(`Login OTP for ${user.phone}: ${otp.otp}`);

        res.json({
            success: true,
            message: 'OTP sent successfully',
            data: {
                userId: user._id,
                requiresOTP: true
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Verify OTP and complete login
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
    try {
        const { userId, otp, purpose } = req.body;

        // Find latest OTP
        const otpRecord = await OTP.findOne({
            user: userId,
            purpose,
            isUsed: false
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'OTP not found or expired'
            });
        }

        // Verify OTP
        const verification = await otpRecord.verify(otp);

        if (!verification.success) {
            return res.status(400).json({
                success: false,
                message: verification.message
            });
        }

        // Get user
        const user = await User.findById(userId);

        // Update last login
        user.lastLogin = new Date();
        if (purpose === 'registration') {
            user.isVerified = true;
        }
        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    accountNumber: user.accountNumber,
                    vpa: user.vpa,
                    kycStatus: user.kycStatus
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    try {
        // In a real app, you might want to blacklist the token
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
