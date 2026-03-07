const FixedDeposit = require('../models/FixedDeposit');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Ledger = require('../models/Ledger');
const Notification = require('../models/Notification');

// @desc    Get all fixed deposits
// @route   GET /api/fixed-deposits
// @access  Private
exports.getFixedDeposits = async (req, res) => {
    try {
        const { status } = req.query;
        const query = { user: req.user._id };
        if (status) query.status = status;

        const fds = await FixedDeposit.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: fds
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create fixed deposit
// @route   POST /api/fixed-deposits
// @access  Private
exports.createFixedDeposit = async (req, res) => {
    try {
        const { principalAmount, tenure, nomineeDetails } = req.body;

        // Check wallet balance
        const wallet = await Wallet.findOne({ user: req.user._id });
        if (!wallet.hasSufficientBalance(principalAmount)) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        // Calculate maturity
        const interestRate = parseFloat(process.env.FD_INTEREST_RATE) || 7.5;
        const tenureMonths = tenure.unit === 'years' ? tenure.value * 12 : tenure.value;
        const maturityAmount = FixedDeposit.calculateMaturityAmount(principalAmount, interestRate, tenureMonths);
        
        const startDate = new Date();
        const maturityDate = new Date(startDate);
        maturityDate.setMonth(maturityDate.getMonth() + tenureMonths);

        // Create transaction
        const transaction = await Transaction.create({
            transactionId: Transaction.generateTransactionId(),
            type: 'transfer',
            category: 'fd_creation',
            from: {
                user: req.user._id,
                accountNumber: req.user.accountNumber,
                name: req.user.name
            },
            amount: principalAmount,
            status: 'completed',
            description: `Fixed Deposit creation`,
            completedAt: new Date()
        });

        // Create FD
        const fd = await FixedDeposit.create({
            user: req.user._id,
            fdNumber: FixedDeposit.generateFDNumber(),
            principalAmount,
            interestRate,
            tenure,
            startDate,
            maturityDate,
            maturityAmount,
            nomineeDetails,
            creationTransaction: transaction._id
        });

        // Update wallet
        await wallet.updateBalance(principalAmount, 'debit');

        // Create ledger entry
        await Ledger.createDoubleEntry({
            fromUser: req.user._id,
            amount: principalAmount,
            transaction: transaction._id,
            category: 'fd_creation',
            description: `FD creation - ${fd.fdNumber}`,
            reference: transaction.transactionId,
            metadata: { fdId: fd._id }
        });

        // Notification
        await Notification.createNotification({
            userId: req.user._id,
            type: 'system',
            title: 'Fixed Deposit Created',
            message: `FD of ₹${principalAmount} created. Maturity: ${maturityDate.toLocaleDateString()}`,
            priority: 'medium',
            metadata: { fdId: fd._id }
        });

        res.status(201).json({
            success: true,
            message: 'Fixed deposit created successfully',
            data: fd
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Withdraw fixed deposit
// @route   POST /api/fixed-deposits/:id/withdraw
// @access  Private
exports.withdrawFixedDeposit = async (req, res) => {
    try {
        const fd = await FixedDeposit.findById(req.params.id);

        if (!fd) {
            return res.status(404).json({
                success: false,
                message: 'Fixed deposit not found'
            });
        }

        if (fd.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (fd.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'FD is not active'
            });
        }

        // Calculate amount to return
        let amountToReturn = fd.principalAmount;
        let penalty = 0;

        if (fd.isMature()) {
            amountToReturn = fd.maturityAmount;
            fd.status = 'matured';
        } else {
            penalty = fd.calculatePenalty();
            amountToReturn = fd.principalAmount - penalty;
            fd.status = 'broken';
        }

        // Create transaction
        const transaction = await Transaction.create({
            transactionId: Transaction.generateTransactionId(),
            type: 'deposit',
            category: 'fd_maturity',
            to: {
                user: req.user._id,
                accountNumber: req.user.accountNumber,
                name: req.user.name
            },
            amount: amountToReturn,
            status: 'completed',
            description: `FD withdrawal - ${fd.fdNumber}`,
            metadata: { fdId: fd._id },
            completedAt: new Date()
        });

        // Update wallet
        const wallet = await Wallet.findOne({ user: req.user._id });
        await wallet.updateBalance(amountToReturn, 'credit');

        // Update FD
        fd.withdrawnAt = new Date();
        fd.penaltyAmount = penalty;
        fd.maturityTransaction = transaction._id;
        await fd.save();

        // Create ledger entry
        await Ledger.createDoubleEntry({
            toUser: req.user._id,
            amount: amountToReturn,
            transaction: transaction._id,
            category: 'fd_maturity',
            description: `FD withdrawal - ${fd.fdNumber}`,
            reference: transaction.transactionId
        });

        // Notification
        await Notification.createNotification({
            userId: req.user._id,
            type: 'fd_maturity',
            title: 'FD Withdrawn',
            message: `₹${amountToReturn} credited to your wallet${penalty > 0 ? ` (Penalty: ₹${penalty})` : ''}`,
            priority: 'high',
            metadata: { fdId: fd._id, amount: amountToReturn }
        });

        res.json({
            success: true,
            message: 'Fixed deposit withdrawn successfully',
            data: { fd, transaction, penalty }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Calculate FD maturity
// @route   GET /api/fixed-deposits/calculate
// @access  Private
exports.calculateMaturity = async (req, res) => {
    try {
        const { principal, tenure, unit } = req.query;
        const interestRate = parseFloat(process.env.FD_INTEREST_RATE) || 7.5;
        const tenureMonths = unit === 'years' ? tenure * 12 : tenure;
        
        const maturityAmount = FixedDeposit.calculateMaturityAmount(
            parseFloat(principal),
            interestRate,
            parseInt(tenureMonths)
        );

        const interest = maturityAmount - parseFloat(principal);

        res.json({
            success: true,
            data: {
                principal: parseFloat(principal),
                interestRate,
                tenure: { value: parseInt(tenure), unit },
                maturityAmount,
                interestEarned: interest
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
