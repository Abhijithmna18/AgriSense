const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getBills, createBill, payBill, getUpcomingBills, deleteBill } = require('../controllers/billController');

router.use(protect);

router.get('/', getBills);
router.post('/', createBill);
router.post('/:id/pay', payBill);
router.get('/upcoming', getUpcomingBills);
router.delete('/:id', deleteBill);

module.exports = router;
