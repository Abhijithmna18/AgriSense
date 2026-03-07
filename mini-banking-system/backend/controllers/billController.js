const Bill = require('../models/Bill');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Ledger = require('../models/Ledger');
const Notification = require('../models/Notification');

// @desc    Get all bills
// @route   GET /api/bills
// @access  Private
exports.getBills = async (req, res) => {
    try {
        const { status, billType, page = 1, limit = 20 } = req.query;

        const query = { user: req.user._id };
        if (status) query.status = status;
        if (billType) query.billType = billType;

        const bills = await Bill.find(query)
            .sort({ dueDate: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Bill.countDocuments(query);

        res.json({
            success: true,
            data: {
                bills,
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

// @desc    Create new bill
// @route   POST /api/bills
// @access  Private
exports.createBill = async (req, res) => {
    try {
        const { billType, provider, accountNumber, amount, dueDate, isRecurring, recurringDay } = req.body;

        const bill = await Bill.create({
            user: req.user._id,
            billType,
            provider,
            accountNumber,
            amount,
            dueDate,
            billMonth: new Date().toISOString().slice(0, 7),
            isRecurring,
            recurringDay
        });

        res.status(201).json({
            success: true,
            message: 'Bill created successfully',
            data: bill
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Pay bill
// @route   POST /api/bills/:id/pay
// @access  Private
exports.payBill = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: 'Bill not found'
            });
        }

        if (bill.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (bill.isPaid) {
            return res.status(400).json({
                success: false,
                message: 'Bill already paid'
            });
        }

        // Check wallet balance
        const wallet = await Wallet.findOne({ user: req.user._id });
        const totalAmount = bill.amount + bill.lateFee;

        if (!wallet.hasSufficientBalance(totalAmount)) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        // Create transaction
        const transaction = await Transaction.create({
            transactionId: Transaction.generateTransactionId(),
            type: 'payment',
            category: 'bill_payment',
            from: {
                user: req.user._id,
                accountNumber: req.user.accountNumber,
                name: req.user.name
            },
            amount: totalAmount,
            status: 'completed',
            description: `${bill.billType} bill payment to ${bill.provider}`,
            metadata: { billId: bill._id },
            completedAt: new Date()
        });

        // Update wallet
        await wallet.updateBalance(totalAmount, 'debit');

        // Update bill
        bill.isPaid = true;
        bill.status = 'paid';
        bill.paidAt = new Date();
        bill.paidAmount = totalAmount;
        bill.transaction = transaction._id;
        await bill.save();

        // Create ledger entry
        await Ledger.createDoubleEntry({
            fromUser: req.user._id,
            amount: totalAmount,
            transaction: transaction._id,
            category: 'bill_payment',
            description: `Bill payment - ${bill.billType}`,
            reference: transaction.transactionId,
            metadata: { billId: bill._id }
        });

        // Send notification
        await Notification.createNotification({
            userId: req.user._id,
            type: 'bill_paid',
            title: 'Bill Paid Successfully',
            message: `${bill.billType} bill of ₹${totalAmount} paid to ${bill.provider}`,
            priority: 'medium',
            metadata: { billId: bill._id, amount: totalAmount }
        });

        res.json({
            success: true,
            message: 'Bill paid successfully',
            data: { bill, transaction }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get upcoming bills
// @route   GET /api/bills/upcoming
// @access  Private
exports.getUpcomingBills = async (req, res) => {
    try {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const bills = await Bill.find({
            user: req.user._id,
            isPaid: false,
            dueDate: { $lte: sevenDaysFromNow }
        }).sort({ dueDate: 1 });

        res.json({
            success: true,
            data: bills
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete bill
// @route   DELETE /api/bills/:id
// @access  Private
exports.deleteBill = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: 'Bill not found'
            });
        }

        if (bill.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        await bill.deleteOne();

        res.json({
            success: true,
            message: 'Bill deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
