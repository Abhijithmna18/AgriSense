const mongoose = require('mongoose');

const operationRecordSchema = new mongoose.Schema({
    farmId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['Irrigation', 'Fertilization', 'Sowing', 'Spraying', 'Harvesting', 'Maintenance', 'Other'],
        required: true
    },
    assignedPlot: {
        type: String, // e.g., 'Plot A', 'Greenhouse 1'
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Pending',
        index: true
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    scheduledDate: {
        type: Date,
        required: true,
        index: true
    },
    estimatedDuration: {
        type: Number, // in hours
        required: true
    },
    resourcesRequired: {
        waterLiters: { type: Number, default: 0 },
        fertilizerKg: { type: Number, default: 0 },
        laborHours: { type: Number, default: 0 },
        equipment: { type: String, default: 'None' }
    },
    costEstimate: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        maxlength: 500
    },
    recurring: {
        isRecurring: { type: Boolean, default: false },
        frequencyDays: { type: Number },
        endDate: { type: Date }
    }
}, { timestamps: true });

module.exports = mongoose.model('OperationRecord', operationRecordSchema);
