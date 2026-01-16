const express = require('express');
const {
    getFarms,
    getAllFarms,
    getFarm,
    createFarm,
    updateFarm,
    deleteFarm
} = require('../controllers/farmController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/admin/all', authorize('admin'), getAllFarms);

router.route('/')
    .get(getFarms)
    .post(createFarm);

router.route('/:id')
    .get(getFarm)
    .put(updateFarm)
    .delete(deleteFarm);

module.exports = router;
