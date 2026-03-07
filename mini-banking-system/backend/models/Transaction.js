const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        unique: true,
        required: true
    },
    type: {
        type: String,
        enum: ['transfer', 'deposit', 'withdrawal', 'payment', 'refund'],
        required: true
    },
    category: {
        type: String,
        enum: [
            'p2p_transfer',
            'upi_payment',
            'bill_payment',
            'card_payment',
            'deposit',
            'withdrawal',
            'refund',
            'interest',
            'fd_creation',
            'fd_maturity',
            'savings_contribution'
        ],
        required: true
    },
    from: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        accountNumber: String,
        name: String
    },
    to: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        accountNumber: String,
        name: String,
        vpa: String
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'reversed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['wallet', 'upi', 'card', 'bank_transfer'],
        default: 'wallet'
    },
    description: {
        type: String,
        required: true
    },
    reference: {
        type: String
    },
    metadata: {
        billId: mongoose.Schema.Types.ObjectId,
        cardId: mongoose.Schema.Types.ObjectId,
        fdId: mongoose.Schema.Types.ObjectId,
        savingsGoalId: mongoose.Schema.Types.ObjectId,
        qrCode: String,
        notes: String
    },
    fees: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    netAmount: {
        type: Number
    },
    failureReason: String,
    processedAt: Date,
    completedAt: Date
}, {
    timestamps: true
});

// Indexes for performance
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ 'from.user': 1, createdAt: -1 });
transactionSchema.index({ 'to.user': 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });

// Generate unique transaction ID
transactionSchema.statics.generateTransactionId = function() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `TXN${timestamp}${random}`.toUpperCase();
};

// Calculate net amount
transactionSchema.pre('save', function(next) {
    this.netAmount = this.amount + this.fees + this.tax;
    next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
