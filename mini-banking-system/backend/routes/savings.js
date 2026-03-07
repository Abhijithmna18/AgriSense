const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSavingsGoals, createSavingsGoal, addContribution, updateSavingsGoal, deleteSavingsGoal } = require('../controllers/savingsController');

router.use(protect);

router.get('/', getSavingsGoals);
router.post('/', createSavingsGoal);
router.post('/:id/contribute', addContribution);
router.put('/:id', updateSavingsGoal);
router.delete('/:id', deleteSavingsGoal);

module.exports = router;
