const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCards, createCard, toggleFreeze, updateLimits, getCardDetails } = require('../controllers/cardController');

router.use(protect);

router.get('/', getCards);
router.post('/', createCard);
router.put('/:id/freeze', toggleFreeze);
router.put('/:id/limits', updateLimits);
router.get('/:id/details', getCardDetails);

module.exports = router;
