const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// --- DETERMINISTIC RISK ENGINE (Simulating Ollama) ---
const calculateRisk = (loan, farmer, transactions) => {
    // 1. Financial Metrics
    const totalRevenue = transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = totalRevenue - totalExpenses;
    const monthlyIncome = netIncome / 12; // Simplified annual check

    // 2. Risk Scoring Logic
    let riskScore = 50; // Base score
    const riskFactors = [];
    const alerts = [];
    const explanationDrivers = [];

    // Rule 1: Debt-to-Income
    const emi = loan.emiAmount || 0;
    const debtToIncome = monthlyIncome > 0 ? emi / monthlyIncome : 1.0;

    if (debtToIncome > 0.5) {
        riskScore += 20;
        riskFactors.push({ type: 'debt_burden', severity: 'high', description: 'EMI exceeds 50% of monthly net income' });
        alerts.push({ alert_level: 'critical', code: 'HIGH_DTI', message: 'Debt-to-Income ratio is unsafe (>0.5)', suggested_mitigation: 'Reduce loan amount or extend tenure' });
    } else {
        riskScore -= 10;
        explanationDrivers.push('Healthy Debt-to-Income ratio');
    }

    // Rule 2: Buyer Dependency (Mocked as we don't have buyer data structure yet)
    // In a real app, we'd query Order models.
    const buyerDependency = 0.65; // Mocking 65% for demo
    if (buyerDependency > 0.60) {
        riskScore += 15;
        riskFactors.push({ type: 'buyer_dependency', severity: 'medium', description: 'High reliance on top buyer' });
        alerts.push({ alert_level: 'warning', code: 'SINGLE_BUYER', message: 'Top buyer contributes >60% of revenue', suggested_mitigation: 'Diversify sales channels' });
    }

    // Rule 3: Credit History (Mocked)
    const hasDefaults = false;
    if (hasDefaults) {
        riskScore += 30;
    } else {
        riskScore -= 15;
        explanationDrivers.push('No history of defaults');
    }

    // Cap Score
    riskScore = Math.max(0, Math.min(100, riskScore));

    // Determine Level
    let riskLevel = 'Low';
    if (riskScore > 75) riskLevel = 'Critical';
    else if (riskScore > 50) riskLevel = 'High';
    else if (riskScore > 25) riskLevel = 'Medium';

    // 3. Output Construction
    return {
        risk_assessment: {
            overall_risk_score: riskScore,
            risk_level: riskLevel.toLowerCase(),
            default_probability_percent: Math.round(riskScore * 0.4 * 10) / 10, // heuristic
            confidence_score: 0.85
        },
        loan_recommendation: {
            recommended_max_amount: Math.round(loan.amount * (1 - (riskScore / 200))), // Heuristic reduction
            recommended_tenure_months: loan.tenureMonths,
            estimated_safe_emi: Math.round(monthlyIncome * 0.4), // 40% of income
            interest_rate_band_percent: riskScore > 50 ? '12-14' : '10-12'
        },
        financial_ratios: {
            debt_to_income_ratio: parseFloat(debtToIncome.toFixed(2)),
            emi_to_net_income_ratio: parseFloat((emi / monthlyIncome).toFixed(2)),
            expense_burden_ratio: parseFloat((totalExpenses / (totalRevenue || 1)).toFixed(2))
        },
        risk_factors: riskFactors,
        alerts: alerts,
        approval_guidance: {
            auto_approval_allowed: riskLevel === 'Low',
            manual_override_required: riskLevel !== 'Low',
            approval_conditions: riskLevel === 'High' ? ['Additional collateral required'] : []
        },
        explainability: {
            primary_decision_drivers: explanationDrivers,
            data_gaps: []
        }
    };
};

// --- CONTROLLERS ---

exports.getLoanQueue = async (req, res) => {
    try {
        const loans = await Loan.find({ status: { $in: ['applied', 'review_pending'] } })
            .populate('farmer', 'name email profilePicture')
            .sort({ createdAt: 1 }); // Oldest first

        res.json(loans);
    } catch (error) {
        console.error('Get queue error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getLoanDetail = async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id).populate('farmer');
        if (!loan) return res.status(404).json({ message: 'Loan not found' });

        // Aggregate Data for Context
        const transactions = await Transaction.find({ user: loan.farmer._id });

        // Return structured payload matching the "Review Page" needs
        res.json({
            loan,
            farmer_profile: loan.farmer,
            financial_summary: {
                total_transactions: transactions.length,
                // ... other aggregated stats
            },
            // Include previous analysis if exists
            ai_analysis: loan.aiAnalysis
        });

    } catch (error) {
        console.error('Get detail error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.analyzeLoan = async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id).populate('farmer');
        if (!loan) return res.status(404).json({ message: 'Loan not found' });

        const transactions = await Transaction.find({ user: loan.farmer._id });

        // Run Deterministic Engine
        const analysisResult = calculateRisk(loan, loan.farmer, transactions);

        // Save Analysis to Loan Record
        loan.aiAnalysis = analysisResult;
        loan.riskAssessment = {
            overallRiskScore: analysisResult.risk_assessment.overall_risk_score,
            riskLevel: analysisResult.risk_assessment.risk_level.charAt(0).toUpperCase() + analysisResult.risk_assessment.risk_level.slice(1),
            confidenceScore: analysisResult.risk_assessment.confidence_score
        };
        loan.status = 'review_pending';
        await loan.save();

        res.json(analysisResult);

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ message: 'Analysis Failed' });
    }
};

exports.decisionLoan = async (req, res) => {
    try {
        const { decision, note, modifiedAmount } = req.body; // decision: 'approved', 'rejected'
        const loan = await Loan.findById(req.params.id);

        if (!loan) return res.status(404).json({ message: 'Loan not found' });

        // Update Loan
        loan.status = decision === 'approved' ? 'approved' : 'rejected';
        loan.adminDecision = {
            status: decision,
            note,
            modifiedAmount: modifiedAmount || loan.amount, // Use modified or original
            decidedBy: req.user._id,
            decidedAt: new Date()
        };

        // Audit Log
        loan.auditLog.push({
            action: `Loan ${decision}`,
            performedBy: req.user._id,
            details: { note, modifiedAmount }
        });

        // If Approved, trigger disbursement logic (Simulated here)
        if (decision === 'approved') {
            loan.status = 'active'; // Auto-activate for demo
            loan.disbursedDate = new Date();
            loan.amount = modifiedAmount || loan.amount; // Apply modification

            // Create Disbursement Transaction
            await Transaction.create({
                user: loan.farmer,
                type: 'credit',
                amount: loan.amount,
                category: 'loan_disbursement',
                description: `Loan disbursement: ${loan._id}`,
                source: loan._id,
                status: 'completed'
            });
        }

        await loan.save();
        res.json({ success: true, loan });

    } catch (error) {
        console.error('Decision error:', error);
        res.status(500).json({ message: 'Decision processing failed' });
    }
};
