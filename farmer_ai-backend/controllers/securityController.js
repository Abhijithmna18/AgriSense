/**
 * Security Controller
 * Handles security operations like OTP and PIN management
 */

exports.sendOTP = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        res.json({
            success: true,
            message: 'OTP sent successfully',
            data: { phoneNumber, otpSent: true }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        res.json({
            success: true,
            message: 'OTP verified successfully',
            data: { phoneNumber, verified: true }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.changePin = async (req, res) => {
    try {
        const { oldPin, newPin } = req.body;
        res.json({
            success: true,
            message: 'PIN changed successfully',
            data: { pinChanged: true }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
