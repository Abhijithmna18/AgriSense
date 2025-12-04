const express = require('express');
const router = express.Router();
const {
    createCrop,
    getCrops,
    getCropById,
    updateCrop,
    deleteCrop
} = require('../controllers/cropController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
    .get(getCrops)
    .post(protect, adminOnly, createCrop);

router.route('/:id')
    .get(getCropById)
    .put(protect, adminOnly, updateCrop)
    .delete(protect, adminOnly, deleteCrop);

module.exports = router;
