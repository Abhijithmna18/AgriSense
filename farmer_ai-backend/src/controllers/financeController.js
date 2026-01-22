const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// @desc    Get financial health snapshot
// @route   GET /api/finance/snapshot
// @access  Private (Farmer)
exports.getFinancialSnapshot = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch aggregate data
        // For V1, we will live-calculate from Transactions and Loans
        const transactions = await Transaction.find({ user: userId, status: 'completed' });
        const loans = await Loan.find({ farmer: userId, status: 'active' });

        let totalRevenue = 0;
        let totalExpenses = 0;

        // Calculate totals from transactions
        transactions.forEach(tx => {
            if (tx.type === 'credit') {
                totalRevenue += tx.amount;
            } else if (tx.type === 'debit') {
                totalExpenses += tx.amount;
            }
        });

        const netIncome = totalRevenue - totalExpenses;

        const outstandingLoanBalance = loans.reduce((acc, loan) => acc + (loan.amount - loan.repaidAmount), 0);

        // Mocking monthly cashflow for visualization if not enough data
        const monthlyCashflow = [
            { month: 'Jan', income: totalRevenue * 0.1, expense: totalExpenses * 0.12 },
            { month: 'Feb', income: totalRevenue * 0.15, expense: totalExpenses * 0.1 },
            { month: 'Mar', income: totalRevenue * 0.2, expense: totalExpenses * 0.15 },
            { month: 'Apr', income: totalRevenue * 0.25, expense: totalExpenses * 0.2 },
            { month: 'May', income: totalRevenue * 0.3, expense: totalExpenses * 0.25 }, // Harvest season peak
            { month: 'Jun', income: totalRevenue * 0.1, expense: totalExpenses * 0.18 },
        ];

        // Expense breakdown
        const expenseBreakdown = [
            { name: 'Inputs', value: totalExpenses * 0.4 },
            { name: 'Labor', value: totalExpenses * 0.3 },
            { name: 'Logistics', value: totalExpenses * 0.2 },
            { name: 'EMI', value: totalExpenses * 0.1 },
        ];

        res.json({
            netIncome,
            totalRevenue,
            totalExpenses,
            outstandingLoanBalance,
            financialRisk: outstandingLoanBalance > (totalRevenue * 0.5) ? 'High' : 'Low',
            monthlyCashflow,
            expenseBreakdown
        });

    } catch (error) {
        console.error('Error fetching financial snapshot:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Check loan eligibility
// @route   POST /api/finance/eligibility
// @access  Private
exports.checkEligibility = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // In a real production system, this would call a Credit Bureau API (CIBIL/Equifax)
        // For this architecture, we will use internal platform data for scoring
        const user = await User.findById(userId);
        const activeLoans = await Loan.countDocuments({ farmer: userId, status: 'active' });
        const completedLoans = await Loan.countDocuments({ farmer: userId, status: 'closed' });

        // Deterministic Scoring Engine
        let score = 650; // Base Score
        const riskFactors = [];

        // Rule 1: Active Loans Penalty
        if (activeLoans > 0) {
            score -= (activeLoans * 50);
            riskFactors.push('Existing active loans reduce borrowing capacity');
        }

        // Rule 2: History Bonus
        if (completedLoans > 0) {
            score += (completedLoans * 20);
        }

        // Rule 3: Profile Completeness (Proxy for KYC)
        if (user.phone && user.email) {
            score += 50;
        } else {
            riskFactors.push('Incomplete profile details');
        }

        // Cap Score
        score = Math.min(900, Math.max(300, score));

        const isEligible = score > 680;

        res.json({
            score,
            isEligible,
            maxLoanAmount: isEligible ? calculateMaxLoanAmount(score) : 0,
            interestRate: calculateInterestRate(score),
            recommendedTenure: 12, // months
            riskFactors: riskFactors.length > 0 ? riskFactors : ['None']
        });

    } catch (error) {
        next(error);
    }
};

// Helper for deterministic calculations
const calculateMaxLoanAmount = (score) => {
    if (score > 800) return 1000000;
    if (score > 750) return 500000;
    if (score > 700) return 200000;
    return 50000;
};

const calculateInterestRate = (score) => {
    if (score > 800) return 8.5;
    if (score > 750) return 10.5;
    return 12.5;
};

// @desc    Apply for a microloan
// @route   POST /api/finance/apply
// @access  Private
exports.applyForLoan = async (req, res, next) => {
    try {
        const { amount, purpose, tenureMonths } = req.body;
        const userId = req.user._id;

        // Validation
        if (!amount || !purpose || !tenureMonths) {
            throw new AppError('Detailed application required', 400);
        }

        // Check for existing pending applications
        const pendingLoan = await Loan.findOne({ farmer: userId, status: { $in: ['applied', 'review_pending'] } });
        if (pendingLoan) {
            throw new AppError('You already have a pending loan application', 400);
        }

        // Calculate EMI
        // Note: Interest rate should ideally come from the eligibility check snapshot, 
        // but for now we re-calculate base rate (conservative)
        const interestRate = 10.5; // Standard base rate for application
        const monthlyRate = interestRate / 12 / 100;
        const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);

        const newLoan = await Loan.create({
            farmer: userId,
            amount,
            purpose,
            tenureMonths,
            interestRate,
            emiAmount: Math.round(emi),
            status: 'applied', // STRICT workflow: applied -> review_pending -> approved -> disbursed
            notes: 'Application submitted via Farmer Portal'
        });

        // Audit Log (if simple audit is kept on model, otherwise standard log)
        // Assuming Loan model has auditLog field as per review
        if (newLoan.auditLog) {
            newLoan.auditLog.push({
                action: 'APPLICATION_SUBMITTED',
                performedBy: userId,
                timestamp: new Date(),
                details: { amount, tenureMonths }
            });
            await newLoan.save();
        }

        res.status(201).json({
            success: true,
            message: 'Loan application submitted successfully. Pending Admin Review.',
            loan: newLoan
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get all loans
// @route   GET /api/finance/loans
// @access  Private
exports.getLoans = async (req, res) => {
    try {
        const loans = await Loan.find({ farmer: req.user._id }).sort({ createdAt: -1 });
        res.json(loans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all transactions
// @route   GET /api/finance/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a new transaction
// @route   POST /api/finance/transactions
// @access  Private
exports.addTransaction = async (req, res) => {
    try {
        const { amount, category, description, date, type } = req.body;

        // Map frontend type 'expense' to 'debit', 'income' to 'credit' if needed
        // But schema says enum: ['credit', 'debit']
        let dbType = type;
        if (type === 'expense') dbType = 'debit';
        if (type === 'income') dbType = 'credit';

        const newTx = await Transaction.create({
            user: req.user._id,
            type: dbType,
            amount,
            category: category || 'other', // Ensure category matches enum or is lenient
            description,
            date: date || Date.now(),
            status: 'completed',
            sourceModel: 'External' // Manual entry
        });

        res.status(201).json(newTx);
    } catch (error) {
        console.error("Error adding transaction:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
