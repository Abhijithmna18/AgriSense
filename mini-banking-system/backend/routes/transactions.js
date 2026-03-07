const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { sendMoney, requestPayment, getTransactions, getTransaction } = require('../controllers/transactionController');

router.use(protect);

router.post('/send', sendMoney);
router.post('/request', requestPayment);
router.get('/', getTransactions);
router.get('/:id', getTransaction);

module.exports = router;
