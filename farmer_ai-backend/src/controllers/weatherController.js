/**
 * weatherController.js
 * Handles weather data requests — current weather, forecasts, and farm alerts.
 */
const weatherAPI = require('../services/weatherAPI');
const Farm = require('../models/Farm');

/**
 * @desc    Get current weather for a given city
 * @route   GET /api/weather/current?city=Pune
 * @access  Private
 */
exports.getCurrentWeather = async (req, res) => {
    try {
        const { city, lat, lon } = req.query;

        let weather;
        if (lat && lon) {
            weather = await weatherAPI.getCurrentWeatherByCoords(parseFloat(lat), parseFloat(lon));
        } else if (city) {
            weather = await weatherAPI.getCurrentWeatherByCity(city);
        } else {
            return res.status(400).json({ success: false, message: 'Provide city or lat/lon query params.' });
        }

        const alerts = weatherAPI.generateWeatherAlerts(weather);

        res.json({
            success: true,
            data: { ...weather, alerts }
        });
    } catch (error) {
        console.error('[WeatherController] getCurrentWeather:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch weather data.' });
    }
};

/**
 * @desc    Get 5-day forecast for a city
 * @route   GET /api/weather/forecast?city=Pune
 * @access  Private
 */
exports.getForecast = async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) return res.status(400).json({ success: false, message: 'City is required.' });

        const forecast = await weatherAPI.getForecastByCity(city);
        res.json({ success: true, data: forecast });
    } catch (error) {
        console.error('[WeatherController] getForecast:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch forecast.' });
    }
};

/**
 * @desc    Get weather for a specific farm location
 * @route   GET /api/weather/farm/:farmId
 * @access  Private
 */
exports.getWeatherForFarm = async (req, res) => {
    try {
        const farm = await Farm.findById(req.params.farmId).select('name location');
        if (!farm) return res.status(404).json({ success: false, message: 'Farm not found.' });

        const { coordinates } = farm.location;
        let weather;

        if (coordinates?.length === 2) {
            weather = await weatherAPI.getCurrentWeatherByCoords(coordinates[1], coordinates[0]); // [lng, lat]
        } else {
            const city = `${farm.location.district}, ${farm.location.state}`;
            weather = await weatherAPI.getCurrentWeatherByCity(city);
        }

        const alerts = weatherAPI.generateWeatherAlerts(weather);

        res.json({
            success: true,
            farm: { id: farm._id, name: farm.name },
            data: { ...weather, alerts }
        });
    } catch (error) {
        console.error('[WeatherController] getWeatherForFarm:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch farm weather.' });
    }
};

/**
 * @desc    Get farming alerts for current conditions
 * @route   GET /api/weather/alerts?city=Pune
 * @access  Private
 */
exports.getFarmingAlerts = async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) return res.status(400).json({ success: false, message: 'City is required.' });

        const weather = await weatherAPI.getCurrentWeatherByCity(city);
        const alerts = weatherAPI.generateWeatherAlerts(weather);

        res.json({
            success: true,
            city,
            conditions: { temp: weather.temp, humidity: weather.humidity, rain_1h: weather.rain_1h, wind_speed: weather.wind_speed },
            alerts
        });
    } catch (error) {
        console.error('[WeatherController] getFarmingAlerts:', error.message);
        res.status(500).json({ success: false, message: 'Failed to generate farming alerts.' });
    }
};
