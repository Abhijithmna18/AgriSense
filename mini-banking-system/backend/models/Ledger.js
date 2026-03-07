const mongoose = require('mongoose');

/**
 * Double Entry Ledger System
 * Every transaction creates two entries: Debit and Credit
 * Debit = Money going out / Expense / Asset increase
 * Credit = Money coming in / Income / Liability increase
 */

const ledgerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true
    },
    entryType: {
        type: String,
        enum: ['debit', 'credit'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    balanceBefore: {
        type: Number,
        required: true
    },
    balanceAfter: {
        type: Number,
        required: true
    },
    accountType: {
        type: String,
        enum: ['wallet', 'savings', 'fd', 'loan'],
        default: 'wallet'
    },
    category: {
        type: String,
        enum: [
            'transfer',
            'deposit',
            'withdrawal',
            'bill_payment',
            'upi_payment',
            'card_payment',
            'interest_credit',
            'fd_creation',
            'fd_maturity',
            'savings_goal',
            'refund',
            'reversal'
        ],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    reference: {
        type: String,
        unique: true,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    isReconciled: {
        type: Boolean,
        default: false
    },
    reconciledAt: Date
}, {
    timestamps: true
});

// Compound index for efficient queries
ledgerSchema.index({ user: 1, createdAt: -1 });
ledgerSchema.index({ transaction: 1, entryType: 1 });
ledgerSchema.index({ reference: 1 });

// Static method to create double entry
ledgerSchema.statics.createDoubleEntry = async function(data) {
    const {
        fromUser,
        toUser,
        amount,
        transaction,
        category,
        description,
        reference,
        metadata
    } = data;

    const entries = [];

    // Debit entry (from user)
    if (fromUser) {
        const fromWallet = await mongoose.model('Wallet').findOne({ user: fromUser });
        entries.push({
            user: fromUser,
            transaction,
            entryType: 'debit',
            amount,
            balanceBefore: fromWallet.balance + amount,
            balanceAfter: fromWallet.balance,
            category,
            description: `Debit: ${description}`,
            reference: `${reference}-DR`,
            metadata
        });
    }

    // Credit entry (to user)
    if (toUser) {
        const toWallet = await mongoose.model('Wallet').findOne({ user: toUser });
        entries.push({
            user: toUser,
            transaction,
            entryType: 'credit',
            amount,
            balanceBefore: toWallet.balance - amount,
            balanceAfter: toWallet.balance,
            category,
            description: `Credit: ${description}`,
            reference: `${reference}-CR`,
            metadata
        });
    }

    return await this.insertMany(entries);
};

// Get account balance from ledger
ledgerSchema.statics.getBalance = async function(userId) {
    const result = await this.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalCredits: {
                    $sum: {
                        $cond: [{ $eq: ['$entryType', 'credit'] }, '$amount', 0]
                    }
                },
                totalDebits: {
                    $sum: {
                        $cond: [{ $eq: ['$entryType', 'debit'] }, '$amount', 0]
                    }
                }
            }
        }
    ]);

    if (result.length === 0) return 0;
    return result[0].totalCredits - result[0].totalDebits;
};

module.exports = mongoose.model('Ledger', ledgerSchema);
