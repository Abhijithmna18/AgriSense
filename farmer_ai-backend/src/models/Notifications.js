const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['order_received', 'payment_received', 'review_posted', 'order_shipped', 'order_delivered', 'system_alert'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    // Flexible payload for linking to resources
    data: {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketplaceListing' }
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-delete notifications older than 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Notification', NotificationSchema);
