const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getCurrentWeather,
    getForecast,
    getWeatherForFarm,
    getFarmingAlerts,
    getWeatherAnalysis,
    checkFarmWeatherAlerts,
    checkUserFarmsWeatherAlerts,
    checkAllFarmsWeatherAlerts
} = require('../controllers/weatherController');

router.use(protect);

// GET /api/weather/current?city=Pune
router.get('/current', getCurrentWeather);

// GET /api/weather/forecast?city=Pune
router.get('/forecast', getForecast);

// GET /api/weather/farm/:farmId
router.get('/farm/:farmId', getWeatherForFarm);

// GET /api/weather/alerts?city=Pune
router.get('/alerts', getFarmingAlerts);

// GET /api/weather/analysis?city=Pune (or ?lat=18.5&lon=73.8)
router.get('/analysis', getWeatherAnalysis);

// POST /api/weather/check-farm/:farmId - Check and send alerts for specific farm
router.post('/check-farm/:farmId', checkFarmWeatherAlerts);

// POST /api/weather/check-user-farms - Check all farms for logged-in user
router.post('/check-user-farms', checkUserFarmsWeatherAlerts);

// POST /api/weather/check-all-farms - Admin endpoint to check all farms (for cron jobs)
router.post('/check-all-farms', authorize('admin'), checkAllFarmsWeatherAlerts);

module.exports = router;
