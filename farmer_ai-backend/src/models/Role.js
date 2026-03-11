const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a role name'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a role description'],
        trim: true
    },
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
    }],
    isSystem: {
        type: Boolean,
        default: false // System roles cannot be deleted
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update updatedAt on save
RoleSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

// Index for faster queries
RoleSchema.index({ name: 1 });

module.exports = mongoose.model('Role', RoleSchema);
