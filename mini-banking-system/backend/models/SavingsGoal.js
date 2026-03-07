const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    targetAmount: {
        type: Number,
        required: true,
        min: 0
    },
    currentAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    targetDate: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        enum: ['emergency', 'vacation', 'education', 'home', 'vehicle', 'wedding', 'retirement', 'other'],
        default: 'other'
    },
    icon: {
        type: String,
        default: '🎯'
    },
    color: {
        type: String,
        default: '#10B981'
    },
    autoContribute: {
        enabled: {
            type: Boolean,
            default: false
        },
        amount: Number,
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            default: 'monthly'
        },
        nextContributionDate: Date
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'paused', 'cancelled'],
        default: 'active'
    },
    completedAt: Date,
    contributions: [{
        amount: Number,
        date: {
            type: Date,
            default: Date.now
        },
        transaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction'
        },
        type: {
            type: String,
            enum: ['manual', 'automatic'],
            default: 'manual'
        }
    }]
}, {
    timestamps: true
});

// Virtual for progress percentage
savingsGoalSchema.virtual('progressPercentage').get(function() {
    return Math.min((this.currentAmount / this.targetAmount) * 100, 100);
});

// Virtual for remaining amount
savingsGoalSchema.virtual('remainingAmount').get(function() {
    return Math.max(this.targetAmount - this.currentAmount, 0);
});

// Virtual for days remaining
savingsGoalSchema.virtual('daysRemaining').get(function() {
    const now = new Date();
    const target = new Date(this.targetDate);
    const diff = target - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Method to add contribution
savingsGoalSchema.methods.addContribution = async function(amount, transactionId, type = 'manual') {
    this.currentAmount += amount;
    this.contributions.push({
        amount,
        transaction: transactionId,
        type
    });

    // Check if goal is completed
    if (this.currentAmount >= this.targetAmount) {
        this.status = 'completed';
        this.completedAt = new Date();
    }

    await this.save();
    return this;
};

// Indexes
savingsGoalSchema.index({ user: 1, status: 1 });
savingsGoalSchema.index({ user: 1, targetDate: 1 });

// Ensure virtuals are included in JSON
savingsGoalSchema.set('toJSON', { virtuals: true });
savingsGoalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
