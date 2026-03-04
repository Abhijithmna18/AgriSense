/**
 * farmWeatherMonitoringService.js
 * 
 * Production-grade automated farm-specific weather monitoring system
 * 
 * Features:
 * - Monitors all active farms with location data
 * - Applies threshold-based alert rules
 * - Prevents duplicate alerts within 24 hours
 * - Efficient batch processing with error handling
 * - Comprehensive logging and metrics
 * - Integrates with existing notification system
 * 
 * Alert Rules:
 * - Heavy rain > 50mm → flood_risk
 * - Temperature < 15°C → cold_stress
 * - Temperature > 35°C → heat_stress
 * - Rainfall < 5mm for 5 days → drought_risk
 * - Frost (temp ≤ 0°C) → frost
 * - Strong wind > 12 m/s → strong_wind
 * - High humidity > 85% → high_humidity
 */

const Farm = require('../models/Farm');
const User = require('../models/User');
const WeatherAlert = require('../models/WeatherAlert');
const weatherAPI = require('./weatherAPI');
const notificationService = require('./notificationService');

/**
 * Alert rule definitions with thresholds
 */
const ALERT_RULES = {
    // Critical temperature alerts
    frost: {
        check: (weather) => weather.temp <= 0,
        severity: 'danger',
        message: (weather, farm) => 
            `🥶 FROST ALERT for ${farm.name}: Temperature at ${weather.temp}°C. Protect sensitive crops immediately!`,
        cooldownHours: 12
    },
    cold_stress: {
        check: (weather) => weather.temp > 0 && weather.temp < 15,
        severity: 'warning',
        message: (weather, farm) => 
            `❄️ Cold stress warning for ${farm.name}: Temperature ${weather.temp}°C. Monitor crop health closely.`,
        cooldownHours: 12
    },
    heat_stress: {
        check: (weather) => weather.temp > 35,
        severity: 'warning',
        message: (weather, farm) => 
            `🌡️ Heat stress alert for ${farm.name}: Temperature ${weather.temp}°C. Ensure adequate irrigation.`,
        cooldownHours: 12
    },
    extreme_heat: {
        check: (weather) => weather.temp > 40,
        severity: 'danger',
        message: (weather, farm) => 
            `🔥 EXTREME HEAT for ${farm.name}: ${weather.temp}°C! Irrigate immediately and provide shade.`,
        cooldownHours: 12
    },
    
    // Rainfall alerts
    heavy_rain: {
        check: (weather) => (weather.rain_1h || 0) > 50,
        severity: 'danger',
        message: (weather, farm) => 
            `🌧️ HEAVY RAIN ALERT for ${farm.name}: ${weather.rain_1h}mm rainfall. Check drainage systems!`,
        cooldownHours: 6
    },
    moderate_rain: {
        check: (weather) => (weather.rain_1h || 0) > 25 && (weather.rain_1h || 0) <= 50,
        severity: 'warning',
        message: (weather, farm) => 
            `🌦️ Moderate rain for ${farm.name}: ${weather.rain_1h}mm. Delay field operations.`,
        cooldownHours: 6
    },
    
    // Wind alerts
    strong_wind: {
        check: (weather) => weather.wind_speed > 12,
        severity: 'warning',
        message: (weather, farm) => 
            `💨 Strong winds at ${farm.name}: ${weather.wind_speed} m/s. Avoid pesticide spraying.`,
        cooldownHours: 6
    },
    
    // Humidity alerts
    high_humidity: {
        check: (weather) => weather.humidity > 85,
        severity: 'info',
        message: (weather, farm) => 
            `💧 High humidity at ${farm.name}: ${weather.humidity}%. Increased fungal disease risk.`,
        cooldownHours: 24
    },
    
    // UV alerts
    high_uv: {
        check: (weather) => weather.uv_index > 8,
        severity: 'info',
        message: (weather, farm) => 
            `☀️ High UV index at ${farm.name}: ${weather.uv_index}. Avoid field work 11am-3pm.`,
        cooldownHours: 24
    }
};

/**
 * Check for drought risk using forecast data
 * @param {Array} forecast - 7-day forecast array
 * @returns {Object|null} - Drought alert object or null
 */
const checkDroughtRisk = (forecast) => {
    if (!forecast || forecast.length < 5) return null;
    
    // Check last 5 days of forecast
    const last5Days = forecast.slice(0, 5);
    const totalRainfall = last5Days.reduce((sum, day) => sum + (day.rain_mm || 0), 0);
    const avgTemp = last5Days.reduce((sum, day) => sum + day.temp_max, 0) / 5;
    
    if (totalRainfall < 5 && avgTemp > 30) {
        return {
            alertType: 'drought_risk',
            severity: 'warning',
            message: `🏜️ Drought risk: Only ${totalRainfall.toFixed(1)}mm rainfall expected in next 5 days. Plan irrigation.`,
            cooldownHours: 24
        };
    }
    
    return null;
};

/**
 * Evaluate all alert rules for given weather data
 * @param {Object} weather - Current weather data
 * @param {Array} forecast - Forecast data
 * @param {Object} farm - Farm object
 * @returns {Array} - Array of triggered alerts
 */
const evaluateAlertRules = (weather, forecast, farm) => {
    const triggeredAlerts = [];
    
    // Check current weather rules
    for (const [alertType, rule] of Object.entries(ALERT_RULES)) {
        if (rule.check(weather)) {
            triggeredAlerts.push({
                alertType,
                severity: rule.severity,
                message: rule.message(weather, farm),
                cooldownHours: rule.cooldownHours,
                weatherData: weather
            });
        }
    }
    
    // Check drought risk from forecast
    const droughtAlert = checkDroughtRisk(forecast);
    if (droughtAlert) {
        triggeredAlerts.push({
            ...droughtAlert,
            weatherData: weather
        });
    }
    
    return triggeredAlerts;
};

/**
 * Check if alert was recently sent (cooldown check)
 * @param {string} userId - User ID
 * @param {string} alertType - Alert type
 * @param {number} cooldownHours - Cooldown period in hours
 * @returns {Promise<boolean>} - True if alert should be skipped
 */
const shouldSkipAlert = async (userId, alertType, cooldownHours) => {
    const cooldownMs = cooldownHours * 60 * 60 * 1000;
    const recentAlert = await WeatherAlert.findOne({
        user: userId,
        alertType,
        sentAt: { $gte: new Date(Date.now() - cooldownMs) }
    }).sort({ sentAt: -1 }).lean();
    
    return !!recentAlert;
};

/**
 * Send alert and track in database
 * @param {Object} alert - Alert object
 * @param {Object} farm - Farm object
 * @param {Object} user - User object
 * @returns {Promise<Object>} - Result object
 */
const sendAndTrackAlert = async (alert, farm, user) => {
    try {
        // Check cooldown
        const skip = await shouldSkipAlert(user._id, alert.alertType, alert.cooldownHours);
        if (skip) {
            return {
                sent: false,
                reason: 'cooldown',
                alertType: alert.alertType
            };
        }
        
        // Send notification
        const notification = await notificationService.createNotification(
            user._id,
            'weather_alert',
            `Weather Alert - ${farm.name}`,
            alert.message
        );
        
        if (!notification) {
            return {
                sent: false,
                reason: 'notification_failed',
                alertType: alert.alertType
            };
        }
        
        // Track in WeatherAlert model
        await WeatherAlert.create({
            user: user._id,
            farm: farm._id,
            alertType: alert.alertType,
            severity: alert.severity,
            message: alert.message,
            weatherData: {
                temperature: alert.weatherData.temp,
                rainfall: alert.weatherData.rain_1h || 0,
                humidity: alert.weatherData.humidity,
                windSpeed: alert.weatherData.wind_speed,
                uvIndex: alert.weatherData.uv_index
            },
            location: {
                city: `${farm.location.district}, ${farm.location.state}`,
                coordinates: farm.location.coordinates
            },
            expiresAt: new Date(Date.now() + alert.cooldownHours * 60 * 60 * 1000)
        });
        
        return {
            sent: true,
            alertType: alert.alertType,
            severity: alert.severity
        };
    } catch (error) {
        console.error(`[FarmWeatherMonitoring] Error sending alert:`, error.message);
        return {
            sent: false,
            reason: 'error',
            error: error.message,
            alertType: alert.alertType
        };
    }
};

/**
 * Monitor weather for a single farm
 * @param {Object} farm - Farm object (must be populated with user)
 * @returns {Promise<Object>} - Monitoring result
 */
exports.monitorSingleFarm = async (farm) => {
    const startTime = Date.now();
    
    try {
        // Validate farm data
        if (!farm.location || !farm.location.coordinates || farm.location.coordinates.length !== 2) {
            return {
                success: false,
                farmId: farm._id,
                farmName: farm.name,
                error: 'Invalid or missing farm coordinates',
                duration: Date.now() - startTime
            };
        }
        
        const [lon, lat] = farm.location.coordinates;
        
        // Fetch weather data
        const weatherAnalysis = await weatherAPI.getWeatherAnalysisByCoords(lat, lon);
        
        // Evaluate alert rules
        const triggeredAlerts = evaluateAlertRules(
            weatherAnalysis.current,
            weatherAnalysis.forecast,
            farm
        );
        
        if (triggeredAlerts.length === 0) {
            return {
                success: true,
                farmId: farm._id,
                farmName: farm.name,
                alertsTriggered: 0,
                alertsSent: 0,
                duration: Date.now() - startTime
            };
        }
        
        // Send alerts
        const results = await Promise.all(
            triggeredAlerts.map(alert => sendAndTrackAlert(alert, farm, farm.user))
        );
        
        const sentCount = results.filter(r => r.sent).length;
        const skippedCount = results.filter(r => !r.sent && r.reason === 'cooldown').length;
        
        return {
            success: true,
            farmId: farm._id,
            farmName: farm.name,
            alertsTriggered: triggeredAlerts.length,
            alertsSent: sentCount,
            alertsSkipped: skippedCount,
            details: results,
            duration: Date.now() - startTime
        };
    } catch (error) {
        console.error(`[FarmWeatherMonitoring] Error monitoring farm ${farm._id}:`, error.message);
        return {
            success: false,
            farmId: farm._id,
            farmName: farm.name,
            error: error.message,
            duration: Date.now() - startTime
        };
    }
};

/**
 * Monitor weather for all active farms (batch operation)
 * @param {Object} options - Monitoring options
 * @returns {Promise<Object>} - Batch monitoring result
 */
exports.monitorAllFarms = async (options = {}) => {
    const {
        limit = null,
        batchSize = 10,
        delayBetweenBatches = 1000
    } = options;
    
    const startTime = Date.now();
    console.log(`[FarmWeatherMonitoring] Starting batch monitoring at ${new Date().toISOString()}`);
    
    try {
        // Fetch all active farms with valid coordinates
        const query = {
            'location.coordinates': { $exists: true, $ne: [] }
        };
        
        let farms = await Farm.find(query)
            .populate('user', '_id firstName lastName email isActive')
            .lean();
        
        // Filter for active users only
        farms = farms.filter(f => f.user && f.user.isActive);
        
        if (limit) {
            farms = farms.slice(0, limit);
        }
        
        console.log(`[FarmWeatherMonitoring] Found ${farms.length} farms to monitor`);
        
        if (farms.length === 0) {
            return {
                success: true,
                message: 'No farms found to monitor',
                farmsChecked: 0,
                duration: Date.now() - startTime
            };
        }
        
        // Process farms in batches to avoid API rate limits
        const results = [];
        for (let i = 0; i < farms.length; i += batchSize) {
            const batch = farms.slice(i, i + batchSize);
            console.log(`[FarmWeatherMonitoring] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(farms.length / batchSize)}`);
            
            const batchResults = await Promise.allSettled(
                batch.map(farm => exports.monitorSingleFarm(farm))
            );
            
            results.push(...batchResults.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason }));
            
            // Delay between batches to respect API limits
            if (i + batchSize < farms.length) {
                await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
            }
        }
        
        // Calculate metrics
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        const totalAlertsSent = successful.reduce((sum, r) => sum + (r.alertsSent || 0), 0);
        const totalAlertsSkipped = successful.reduce((sum, r) => sum + (r.alertsSkipped || 0), 0);
        const avgDuration = successful.reduce((sum, r) => sum + (r.duration || 0), 0) / successful.length;
        
        const summary = {
            success: true,
            timestamp: new Date().toISOString(),
            farmsChecked: farms.length,
            farmsSuccessful: successful.length,
            farmsFailed: failed.length,
            alertsSent: totalAlertsSent,
            alertsSkipped: totalAlertsSkipped,
            avgProcessingTime: Math.round(avgDuration),
            totalDuration: Date.now() - startTime,
            errors: failed.length > 0 ? failed.map(f => ({ farmId: f.farmId, error: f.error })) : undefined
        };
        
        console.log(`[FarmWeatherMonitoring] Batch monitoring complete:`, JSON.stringify(summary, null, 2));
        
        return summary;
    } catch (error) {
        console.error('[FarmWeatherMonitoring] Batch monitoring failed:', error.message);
        return {
            success: false,
            error: error.message,
            duration: Date.now() - startTime
        };
    }
};

/**
 * Monitor weather for all farms of a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Monitoring result
 */
exports.monitorUserFarms = async (userId) => {
    const startTime = Date.now();
    
    try {
        const user = await User.findById(userId).select('_id firstName lastName email isActive');
        
        if (!user || !user.isActive) {
            return {
                success: false,
                userId,
                error: 'User not found or inactive',
                duration: Date.now() - startTime
            };
        }
        
        const farms = await Farm.find({ user: userId })
            .select('_id name location')
            .lean();
        
        if (farms.length === 0) {
            return {
                success: true,
                userId,
                message: 'No farms found for this user',
                farmsChecked: 0,
                duration: Date.now() - startTime
            };
        }
        
        // Add user object to each farm for monitoring
        const farmsWithUser = farms.map(f => ({ ...f, user }));
        
        const results = await Promise.all(
            farmsWithUser.map(farm => exports.monitorSingleFarm(farm))
        );
        
        const totalSent = results.reduce((sum, r) => sum + (r.alertsSent || 0), 0);
        const totalSkipped = results.reduce((sum, r) => sum + (r.alertsSkipped || 0), 0);
        
        return {
            success: true,
            userId,
            farmsChecked: farms.length,
            alertsSent: totalSent,
            alertsSkipped: totalSkipped,
            results,
            duration: Date.now() - startTime
        };
    } catch (error) {
        console.error(`[FarmWeatherMonitoring] Error monitoring user ${userId} farms:`, error.message);
        return {
            success: false,
            userId,
            error: error.message,
            duration: Date.now() - startTime
        };
    }
};

/**
 * Get monitoring statistics
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Statistics
 */
exports.getMonitoringStats = async (options = {}) => {
    const { hours = 24 } = options;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    try {
        const alerts = await WeatherAlert.find({ sentAt: { $gte: since } }).lean();
        
        const stats = {
            period: `Last ${hours} hours`,
            totalAlerts: alerts.length,
            byType: {},
            bySeverity: {},
            uniqueFarms: new Set(alerts.map(a => a.farm?.toString())).size,
            uniqueUsers: new Set(alerts.map(a => a.user.toString())).size
        };
        
        // Group by type
        alerts.forEach(alert => {
            stats.byType[alert.alertType] = (stats.byType[alert.alertType] || 0) + 1;
            stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
        });
        
        return stats;
    } catch (error) {
        console.error('[FarmWeatherMonitoring] Error getting stats:', error.message);
        return { error: error.message };
    }
};

module.exports = exports;
