const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    url: {
        type: String
    }
}, { _id: false });

const messageSchema = new mongoose.Schema({
    negotiationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Negotiation',
        required: true,
        index: true
    },
    offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true,
        maxlength: 1000
    },
    attachments: [attachmentSchema],
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    // Message status
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    readBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Message type for categorization
    type: {
        type: String,
        enum: ['clarification', 'specification', 'concern', 'general'],
        default: 'general'
    },
    // Priority for important messages
    priority: {
        type: String,
        enum: ['low', 'normal', 'high'],
        default: 'normal'
    },
    // Metadata
    metadata: {
        hasAttachments: {
            type: Boolean,
            default: false
        },
        attachmentCount: {
            type: Number,
            default: 0
        },
        wordCount: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ negotiationId: 1, timestamp: 1 });
messageSchema.index({ offerId: 1, timestamp: 1 });
messageSchema.index({ senderId: 1, timestamp: -1 });
messageSchema.index({ isRead: 1, timestamp: -1 });

// Pre-save middleware to calculate metadata
messageSchema.pre('save', function(next) {
    if (this.isNew) {
        // Calculate word count
        this.metadata.wordCount = this.message.trim().split(/\s+/).length;
        
        // Set attachment metadata
        this.metadata.hasAttachments = this.attachments && this.attachments.length > 0;
        this.metadata.attachmentCount = this.attachments ? this.attachments.length : 0;
        
        // Generate URLs for attachments
        if (this.attachments && this.attachments.length > 0) {
            this.attachments.forEach(attachment => {
                if (!attachment.url) {
                    // Generate URL based on the file path
                    attachment.url = `/uploads/negotiations/${attachment.filename}`;
                }
            });
        }
    }
    next();
});

// Virtual for formatted timestamp
messageSchema.virtual('formattedTimestamp').get(function() {
    return this.timestamp.toLocaleString();
});

// Method to mark message as read
messageSchema.methods.markAsRead = function(userId) {
    this.isRead = true;
    this.readAt = new Date();
    this.readBy = userId;
    return this.save();
};

// Static method to get unread count for a negotiation
messageSchema.statics.getUnreadCount = function(negotiationId, userId) {
    return this.countDocuments({
        negotiationId,
        senderId: { $ne: userId },
        isRead: false
    });
};

// Static method to mark all messages as read for a negotiation
messageSchema.statics.markAllAsRead = function(negotiationId, userId) {
    return this.updateMany(
        {
            negotiationId,
            senderId: { $ne: userId },
            isRead: false
        },
        {
            isRead: true,
            readAt: new Date(),
            readBy: userId
        }
    );
};

module.exports = mongoose.model('Message', messageSchema);