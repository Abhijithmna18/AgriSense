const mongoose = require('mongoose');

const AdminAuditSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        // enum validation removed to prevent crashes on new actions
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Admin ID
        required: true
    },
    targetType: {
        type: String, // 'User', 'Order', 'Farm', 'Listing'
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId, // The ID of the item being modified
        required: true
    },
    reason: {
        type: String,
        required: false
    },
    changes: {
        before: mongoose.Schema.Types.Mixed,
        after: mongoose.Schema.Types.Mixed
    },
    metadata: {
        ipAddress: String,
        userAgent: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
        expires: 31536000 // Auto-delete after 1 year (compliance)
    }
});

// Index for quick filtering by target or admin
AdminAuditSchema.index({ targetId: 1, targetType: 1 });
AdminAuditSchema.index({ performedBy: 1 });

module.exports = mongoose.model('AdminAudit', AdminAuditSchema);
