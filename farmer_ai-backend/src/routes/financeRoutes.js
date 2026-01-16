const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getFinancialSnapshot,
    checkEligibility,
    applyForLoan,
    getLoans,
    getTransactions
} = require('../controllers/financeController');

router.get('/snapshot', protect, getFinancialSnapshot);
router.post('/eligibility', protect, checkEligibility);
router.post('/apply', protect, applyForLoan);
router.get('/loans', protect, getLoans);
router.get('/transactions', protect, getTransactions);

module.exports = router;
