const mongoose = require('mongoose');
const crypto = require('crypto');

const paymentRecordSchema = new mongoose.Schema({
    paymentId: {
        type: String,
        default: () => crypto.randomUUID(),
        unique: true,
        required: true,
        index: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    method: {
        type: String, // 'razorpay', 'cash', 'bank_transfer'
        required: true
    },
    referenceId: {
        type: String // External transaction ID
    },
    status: {
        type: String,
        enum: ['verified', 'flagged', 'pending_verification'],
        default: 'pending_verification'
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: Date,
    flaggedReason: String,

    // Immutable Transaction Log
    transactionLogs: [{
        event: String, // 'CREATED', 'VERIFIED', 'FLAGGED'
        timestamp: { type: Date, default: Date.now },
        details: Object
    }]
}, {
    timestamps: true
});

// Prevent hard deletes - although Mongoose doesn't strictly block deleteOne, we enforce logic in controller
// The logs array serves as the immutable history

module.exports = mongoose.model('PaymentRecord', paymentRecordSchema);
