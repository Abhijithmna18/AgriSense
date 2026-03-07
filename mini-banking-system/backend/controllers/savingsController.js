const SavingsGoal = require('../models/SavingsGoal');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Ledger = require('../models/Ledger');
const Notification = require('../models/Notification');

// @desc    Get all savings goals
// @route   GET /api/savings-goals
// @access  Private
exports.getSavingsGoals = async (req, res) => {
    try {
        const { status } = req.query;
        const query = { user: req.user._id };
        if (status) query.status = status;

        const goals = await SavingsGoal.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: goals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create savings goal
// @route   POST /api/savings-goals
// @access  Private
exports.createSavingsGoal = async (req, res) => {
    try {
        const { name, description, targetAmount, targetDate, category, icon, color, autoContribute } = req.body;

        const goal = await SavingsGoal.create({
            user: req.user._id,
            name,
            description,
            targetAmount,
            targetDate,
            category,
            icon,
            color,
            autoContribute
        });

        await Notification.createNotification({
            userId: req.user._id,
            type: 'system',
            title: 'Savings Goal Created',
            message: `Your goal "${name}" has been created successfully`,
            priority: 'low'
        });

        res.status(201).json({
            success: true,
            message: 'Savings goal created',
            data: goal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add contribution to savings goal
// @route   POST /api/savings-goals/:id/contribute
// @access  Private
exports.addContribution = async (req, res) => {
    try {
        const { amount } = req.body;
        const goal = await SavingsGoal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Savings goal not found'
            });
        }

        if (goal.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Check wallet balance
        const wallet = await Wallet.findOne({ user: req.user._id });
        if (!wallet.hasSufficientBalance(amount)) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        // Create transaction
        const transaction = await Transaction.create({
            transactionId: Transaction.generateTransactionId(),
            type: 'transfer',
            category: 'savings_contribution',
            from: {
                user: req.user._id,
                accountNumber: req.user.accountNumber,
                name: req.user.name
            },
            amount,
            status: 'completed',
            description: `Contribution to ${goal.name}`,
            metadata: { savingsGoalId: goal._id },
            completedAt: new Date()
        });

        // Update wallet
        await wallet.updateBalance(amount, 'debit');

        // Add contribution to goal
        await goal.addContribution(amount, transaction._id, 'manual');

        // Create ledger entry
        await Ledger.createDoubleEntry({
            fromUser: req.user._id,
            amount,
            transaction: transaction._id,
            category: 'savings_goal',
            description: `Savings contribution - ${goal.name}`,
            reference: transaction.transactionId
        });

        // Check if goal completed
        if (goal.status === 'completed') {
            await Notification.createNotification({
                userId: req.user._id,
                type: 'savings_goal_achieved',
                title: '🎉 Goal Achieved!',
                message: `Congratulations! You've reached your "${goal.name}" goal`,
                priority: 'high',
                metadata: { goalId: goal._id, icon: '🎯' }
            });
        }

        res.json({
            success: true,
            message: 'Contribution added successfully',
            data: goal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update savings goal
// @route   PUT /api/savings-goals/:id
// @access  Private
exports.updateSavingsGoal = async (req, res) => {
    try {
        let goal = await SavingsGoal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Savings goal not found'
            });
        }

        if (goal.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        goal = await SavingsGoal.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Savings goal updated',
            data: goal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete savings goal
// @route   DELETE /api/savings-goals/:id
// @access  Private
exports.deleteSavingsGoal = async (req, res) => {
    try {
        const goal = await SavingsGoal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Savings goal not found'
            });
        }

        if (goal.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // If goal has money, return it to wallet
        if (goal.currentAmount > 0) {
            const wallet = await Wallet.findOne({ user: req.user._id });
            await wallet.updateBalance(goal.currentAmount, 'credit');
        }

        await goal.deleteOne();

        res.json({
            success: true,
            message: 'Savings goal deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
