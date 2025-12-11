const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please add a first name'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Please add a last name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        trim: true
    },
    role: {
        type: String,
        enum: ['farmer', 'buyer', 'admin'],
        default: 'farmer'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    password: {
        type: String,
        required: function () {
            return this.provider === 'local';
        },
        minlength: 6,
        select: false // Don't return password by default
    },
    // New authentication fields
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerifiedAt: {
        type: Date
    },
    otp: {
        codeHash: String,
        type: {
            type: String,
            enum: ['email_verification', 'password_reset']
        },
        expiresAt: Date,
        tries: {
            type: Number,
            default: 0
        },
        sentCount: {
            type: Number,
            default: 0
        },
        lastSentAt: Date
    },
    provider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    googleSub: {
        type: String,
        sparse: true
    },
    location: {
        // GeoJSON Point
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        }
    },
    profilePhotoUrl: {
        type: String
    },
    organization: {
        type: String
    },
    addresses: [{
        label: {
            type: String,
            enum: ['home', 'office'],
            default: 'home'
        },
        addressLine: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    }],
    preferences: {
        timezone: String,
        language: {
            type: String,
            default: 'en'
        },
        units: {
            type: String,
            enum: ['metric', 'imperial'],
            default: 'metric'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update updatedAt on save
UserSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

// Compound index for email and provider
UserSchema.index({ email: 1, provider: 1 });

// Encrypt password using bcrypt
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to compare password (alias for compatibility)
UserSchema.methods.comparePassword = async function (plainPassword) {
    if (!this.password) {
        return false;
    }
    return await bcrypt.compare(plainPassword, this.password);
};

// Method to set OTP
UserSchema.methods.setOtp = function (plainOtp, type = 'email_verification') {
    const OTP_SECRET = process.env.OTP_SECRET || 'default_otp_secret_change_me';
    const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;

    // Hash OTP with HMAC-SHA256
    const codeHash = crypto
        .createHmac('sha256', OTP_SECRET)
        .update(plainOtp.toString())
        .digest('hex');

    // Set OTP data
    this.otp = {
        codeHash,
        type,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
        tries: 0,
        sentCount: (this.otp?.sentCount || 0) + 1,
        lastSentAt: new Date()
    };
};

// Method to verify OTP
UserSchema.methods.verifyOtp = function (plainOtp) {
    const OTP_SECRET = process.env.OTP_SECRET || 'default_otp_secret_change_me';
    const OTP_MAX_TRIES = parseInt(process.env.OTP_MAX_TRIES) || 3;

    // Check if OTP exists
    if (!this.otp || !this.otp.codeHash) {
        return { success: false, message: 'No OTP found' };
    }

    // Check if OTP has expired
    if (new Date() > this.otp.expiresAt) {
        return { success: false, message: 'OTP has expired' };
    }

    // Check max tries
    if (this.otp.tries >= OTP_MAX_TRIES) {
        return { success: false, message: 'Maximum OTP attempts exceeded' };
    }

    // Hash the provided OTP
    const providedHash = crypto
        .createHmac('sha256', OTP_SECRET)
        .update(plainOtp.toString())
        .digest('hex');

    // Constant-time comparison
    const isValid = crypto.timingSafeEqual(
        Buffer.from(this.otp.codeHash, 'hex'),
        Buffer.from(providedHash, 'hex')
    );

    if (!isValid) {
        this.otp.tries += 1;
        return { success: false, message: 'Invalid OTP' };
    }

    return { success: true, message: 'OTP verified successfully' };
};

// Method to clear OTP
UserSchema.methods.clearOtp = function () {
    this.otp = {
        codeHash: undefined,
        type: undefined,
        expiresAt: undefined,
        tries: 0,
        sentCount: this.otp?.sentCount || 0,
        lastSentAt: this.otp?.lastSentAt
    };
};

// Don't return sensitive fields in JSON
UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.otp;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('User', UserSchema);
