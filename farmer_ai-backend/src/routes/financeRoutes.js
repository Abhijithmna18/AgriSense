const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getFinancialSnapshot,
    checkEligibility,
    applyForLoan,
    getLoans,
    getTransactions,
    addTransaction,
    getProfitabilityAnalysis
} = require('../controllers/financeController');
const { getFinancialInsights } = require('../controllers/financeAIController');

router.get('/snapshot', protect, getFinancialSnapshot);
router.post('/eligibility', protect, checkEligibility);
router.post('/apply', protect, applyForLoan);
router.get('/loans', protect, getLoans);
router.get('/transactions', protect, getTransactions);
router.post('/transactions', protect, addTransaction);
router.get('/profitability/:cropCycleId', protect, getProfitabilityAnalysis);
router.post('/ai-insight', protect, getFinancialInsights);

module.exports = router;
