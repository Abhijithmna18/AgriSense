const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { addSoilTest, getSoilTests, getLatestSoilTest } = require('../controllers/soilTestController');

router.use(protect);

router.post('/', addSoilTest);
router.get('/:farmId', getSoilTests);
router.get('/:farmId/latest', getLatestSoilTest);

module.exports = router;
