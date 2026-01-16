const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    purpose: {
        type: String,
        required: true,
        enum: ['Seeds & Fertilizers', 'Equipment', 'Labor', 'Irrigation Infrastructure', 'Other']
    },
    tenureMonths: {
        type: Number,
        required: true
    },
    interestRate: {
        type: Number,
        required: true
    },
    emiAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['applied', 'review_pending', 'approved', 'approved_modified', 'rejected', 'active', 'closed', 'defaulted'],
        default: 'applied'
    },
    riskAssessment: {
        overallRiskScore: Number,
        riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
        confidenceScore: Number
    },
    aiAnalysis: {
        type: mongoose.Schema.Types.Mixed // Stores the full structured JSON from the risk engine
    },
    adminDecision: {
        status: { type: String, enum: ['approved', 'rejected', 'correction_needed'] },
        note: String,
        modifiedAmount: Number,
        modifiedTenure: Number,
        decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        decidedAt: Date
    },
    auditLog: [{
        action: String,
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        details: mongoose.Schema.Types.Mixed
    }],
    disbursedDate: {
        type: Date
    },
    closedDate: {
        type: Date
    },
    repaidAmount: {
        type: Number,
        default: 0
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Loan', loanSchema);
