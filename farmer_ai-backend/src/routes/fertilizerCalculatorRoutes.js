const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAvailableCrops,
  getCropDetails,
  getSoilData,
  calculateFertilizer,
  getFarmsWithSoilTestStatus
} = require('../controllers/fertilizerCalculatorController');

// All routes require authentication
router.use(protect);

// GET /api/fertilizer-calculator/crops - Get all available crops
router.get('/crops', getAvailableCrops);

// GET /api/fertilizer-calculator/crops/:cropName - Get crop details
router.get('/crops/:cropName', getCropDetails);

// GET /api/fertilizer-calculator/farms - Get farms with soil test status
router.get('/farms', getFarmsWithSoilTestStatus);

// GET /api/fertilizer-calculator/soil-data/:farmId - Get soil data for farm
router.get('/soil-data/:farmId', getSoilData);

// POST /api/fertilizer-calculator/calculate - Calculate fertilizer requirement
router.post('/calculate', calculateFertilizer);

module.exports = router;
