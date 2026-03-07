const mongoose = require('mongoose');

const fixedDepositSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fdNumber: {
        type: String,
        unique: true,
        required: true
    },
    principalAmount: {
        type: Number,
        required: true,
        min: 1000
    },
    interestRate: {
        type: Number,
        required: true,
        min: 0
    },
    tenure: {
        value: {
            type: Number,
            required: true,
            min: 1
        },
        unit: {
            type: String,
            enum: ['months', 'years'],
            default: 'months'
        }
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    maturityDate: {
        type: Date,
        required: true
    },
    maturityAmount: {
        type: Number,
        required: true
    },
    interestEarned: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'matured', 'withdrawn', 'broken'],
        default: 'active'
    },
    autoRenew: {
        type: Boolean,
        default: false
    },
    nomineeDetails: {
        name: String,
        relationship: String,
        phone: String
    },
    creationTransaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    },
    maturityTransaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    },
    withdrawnAt: Date,
    penaltyAmount: {
        type: Number,
        default: 0
    },
    metadata: {
        scheme: String,
        notes: String
    }
}, {
    timestamps: true
});

// Generate FD number
fixedDepositSchema.statics.generateFDNumber = function() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `FD${timestamp}${random}`.toUpperCase();
};

// Calculate maturity amount
fixedDepositSchema.statics.calculateMaturityAmount = function(principal, rate, tenureMonths) {
    // Simple Interest: A = P(1 + rt)
    // Compound Interest: A = P(1 + r/n)^(nt)
    // Using quarterly compounding (n=4)
    const years = tenureMonths / 12;
    const n = 4; // Quarterly compounding
    const r = rate / 100;
    const amount = principal * Math.pow((1 + r / n), n * years);
    return Math.round(amount * 100) / 100;
};

// Calculate interest earned
fixedDepositSchema.methods.calculateInterest = function() {
    return this.maturityAmount - this.principalAmount;
};

// Check if FD is mature
fixedDepositSchema.methods.isMature = function() {
    return new Date() >= this.maturityDate;
};

// Calculate penalty for premature withdrawal
fixedDepositSchema.methods.calculatePenalty = function() {
    if (this.isMature()) return 0;
    
    // Penalty: 1% of principal or reduced interest rate
    const penaltyRate = 0.01;
    return Math.round(this.principalAmount * penaltyRate);
};

// Indexes
fixedDepositSchema.index({ user: 1, status: 1 });
fixedDepositSchema.index({ maturityDate: 1, status: 1 });
fixedDepositSchema.index({ fdNumber: 1 });

module.exports = mongoose.model('FixedDeposit', fixedDepositSchema);
