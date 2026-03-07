const express = require('express');
const router = express.Router();
const miniBankController = require('../controllers/miniBankController');
const { protect } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// ==================== WALLET ROUTES ====================
router.get('/wallet/balance', miniBankController.getWalletBalance);
router.post('/wallet/update', miniBankController.updateWalletBalance);

// ==================== TRANSACTION ROUTES ====================
router.post('/transactions/send', miniBankController.sendMoney);
router.post('/transactions/request', miniBankController.requestPayment);
router.post('/transactions/qr-payment', miniBankController.processQRPayment);
router.get('/transactions/recent', miniBankController.getRecentTransactions);

// ==================== BILL ROUTES ====================
router.get('/bills/upcoming', miniBankController.getUpcomingBills);
router.post('/bills/pay', miniBankController.payBill);

// ==================== SAVINGS GOAL ROUTES ====================
router.get('/savings/goals', miniBankController.getSavingsGoals);
router.post('/savings/goals', miniBankController.createSavingsGoal);
router.post('/savings/contribute', miniBankController.updateSavingsGoal);

// ==================== FIXED DEPOSIT ROUTES ====================
router.get('/fixed-deposits/active', miniBankController.getActiveFDs);
router.post('/fixed-deposits/create', miniBankController.createFixedDeposit);
router.get('/fixed-deposits/calculate', miniBankController.calculateFDInterest);

// ==================== VIRTUAL CARD ROUTES ====================
router.get('/cards/details', miniBankController.getVirtualCard);
router.post('/cards/generate', miniBankController.generateVirtualCard);
router.post('/cards/freeze', miniBankController.freezeCard);
router.post('/cards/set-limit', miniBankController.setCardLimit);

// ==================== AI RECOMMENDATIONS ====================
router.post('/savings/ai-recommendations', miniBankController.getSavingsAIRecommendations);
router.post('/fixed-deposits/ai-recommendations', miniBankController.getFDRecommendations);

module.exports = router;
