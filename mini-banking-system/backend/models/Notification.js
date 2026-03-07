const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'transaction',
            'bill_due',
            'bill_paid',
            'low_balance',
            'loan_emi_due',
            'fd_maturity',
            'savings_goal_achieved',
            'card_transaction',
            'security_alert',
            'system'
        ],
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
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    actionUrl: String,
    actionLabel: String,
    metadata: {
        transactionId: mongoose.Schema.Types.ObjectId,
        billId: mongoose.Schema.Types.ObjectId,
        amount: Number,
        icon: String,
        color: String
    },
    expiresAt: Date
}, {
    timestamps: true
});

// Mark as read
notificationSchema.methods.markAsRead = async function() {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
    return this;
};

// Create notification helper
notificationSchema.statics.createNotification = async function(data) {
    return await this.create({
        user: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority || 'medium',
        actionUrl: data.actionUrl,
        actionLabel: data.actionLabel,
        metadata: data.metadata,
        expiresAt: data.expiresAt
    });
};

// Get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
    return await this.countDocuments({ user: userId, isRead: false });
};

// Indexes
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);
