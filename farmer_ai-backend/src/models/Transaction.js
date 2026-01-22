const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true,
        default: () => `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: [
            'loan_disbursement',
            'loan_repayment',
            'marketplace_sale',
            'marketplace_purchase',
            'farm_expense',
            'government_subsidy',
            'Logistics', // simplified from Logistics & Transport
            'Packaging',
            'Marketing',
            'Platform Fees', // Added from bug report
            'Payment Gateway Charges',
            'Salaries / Agents',
            'Storage / Warehousing',
            // Farmer Categories
            'Seeds & Saplings',
            'Fertilizers',
            'Pesticides',
            'Labor',
            'Machinery & Fuel',
            'Irrigation',
            'Land Lease',
            'Miscellaneous',
            'other'
        ],
        required: true
    },
    description: {
        type: String
    },
    source: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'sourceModel' // Dynamic reference to Loan, Order, etc.
    },
    sourceModel: {
        type: String,
        enum: ['Loan', 'Order', 'External']
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
