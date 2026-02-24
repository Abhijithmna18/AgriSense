const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPriorityActions, getPerformanceInsights, getDiseaseRadar } = require('../controllers/dashboardController');

router.use(protect);

router.get('/priority-actions', getPriorityActions);
router.get('/insights', getPerformanceInsights);
router.get('/radar', getDiseaseRadar);

module.exports = router;
