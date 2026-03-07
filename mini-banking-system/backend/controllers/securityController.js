const OTP = require('../models/OTP');
const User = require('../models/User');

// @desc    Send OTP
// @route   POST /api/security/send-otp
// @access  Private
exports.sendOTP = async (req, res) => {
    try {
        const { purpose } = req.body;
        const otp = await OTP.createOTP(req.user._id, purpose);

        // TODO: Send OTP via SMS/Email
        console.log(`OTP for ${req.user.phone}: ${otp.otp}`);

        res.json({
            success: true,
            message: 'OTP sent successfully',
            data: { expiresAt: otp.expiresAt }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/security/verify-otp
// @access  Private
exports.verifyOTP = async (req, res) => {
    try {
        const { otp, purpose } = req.body;

        const otpRecord = await OTP.findOne({
            user: req.user._id,
            purpose,
            isUsed: false
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'OTP not found' });
        }

        const verification = await otpRecord.verify(otp);
        res.json({ success: verification.success, message: verification.message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Change PIN
// @route   POST /api/security/change-pin
// @access  Private
exports.changePin = async (req, res) => {
    try {
        const { oldPin, newPin } = req.body;

        if (newPin.length !== 4) {
            return res.status(400).json({ success: false, message: 'PIN must be 4 digits' });
        }

        const user = await User.findById(req.user._id).select('+pin');

        // Verify old PIN if exists
        if (user.pin && user.pin !== oldPin) {
            return res.status(400).json({ success: false, message: 'Invalid old PIN' });
        }

        user.pin = newPin;
        await user.save();

        res.json({ success: true, message: 'PIN changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
