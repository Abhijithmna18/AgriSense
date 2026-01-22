const express = require('express');
const {
    getFarms,
    getFarm,
    createFarm,
    updateFarm,
    deleteFarm,
    getAllFarms,
    getFarmIntelligence,
    addCropCycle,
    updateCropCycle,
    addObservation,
    logAction,
    recordHarvest
} = require('../controllers/farmController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All farm routes are protected

// Admin Route
router.get('/admin/all', authorize('admin'), getAllFarms);

router
    .route('/')
    .get(getFarms)
    .post(createFarm);

router
    .route('/:id')
    .get(getFarm)
    .put(updateFarm)
    .delete(deleteFarm);

// Intelligence Routes
router.get('/:id/intelligence', getFarmIntelligence);
router.post('/:id/crop-cycles', addCropCycle);
router.put('/crop-cycles/:id', updateCropCycle); // ID is cycle ID
router.put('/crop-cycles/:id/harvest', recordHarvest); // Record Harvest
router.post('/:id/observations', addObservation);
router.post('/:id/actions', logAction);

module.exports = router;
