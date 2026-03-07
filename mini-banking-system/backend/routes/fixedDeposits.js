const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getFixedDeposits, createFixedDeposit, withdrawFixedDeposit, calculateMaturity } = require('../controllers/fdController');

router.use(protect);

router.get('/', getFixedDeposits);
router.post('/', createFixedDeposit);
router.post('/:id/withdraw', withdrawFixedDeposit);
router.get('/calculate', calculateMaturity);

module.exports = router;
