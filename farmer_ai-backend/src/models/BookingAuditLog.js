const mongoose = require('mongoose');

const BookingAuditLogSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['farmer', 'admin'],
        required: true
    },
    previousStatus: String,
    newStatus: String,
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for audit queries
BookingAuditLogSchema.index({ bookingId: 1, timestamp: -1 });
BookingAuditLogSchema.index({ performedBy: 1 });

module.exports = mongoose.model('BookingAuditLog', BookingAuditLogSchema);
