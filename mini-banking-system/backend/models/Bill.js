const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    billType: {
        type: String,
        enum: ['electricity', 'water', 'mobile', 'internet', 'gas', 'insurance', 'loan_emi'],
        required: true
    },
    provider: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    dueDate: {
        type: Date,
        required: true
    },
    billMonth: {
        type: String // Format: YYYY-MM
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue', 'cancelled'],
        default: 'pending'
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: Date,
    paidAmount: Number,
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringDay: Number, // Day of month for recurring bills
    reminderSent: {
        type: Boolean,
        default: false
    },
    reminderDate: Date,
    lateFee: {
        type: Number,
        default: 0
    },
    metadata: {
        consumerNumber: String,
        meterNumber: String,
        phoneNumber: String,
        connectionId: String,
        notes: String
    }
}, {
    timestamps: true
});

// Indexes
billSchema.index({ user: 1, dueDate: 1 });
billSchema.index({ status: 1, dueDate: 1 });
billSchema.index({ user: 1, billType: 1, status: 1 });

// Check if bill is overdue
billSchema.methods.isOverdue = function() {
    return !this.isPaid && new Date() > this.dueDate;
};

// Update status based on due date
billSchema.pre('save', function(next) {
    if (!this.isPaid && new Date() > this.dueDate) {
        this.status = 'overdue';
    }
    next();
});

module.exports = mongoose.model('Bill', billSchema);
