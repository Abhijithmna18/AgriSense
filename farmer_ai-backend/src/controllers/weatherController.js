/**
 * weatherController.js
 * Handles weather data requests — current weather, forecasts, and farm alerts.
 */
const weatherAPI = require('../services/weatherAPI');
const Farm = require('../models/Farm');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

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

        console.log('[WeatherController] getForecast for city:', city);
        const forecast = await weatherAPI.getForecastByCity(city);
        console.log('[WeatherController] Forecast received, days:', forecast?.length);
        res.json({ success: true, data: forecast });
    } catch (error) {
        console.error('[WeatherController] getForecast ERROR:', error);
        console.error('[WeatherController] Error stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch forecast.',
            error: error.message 
        });
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

        console.log('[WeatherController] Farm found:', farm.name);
        console.log('[WeatherController] Farm location:', farm.location);

        const { coordinates } = farm.location;
        let weather;

        if (coordinates?.length === 2) {
            console.log('[WeatherController] Using coordinates:', coordinates);
            weather = await weatherAPI.getCurrentWeatherByCoords(coordinates[1], coordinates[0]); // [lng, lat]
        } else {
            const city = `${farm.location.district}, ${farm.location.state}`;
            console.log('[WeatherController] Using city:', city);
            weather = await weatherAPI.getCurrentWeatherByCity(city);
        }

        const alerts = weatherAPI.generateWeatherAlerts(weather);

        res.json({
            success: true,
            farm: { id: farm._id, name: farm.name },
            data: { ...weather, alerts }
        });
    } catch (error) {
        console.error('[WeatherController] getWeatherForFarm ERROR:', error);
        console.error('[WeatherController] Error stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch farm weather.',
            error: error.message 
        });
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

/**
 * @desc    Get comprehensive weather analysis with forecast alerts
 * @route   GET /api/weather/analysis?city=Pune
 * @access  Private
 */
exports.getWeatherAnalysis = async (req, res) => {
    try {
        const { city, lat, lon } = req.query;

        let analysis;
        if (lat && lon) {
            analysis = await weatherAPI.getWeatherAnalysisByCoords(parseFloat(lat), parseFloat(lon));
        } else if (city) {
            analysis = await weatherAPI.getWeatherAnalysis(city);
        } else {
            return res.status(400).json({ success: false, message: 'Provide city or lat/lon query params.' });
        }

        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('[WeatherController] getWeatherAnalysis:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch weather analysis.' });
    }
};

/**
 * @desc    Check weather conditions for a farm and send alerts if needed
 * @route   POST /api/weather/check-farm/:farmId
 * @access  Private
 */
exports.checkFarmWeatherAlerts = async (req, res) => {
    try {
        const farm = await Farm.findById(req.params.farmId).populate('user', '_id firstName lastName');
        if (!farm) return res.status(404).json({ success: false, message: 'Farm not found.' });

        const { coordinates } = farm.location;
        let analysis;

        if (coordinates?.length === 2) {
            analysis = await weatherAPI.getWeatherAnalysisByCoords(coordinates[1], coordinates[0]);
        } else {
            const city = `${farm.location.district}, ${farm.location.state}`;
            analysis = await weatherAPI.getWeatherAnalysis(city);
        }

        // Filter critical and warning alerts
        const criticalAlerts = analysis.alerts.all.filter(a => a.type === 'danger' || a.type === 'warning');
        
        const sentAlerts = [];
        const skippedAlerts = [];

        // Send notifications for critical alerts
        for (const alert of criticalAlerts) {
            const result = await notificationService.sendWeatherAlert(
                farm.user._id,
                alert.message,
                alert.type,
                alert.alertType,
                analysis.current,
                {
                    city: analysis.current.city,
                    coordinates: coordinates || []
                },
                farm._id
            );
            
            if (result.sent) {
                sentAlerts.push({ alert: alert.message, type: alert.type });
            } else {
                skippedAlerts.push({ alert: alert.message, reason: result.reason });
            }
        }

        res.json({
            success: true,
            farm: { id: farm._id, name: farm.name },
            weather: analysis.current,
            alertsSent: sentAlerts.length,
            alertsSkipped: skippedAlerts.length,
            details: { sent: sentAlerts, skipped: skippedAlerts }
        });
    } catch (error) {
        console.error('[WeatherController] checkFarmWeatherAlerts:', error.message);
        res.status(500).json({ success: false, message: 'Failed to check farm weather alerts.' });
    }
};

/**
 * @desc    Check weather for all farms of a user and send alerts
 * @route   POST /api/weather/check-user-farms
 * @access  Private
 */
exports.checkUserFarmsWeatherAlerts = async (req, res) => {
    try {
        const userId = req.user.id;
        const farms = await Farm.find({ user: userId }).select('_id name location');

        if (farms.length === 0) {
            return res.json({
                success: true,
                message: 'No farms found for this user.',
                farmsChecked: 0
            });
        }

        const results = [];

        for (const farm of farms) {
            try {
                const { coordinates } = farm.location;
                let analysis;

                if (coordinates?.length === 2) {
                    analysis = await weatherAPI.getWeatherAnalysisByCoords(coordinates[1], coordinates[0]);
                } else {
                    const city = `${farm.location.district}, ${farm.location.state}`;
                    analysis = await weatherAPI.getWeatherAnalysis(city);
                }

                const criticalAlerts = analysis.alerts.all.filter(a => a.type === 'danger' || a.type === 'warning');
                
                let sentCount = 0;
                let skippedCount = 0;

                for (const alert of criticalAlerts) {
                    const result = await notificationService.sendWeatherAlert(
                        userId,
                        alert.message,
                        alert.type,
                        alert.alertType,
                        analysis.current,
                        {
                            city: analysis.current.city,
                            coordinates: coordinates || []
                        },
                        farm._id
                    );
                    
                    if (result.sent) sentCount++;
                    else skippedCount++;
                }

                results.push({
                    farmId: farm._id,
                    farmName: farm.name,
                    alertsSent: sentCount,
                    alertsSkipped: skippedCount
                });
            } catch (error) {
                console.error(`[WeatherController] Error checking farm ${farm._id}:`, error.message);
                results.push({
                    farmId: farm._id,
                    farmName: farm.name,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            farmsChecked: farms.length,
            results
        });
    } catch (error) {
        console.error('[WeatherController] checkUserFarmsWeatherAlerts:', error.message);
        res.status(500).json({ success: false, message: 'Failed to check user farms weather alerts.' });
    }
};

/**
 * @desc    Batch check weather for all active farmers (Admin/Cron job)
 * @route   POST /api/weather/check-all-farms
 * @access  Private (Admin only)
 */
exports.checkAllFarmsWeatherAlerts = async (req, res) => {
    try {
        // Get all active farmers
        const farmers = await User.find({ 
            roles: 'farmer', 
            isActive: true 
        }).select('_id firstName lastName');

        if (farmers.length === 0) {
            return res.json({
                success: true,
                message: 'No active farmers found.',
                farmersChecked: 0
            });
        }

        let totalFarmsChecked = 0;
        let totalAlertsSent = 0;
        let totalAlertsSkipped = 0;
        const errors = [];

        for (const farmer of farmers) {
            try {
                const farms = await Farm.find({ user: farmer._id }).select('_id name location');

                for (const farm of farms) {
                    try {
                        const { coordinates } = farm.location;
                        let analysis;

                        if (coordinates?.length === 2) {
                            analysis = await weatherAPI.getWeatherAnalysisByCoords(coordinates[1], coordinates[0]);
                        } else {
                            const city = `${farm.location.district}, ${farm.location.state}`;
                            analysis = await weatherAPI.getWeatherAnalysis(city);
                        }

                        const criticalAlerts = analysis.alerts.all.filter(a => a.type === 'danger' || a.type === 'warning');

                        for (const alert of criticalAlerts) {
                            const result = await notificationService.sendWeatherAlert(
                                farmer._id,
                                alert.message,
                                alert.type,
                                alert.alertType,
                                analysis.current,
                                {
                                    city: analysis.current.city,
                                    coordinates: coordinates || []
                                },
                                farm._id
                            );
                            
                            if (result.sent) totalAlertsSent++;
                            else totalAlertsSkipped++;
                        }

                        totalFarmsChecked++;
                    } catch (error) {
                        errors.push({ farmId: farm._id, error: error.message });
                    }
                }
            } catch (error) {
                errors.push({ userId: farmer._id, error: error.message });
            }
        }

        res.json({
            success: true,
            farmersChecked: farmers.length,
            farmsChecked: totalFarmsChecked,
            alertsSent: totalAlertsSent,
            alertsSkipped: totalAlertsSkipped,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('[WeatherController] checkAllFarmsWeatherAlerts:', error.message);
        res.status(500).json({ success: false, message: 'Failed to check all farms weather alerts.' });
    }
};
