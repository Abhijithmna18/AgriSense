const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateQR, upiPayment, scanQR } = require('../controllers/paymentController');

router.use(protect);

router.post('/generate-qr', generateQR);
router.post('/upi', upiPayment);
router.post('/scan-qr', scanQR);

module.exports = router;
