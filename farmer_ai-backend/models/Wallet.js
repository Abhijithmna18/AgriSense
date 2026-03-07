const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    lockReason: String,
    lastTransaction: {
        type: Date
    },
    totalDeposits: {
        type: Number,
        default: 0
    },
    totalWithdrawals: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Method to update balance
walletSchema.methods.updateBalance = async function(amount, type) {
    if (type === 'credit') {
        this.balance += amount;
        this.totalDeposits += amount;
    } else if (type === 'debit') {
        if (this.balance < amount) {
            throw new Error('Insufficient balance');
        }
        this.balance -= amount;
        this.totalWithdrawals += amount;
    }
    this.lastTransaction = new Date();
    await this.save();
    return this.balance;
};

// Check if wallet has sufficient balance
walletSchema.methods.hasSufficientBalance = function(amount) {
    return this.balance >= amount;
};

module.exports = mongoose.model('Wallet', walletSchema);
