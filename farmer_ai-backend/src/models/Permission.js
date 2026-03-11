const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a permission name'],
        unique: true,
        trim: true
    },
    module: {
        type: String,
        required: [true, 'Please add a module name'],
        enum: [
            'User Management',
            'Vendor Management',
            'Loan Management',
            'Marketplace',
            'System',
            'Farm Management',
            'Reports',
            'Community'
        ]
    },
    description: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
PermissionSchema.index({ module: 1 });

module.exports = mongoose.model('Permission', PermissionSchema);
