const mongoose = require('mongoose');
const crypto = require('crypto');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        default: () => crypto.randomUUID(),
        unique: true,
        required: true,
        index: true
    },
    orderNumber: {
        type: String,
        unique: true,
        default: () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    items: [{
        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MarketplaceListing',
            required: true
        },
        productName: String, // Snapshot for history
        quantity: Number,
        priceAtTime: Number,
        subtotal: Number
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    deliveryAddress: {
        type: Object, // Could be detailed structure
        required: true
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'failed'],
        default: 'pending'
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    },
    notes: String,
    statusHistory: [{
        status: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        comment: String
    }]
}, {
    timestamps: true
});

// Index for chronological queries
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
