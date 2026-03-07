const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Ledger = require('../models/Ledger');
const Notification = require('../models/Notification');

// @desc    Get wallet balance
// @route   GET /api/wallet
// @access  Private
exports.getWallet = async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ user: req.user._id });

        if (!wallet) {
            // Create wallet if doesn't exist
            wallet = await Wallet.create({ user: req.user._id });
        }

        res.json({
            success: true,
            data: wallet
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Deposit money to wallet
// @route   POST /api/wallet/deposit
// @access  Private
exports.deposit = async (req, res) => {
    try {
        const { amount, method = 'bank_transfer', reference } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        const wallet = await Wallet.findOne({ user: req.user._id });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found'
            });
        }

        // Create transaction
        const transaction = await Transaction.create({
            transactionId: Transaction.generateTransactionId(),
            type: 'deposit',
            category: 'deposit',
            to: {
                user: req.user._id,
                accountNumber: req.user.accountNumber,
                name: req.user.name
            },
            amount,
            status: 'completed',
            paymentMethod: method,
            description: `Deposit to wallet via ${method}`,
            reference,
            completedAt: new Date()
        });

        // Update wallet balance
        await wallet.updateBalance(amount, 'credit');

        // Create ledger entry
        await Ledger.createDoubleEntry({
            toUser: req.user._id,
            amount,
            transaction: transaction._id,
            category: 'deposit',
            description: `Wallet deposit`,
            reference: transaction.transactionId
        });

        // Create notification
        await Notification.createNotification({
            userId: req.user._id,
            type: 'transaction',
            title: 'Deposit Successful',
            message: `₹${amount} has been added to your wallet`,
            priority: 'medium',
            metadata: {
                transactionId: transaction._id,
                amount,
                icon: '💰',
                color: '#10B981'
            }
        });

        res.json({
            success: true,
            message: 'Deposit successful',
            data: {
                wallet,
                transaction
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Withdraw money from wallet
// @route   POST /api/wallet/withdraw
// @access  Private
exports.withdraw = async (req, res) => {
    try {
        const { amount, method = 'bank_transfer', accountNumber } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        const wallet = await Wallet.findOne({ user: req.user._id });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found'
            });
        }

        // Check sufficient balance
        if (!wallet.hasSufficientBalance(amount)) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        // Check if wallet is locked
        if (wallet.isLocked) {
            return res.status(403).json({
                success: false,
                message: `Wallet is locked: ${wallet.lockReason}`
            });
        }

        // Create transaction
        const transaction = await Transaction.create({
            transactionId: Transaction.generateTransactionId(),
            type: 'withdrawal',
            category: 'withdrawal',
            from: {
                user: req.user._id,
                accountNumber: req.user.accountNumber,
                name: req.user.name
            },
            amount,
            status: 'completed',
            paymentMethod: method,
            description: `Withdrawal from wallet to ${accountNumber || 'bank account'}`,
            completedAt: new Date()
        });

        // Update wallet balance
        await wallet.updateBalance(amount, 'debit');

        // Create ledger entry
        await Ledger.createDoubleEntry({
            fromUser: req.user._id,
            amount,
            transaction: transaction._id,
            category: 'withdrawal',
            description: `Wallet withdrawal`,
            reference: transaction.transactionId
        });

        // Create notification
        await Notification.createNotification({
            userId: req.user._id,
            type: 'transaction',
            title: 'Withdrawal Successful',
            message: `₹${amount} has been withdrawn from your wallet`,
            priority: 'medium',
            metadata: {
                transactionId: transaction._id,
                amount,
                icon: '💸',
                color: '#EF4444'
            }
        });

        res.json({
            success: true,
            message: 'Withdrawal successful',
            data: {
                wallet,
                transaction
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get wallet statement
// @route   GET /api/wallet/statement
// @access  Private
exports.getStatement = async (req, res) => {
    try {
        const { startDate, endDate, page = 1, limit = 20 } = req.query;

        const query = {
            user: req.user._id
        };

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const ledgerEntries = await Ledger.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('transaction');

        const count = await Ledger.countDocuments(query);

        res.json({
            success: true,
            data: {
                entries: ledgerEntries,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Toggle balance visibility
// @route   PUT /api/wallet/toggle-visibility
// @access  Private
exports.toggleVisibility = async (req, res) => {
    try {
        // This would be stored in user preferences
        // For now, just return success
        res.json({
            success: true,
            message: 'Balance visibility toggled'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
