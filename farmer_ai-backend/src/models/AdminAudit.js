const mongoose = require('mongoose');

const adminAuditSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    entity: {
        type: String, // e.g., 'User', 'Farm', 'Impersonation'
        required: true
    },
    entityId: {
        type: String
    },
    details: {
        type: Object // Flexible field for extra context
    },
    changes: {
        before: { type: Object },
        after: { type: Object }
    },
    ip: {
        type: String
    },
    userAgent: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AdminAudit', adminAuditSchema);
