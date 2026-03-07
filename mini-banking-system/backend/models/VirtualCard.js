const mongoose = require('mongoose');
const crypto = require('crypto');

const virtualCardSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cardNumber: {
        type: String,
        required: true,
        unique: true
    },
    cardHolderName: {
        type: String,
        required: true
    },
    expiryMonth: {
        type: String,
        required: true
    },
    expiryYear: {
        type: String,
        required: true
    },
    cvv: {
        type: String,
        required: true,
        select: false
    },
    cardType: {
        type: String,
        enum: ['debit', 'credit'],
        default: 'debit'
    },
    network: {
        type: String,
        enum: ['visa', 'mastercard', 'rupay'],
        default: 'rupay'
    },
    status: {
        type: String,
        enum: ['active', 'frozen', 'blocked', 'expired'],
        default: 'active'
    },
    isFrozen: {
        type: Boolean,
        default: false
    },
    frozenAt: Date,
    frozenReason: String,
    limits: {
        daily: {
            type: Number,
            default: 50000
        },
        monthly: {
            type: Number,
            default: 200000
        },
        perTransaction: {
            type: Number,
            default: 25000
        }
    },
    usage: {
        dailySpent: {
            type: Number,
            default: 0
        },
        monthlySpent: {
            type: Number,
            default: 0
        },
        lastResetDate: {
            type: Date,
            default: Date.now
        }
    },
    features: {
        contactless: {
            type: Boolean,
            default: true
        },
        international: {
            type: Boolean,
            default: false
        },
        onlineTransactions: {
            type: Boolean,
            default: true
        },
        atmWithdrawal: {
            type: Boolean,
            default: true
        }
    },
    pin: {
        type: String,
        select: false
    },
    lastUsed: Date,
    activatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Generate card number
virtualCardSchema.statics.generateCardNumber = function(network = 'rupay') {
    const bins = {
        visa: '4',
        mastercard: '5',
        rupay: '6'
    };
    
    const bin = bins[network] || '6';
    let cardNumber = bin;
    
    // Generate 15 more digits
    for (let i = 0; i < 15; i++) {
        cardNumber += Math.floor(Math.random() * 10);
    }
    
    return cardNumber;
};

// Generate CVV
virtualCardSchema.statics.generateCVV = function() {
    return Math.floor(100 + Math.random() * 900).toString();
};

// Generate expiry date (5 years from now)
virtualCardSchema.statics.generateExpiry = function() {
    const now = new Date();
    const expiryDate = new Date(now.setFullYear(now.getFullYear() + 5));
    return {
        month: (expiryDate.getMonth() + 1).toString().padStart(2, '0'),
        year: expiryDate.getFullYear().toString().slice(-2)
    };
};

// Mask card number
virtualCardSchema.methods.getMaskedNumber = function() {
    return `**** **** **** ${this.cardNumber.slice(-4)}`;
};

// Check if card is expired
virtualCardSchema.methods.isExpired = function() {
    const now = new Date();
    const expiry = new Date(`20${this.expiryYear}-${this.expiryMonth}-01`);
    return now > expiry;
};

// Freeze/Unfreeze card
virtualCardSchema.methods.toggleFreeze = async function(reason = '') {
    this.isFrozen = !this.isFrozen;
    this.status = this.isFrozen ? 'frozen' : 'active';
    
    if (this.isFrozen) {
        this.frozenAt = new Date();
        this.frozenReason = reason;
    } else {
        this.frozenAt = null;
        this.frozenReason = null;
    }
    
    await this.save();
    return this;
};

// Check transaction limit
virtualCardSchema.methods.canTransact = function(amount) {
    if (this.isFrozen || this.status !== 'active') {
        return { allowed: false, reason: 'Card is not active' };
    }
    
    if (this.isExpired()) {
        return { allowed: false, reason: 'Card has expired' };
    }
    
    if (amount > this.limits.perTransaction) {
        return { allowed: false, reason: 'Exceeds per transaction limit' };
    }
    
    if (this.usage.dailySpent + amount > this.limits.daily) {
        return { allowed: false, reason: 'Exceeds daily limit' };
    }
    
    if (this.usage.monthlySpent + amount > this.limits.monthly) {
        return { allowed: false, reason: 'Exceeds monthly limit' };
    }
    
    return { allowed: true };
};

// Update usage
virtualCardSchema.methods.recordTransaction = async function(amount) {
    this.usage.dailySpent += amount;
    this.usage.monthlySpent += amount;
    this.lastUsed = new Date();
    await this.save();
};

// Reset daily usage (called by cron job)
virtualCardSchema.statics.resetDailyUsage = async function() {
    await this.updateMany(
        {},
        { 
            $set: { 
                'usage.dailySpent': 0,
                'usage.lastResetDate': new Date()
            }
        }
    );
};

// Indexes
virtualCardSchema.index({ user: 1, status: 1 });
virtualCardSchema.index({ cardNumber: 1 });

module.exports = mongoose.model('VirtualCard', virtualCardSchema);
