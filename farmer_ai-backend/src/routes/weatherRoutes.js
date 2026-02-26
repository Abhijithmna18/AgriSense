const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getCurrentWeather,
    getForecast,
    getWeatherForFarm,
    getFarmingAlerts
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

module.exports = router;
