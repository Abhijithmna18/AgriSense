const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Import all banking controllers
const walletController = require('../controllers/walletController');
const transactionController = require('../controllers/transactionController');
const paymentController = require('../controllers/paymentController');
const billController = require('../controllers/billController');
const savingsController = require('../controllers/savingsController');
const fdController = require('../controllers/fdController');
const cardController = require('../controllers/cardController');
const notificationController = require('../controllers/notificationController');
const securityController = require('../controllers/securityController');

// All routes require authentication
router.use(protect);

// Wallet routes
router.get('/wallet', walletController.getWallet);
router.post('/wallet/deposit', walletController.deposit);
router.post('/wallet/withdraw', walletController.withdraw);
router.get('/wallet/statement', walletController.getStatement);

// Transaction routes
router.post('/transactions/send', transactionController.sendMoney);
router.post('/transactions/request', transactionController.requestPayment);
router.get('/transactions', transactionController.getTransactions);
router.get('/transactions/:id', transactionController.getTransaction);

// Payment routes
router.post('/payments/generate-qr', paymentController.generateQR);
router.post('/payments/upi', paymentController.upiPayment);
router.post('/payments/scan-qr', paymentController.scanQR);

// Bill routes
router.get('/bills', billController.getBills);
router.post('/bills', billController.createBill);
router.post('/bills/:id/pay', billController.payBill);
router.get('/bills/upcoming', billController.getUpcomingBills);
router.delete('/bills/:id', billController.deleteBill);

// Savings Goal routes
router.get('/savings-goals', savingsController.getSavingsGoals);
router.post('/savings-goals', savingsController.createSavingsGoal);
router.post('/savings-goals/:id/contribute', savingsController.addContribution);
router.put('/savings-goals/:id', savingsController.updateSavingsGoal);
router.delete('/savings-goals/:id', savingsController.deleteSavingsGoal);

// Fixed Deposit routes
router.get('/fixed-deposits', fdController.getFixedDeposits);
router.post('/fixed-deposits', fdController.createFixedDeposit);
router.post('/fixed-deposits/:id/withdraw', fdController.withdrawFixedDeposit);
router.get('/fixed-deposits/calculate', fdController.calculateMaturity);

// Card routes
router.get('/cards', cardController.getCards);
router.post('/cards', cardController.createCard);
router.put('/cards/:id/freeze', cardController.toggleFreeze);
router.put('/cards/:id/limits', cardController.updateLimits);
router.get('/cards/:id/details', cardController.getCardDetails);

// Notification routes
router.get('/notifications', notificationController.getNotifications);
router.put('/notifications/:id/read', notificationController.markAsRead);
router.get('/notifications/unread-count', notificationController.getUnreadCount);
router.delete('/notifications/:id', notificationController.deleteNotification);

// Security routes
router.post('/security/send-otp', securityController.sendOTP);
router.post('/security/verify-otp', securityController.verifyOTP);
router.post('/security/change-pin', securityController.changePin);

module.exports = router;
