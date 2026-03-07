const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getWallet,
    deposit,
    withdraw,
    getStatement,
    toggleVisibility
} = require('../controllers/walletController');

// All routes require authentication
router.use(protect);

router.get('/', getWallet);
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);
router.get('/statement', getStatement);
router.put('/toggle-visibility', toggleVisibility);

module.exports = router;
