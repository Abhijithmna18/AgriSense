const QRCode = require('qrcode');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Ledger = require('../models/Ledger');
const Notification = require('../models/Notification');

// @desc    Generate QR code for payment
// @route   POST /api/payments/generate-qr
// @access  Private
exports.generateQR = async (req, res) => {
    try {
        const { amount, description } = req.body;

        const paymentData = {
            vpa: req.user.vpa,
            name: req.user.name,
            amount: amount || 0,
            description: description || 'Payment',
            timestamp: Date.now()
        };

        // Generate QR code
        const qrCode = await QRCode.toDataURL(JSON.stringify(paymentData));

        res.json({
            success: true,
            data: {
                qrCode,
                vpa: req.user.vpa,
                validFor: '15 minutes'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Process UPI payment
// @route   POST /api/payments/upi
// @access  Private
exports.upiPayment = async (req, res) => {
    try {
        const { vpa, amount, pin, description } = req.body;

        // Verify PIN (in production, compare with hashed PIN)
        if (!pin || pin.length !== 4) {
            return res.status(400).json({
                success: false,
                message: 'Invalid PIN'
            });
        }

        // Find recipient by VPA
        const recipient = await User.findOne({ vpa });
        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: 'Invalid VPA'
            });
        }

        // Check sender balance
        const senderWallet = await Wallet.findOne({ user: req.user._id });
        if (!senderWallet.hasSufficientBalance(amount)) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        const recipientWallet = await Wallet.findOne({ user: recipient._id });

        // Create transaction
        const transaction = await Transaction.create({
            transactionId: Transaction.generateTransactionId(),
            type: 'payment',
            category: 'upi_payment',
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
            status: 'completed',
            paymentMethod: 'upi',
            description: description || `UPI payment to ${recipient.name}`,
            completedAt: new Date()
        });

        // Update wallets
        await senderWallet.updateBalance(amount, 'debit');
        await recipientWallet.updateBalance(amount, 'credit');

        // Create ledger entries
        await Ledger.createDoubleEntry({
            fromUser: req.user._id,
            toUser: recipient._id,
            amount,
            transaction: transaction._id,
            category: 'upi_payment',
            description: 'UPI payment',
            reference: transaction.transactionId
        });

        // Notifications
        await Notification.createNotification({
            userId: req.user._id,
            type: 'transaction',
            title: 'UPI Payment Successful',
            message: `₹${amount} paid to ${recipient.name}`,
            priority: 'medium',
            metadata: { transactionId: transaction._id, amount }
        });

        await Notification.createNotification({
            userId: recipient._id,
            type: 'transaction',
            title: 'Payment Received',
            message: `₹${amount} received via UPI from ${req.user.name}`,
            priority: 'medium',
            metadata: { transactionId: transaction._id, amount }
        });

        res.json({
            success: true,
            message: 'Payment successful',
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Scan and process QR payment
// @route   POST /api/payments/scan-qr
// @access  Private
exports.scanQR = async (req, res) => {
    try {
        const { qrData, pin } = req.body;

        // Parse QR data
        const paymentData = JSON.parse(qrData);
        const { vpa, amount, description } = paymentData;

        // Process payment using UPI method
        req.body = { vpa, amount, pin, description };
        return exports.upiPayment(req, res);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Invalid QR code'
        });
    }
};
