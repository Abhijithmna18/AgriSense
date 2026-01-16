const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const User = require('../models/User');

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
exports.checkEligibility = async (req, res) => {
    try {
        const userId = req.user._id;

        // Mock eligibility logic
        // In real app, this would query credit bureau or internal ML model
        const user = await User.findById(userId);
        const activeLoans = await Loan.countDocuments({ farmer: userId, status: 'active' });

        let score = 750; // Base score
        if (activeLoans > 0) score -= 50;

        // Randomize slightly for demo
        score = Math.max(0, Math.min(900, score - Math.floor(Math.random() * 50)));

        const isEligible = score > 650;

        res.json({
            score,
            isEligible,
            maxLoanAmount: isEligible ? 500000 : 0,
            interestRate: 10.5,
            recommendedTenure: 12, // months
            riskFactors: activeLoans > 0 ? ['Existing active loans'] : ['Rainfall dependency']
        });

    } catch (error) {
        console.error('Error checking eligibility:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Apply for a microloan
// @route   POST /api/finance/apply
// @access  Private
exports.applyForLoan = async (req, res) => {
    try {
        const { amount, purpose, tenureMonths } = req.body;
        const userId = req.user._id;

        // Simple calculation
        const interestRate = 10.5; // Annual
        const monthlyRate = interestRate / 12 / 100;
        const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);

        const newLoan = await Loan.create({
            farmer: userId,
            amount,
            purpose,
            tenureMonths,
            interestRate,
            emiAmount: Math.round(emi),
            status: 'applied', // Needs approval
            notes: 'Auto-generated application'
        });

        // For demo: Auto-approve and disburse for instant gratification
        // In product, this would go to admin for approval
        newLoan.status = 'active';
        newLoan.disbursedDate = new Date();
        await newLoan.save();

        // Create disbursement transaction
        await Transaction.create({
            user: userId,
            type: 'credit',
            amount,
            category: 'loan_disbursement',
            description: `Loan disbursement: ${newLoan._id}`,
            source: newLoan._id,
            sourceModel: 'Loan',
            status: 'completed'
        });

        res.status(201).json({
            success: true,
            message: 'Loan application submitted successfully',
            loan: newLoan
        });

    } catch (error) {
        console.error('Error applying for loan:', error);
        res.status(500).json({ message: 'Server Error' });
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
