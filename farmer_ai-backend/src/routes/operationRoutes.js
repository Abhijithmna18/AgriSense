const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getOperations,
    createOperation,
    updateOperation,
    getAnalytics
} = require('../controllers/operationController');

router.use(protect);

router.route('/')
    .get(getOperations)
    .post(createOperation);

router.route('/:id')
    .put(updateOperation);

router.get('/analytics/:farmId', getAnalytics);

module.exports = router;
