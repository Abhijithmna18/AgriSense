const mongoose = require('mongoose');

const savedSupplierSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Buyer is required']
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Supplier is required']
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters'],
        trim: true,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    savedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound unique index to prevent duplicate saves
savedSupplierSchema.index({ buyer: 1, supplier: 1 }, { unique: true });

// Query optimization index
savedSupplierSchema.index({ buyer: 1, isActive: 1, savedAt: -1 });

// Prevent saving yourself
savedSupplierSchema.pre('save', function (next) {
    if (this.buyer.toString() === this.supplier.toString()) {
        next(new Error('Cannot save yourself as a supplier'));
    }
    next();
});

module.exports = mongoose.model('SavedSupplier', savedSupplierSchema);
