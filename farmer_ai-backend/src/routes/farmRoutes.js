const express = require('express');
const {
    getFarms,
    getFarm,
    createFarm,
    updateFarm,
    deleteFarm
} = require('../controllers/farmController');

const router = express.Router();

const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
    .get(getFarms)
    .post(createFarm);

router.route('/:id')
    .get(getFarm)
    .put(updateFarm)
    .delete(deleteFarm);

module.exports = router;
