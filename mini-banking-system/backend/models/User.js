const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    accountNumber: {
        type: String,
        unique: true,
        required: true
    },
    ifscCode: {
        type: String,
        default: process.env.BANK_IFSC || 'MINI0001234'
    },
    vpa: {
        type: String,
        unique: true // user@minibank
    },
    pin: {
        type: String,
        select: false,
        minlength: 4,
        maxlength: 4
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    kycStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    dailyTransactionLimit: {
        type: Number,
        default: 100000
    },
    singleTransactionLimit: {
        type: Number,
        default: 50000
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate account number
userSchema.statics.generateAccountNumber = async function() {
    const prefix = '1234';
    const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return prefix + random;
};

// Generate VPA
userSchema.statics.generateVPA = function(username) {
    return `${username.toLowerCase().replace(/\s+/g, '')}@minibank`;
};

module.exports = mongoose.model('User', userSchema);
