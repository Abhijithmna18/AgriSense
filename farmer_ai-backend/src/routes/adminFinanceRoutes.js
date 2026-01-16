const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getLoanQueue,
    getLoanDetail,
    analyzeLoan,
    decisionLoan
} = require('../controllers/adminFinanceController');

// All routes are protected and restricted to 'admin'
router.use(protect);
router.use(authorize('admin'));

router.get('/queue', getLoanQueue);
router.get('/:id', getLoanDetail);
router.post('/:id/analyze', analyzeLoan);
router.put('/:id/decision', decisionLoan); // Changed to PUT as it updates the loan

module.exports = router;
