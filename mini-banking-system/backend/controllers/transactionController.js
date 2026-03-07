const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const Ledger = require('../models/Ledger');
const Notification = require('../models/Notification');

// @desc    Send money to another user
// @route   POST /api/transactions/send
// @access  Private
exports.sendMoney = async (req, res) => {
    try {
        const { recipientVPA, recipientAccountNumber, amount, description } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        // Find sender wallet
        const senderWallet = await Wallet.findOne({ user: req.user._id });
        if (!senderWallet.hasSufficientBalance(amount)) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        // Check transaction limit
        if (amount > req.user.singleTransactionLimit) {
            return res.status(400).json({
                success: false,
                message: `Transaction exceeds limit of ₹${req.user.singleTransactionLimit}`
            });
        }

        // Find recipient
        const recipient = await User.findOne({
            $or: [
                { vpa: recipientVPA },
                { accountNumber: recipientAccountNumber }
            ]
        });

        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: 'Recipient not found'
            });
        }

        const recipientWallet = await Wallet.findOne({ user: recipient._id });

        // Create transaction
        const transaction = await Transaction.create({
            transactionId: Transaction.generateTransactionId(),
            type: 'transfer',
            category: 'p2p_transfer',
            from: {
                user: req.user._id,
                accountNumber: req.user.accountNumber,
                name: req.user.name
            },
            to: {
                user: recipient._id,
                accountNumber: recipient.accountNumber,
                name: recipient.name,
                vpa: recipient.vpa
            },
            amount,
            status: 'processing',
            description: description || `Transfer to ${recipient.name}`,
            processedAt: new Date()
        });

        // Update wallets
        await senderWallet.updateBalance(amount, 'debit');
        await recipientWallet.updateBalance(amount, 'credit');

        // Update transaction status
        transaction.status = 'completed';
        transaction.completedAt = new Date();
        await transaction.save();

        // Create ledger entries
        await Ledger.createDoubleEntry({
            fromUser: req.user._id,
            toUser: recipient._id,
            amount,
            transaction: transaction._id,
            category: 'transfer',
            description: `P2P transfer`,
            reference: transaction.transactionId
        });

        // Send notifications
        await Notification.createNotification({
            userId: req.user._id,
            type: 'transaction',
            title: 'Money Sent',
            message: `₹${amount} sent to ${recipient.name}`,
            priority: 'medium',
            metadata: { transactionId: transaction._id, amount, icon: '💸' }
        });

        await Notification.createNotification({
            userId: recipient._id,
            type: 'transaction',
            title: 'Money Received',
            message: `₹${amount} received from ${req.user.name}`,
            priority: 'medium',
            metadata: { transactionId: transaction._id, amount, icon: '💰' }
        });

        res.json({
            success: true,
            message: 'Money sent successfully',
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Request payment
// @route   POST /api/transactions/request
// @access  Private
exports.requestPayment = async (req, res) => {
    try {
        const { fromVPA, amount, description } = req.body;

        const fromUser = await User.findOne({ vpa: fromVPA });
        if (!fromUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create notification for payment request
        await Notification.createNotification({
            userId: fromUser._id,
            type: 'transaction',
            title: 'Payment Request',
            message: `${req.user.name} requested ₹${amount}`,
            priority: 'high',
            actionUrl: `/payments/request/${req.user._id}`,
            actionLabel: 'Pay Now',
            metadata: { amount, requestedBy: req.user._id }
        });

        res.json({
            success: true,
            message: 'Payment request sent'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get transaction history
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 20, type, status, startDate, endDate } = req.query;

        const query = {
            $or: [
                { 'from.user': req.user._id },
                { 'to.user': req.user._id }
            ]
        };

        if (type) query.type = type;
        if (status) query.status = status;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('from.user to.user', 'name accountNumber vpa');

        const count = await Transaction.countDocuments(query);

        res.json({
            success: true,
            data: {
                transactions,
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

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('from.user to.user', 'name email phone accountNumber vpa');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        // Check if user is part of transaction
        const isAuthorized = 
            transaction.from.user?._id.toString() === req.user._id.toString() ||
            transaction.to.user?._id.toString() === req.user._id.toString();

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this transaction'
            });
        }

        res.json({
            success: true,
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
