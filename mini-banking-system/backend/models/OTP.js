const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        enum: ['login', 'transaction', 'card_activation', 'password_reset', 'registration'],
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    usedAt: Date,
    attempts: {
        type: Number,
        default: 0
    },
    maxAttempts: {
        type: Number,
        default: 3
    },
    metadata: {
        ip: String,
        userAgent: String,
        transactionId: String
    }
}, {
    timestamps: true
});

// Generate 6-digit OTP
otpSchema.statics.generateOTP = function() {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create OTP with expiry
otpSchema.statics.createOTP = async function(userId, purpose, expiryMinutes = 10) {
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    
    return await this.create({
        user: userId,
        otp,
        purpose,
        expiresAt
    });
};

// Verify OTP
otpSchema.methods.verify = async function(inputOTP) {
    // Check if already used
    if (this.isUsed) {
        return { success: false, message: 'OTP already used' };
    }
    
    // Check if expired
    if (new Date() > this.expiresAt) {
        return { success: false, message: 'OTP expired' };
    }
    
    // Check attempts
    if (this.attempts >= this.maxAttempts) {
        return { success: false, message: 'Maximum attempts exceeded' };
    }
    
    // Increment attempts
    this.attempts += 1;
    
    // Verify OTP
    if (this.otp !== inputOTP) {
        await this.save();
        return { success: false, message: 'Invalid OTP' };
    }
    
    // Mark as used
    this.isUsed = true;
    this.usedAt = new Date();
    await this.save();
    
    return { success: true, message: 'OTP verified successfully' };
};

// Auto-delete expired OTPs (TTL index)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ user: 1, purpose: 1, isUsed: 1 });

module.exports = mongoose.model('OTP', otpSchema);
