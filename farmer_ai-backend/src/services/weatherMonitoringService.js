/**
 * weatherMonitoringService.js
 * Automated weather monitoring service for proactive farmer alerts
 * Can be triggered by cron jobs or scheduled tasks
 */
const weatherAPI = require('./weatherAPI');
const notificationService = require('./notificationService');
const Farm = require('../models/Farm');
const User = require('../models/User');

/**
 * Monitor weather for a specific farm and send alerts if needed
 * @param {string} farmId - Farm ID
 * @returns {Object} - Monitoring result
 */
exports.monitorFarm = async (farmId) => {
    try {
        const farm = await Farm.findById(farmId).populate('user', '_id firstName lastName');
        if (!farm) {
            return { success: false, error: 'Farm not found' };
        }

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
                sentAlerts.push(alert);
            } else {
                skippedAlerts.push({ alert, reason: result.reason });
            }
        }

        return {
            success: true,
            farmId: farm._id,
            farmName: farm.name,
            alertsSent: sentAlerts.length,
            alertsSkipped: skippedAlerts.length,
            details: { sent: sentAlerts, skipped: skippedAlerts }
        };
    } catch (error) {
        console.error(`[WeatherMonitoring] Error monitoring farm ${farmId}:`, error.message);
        return { success: false, farmId, error: error.message };
    }
};

/**
 * Monitor weather for all farms of a specific user
 * @param {string} userId - User ID
 * @returns {Object} - Monitoring result
 */
exports.monitorUserFarms = async (userId) => {
    try {
        const farms = await Farm.find({ user: userId }).select('_id name location');

        if (farms.length === 0) {
            return {
                success: true,
                message: 'No farms found for this user',
                farmsChecked: 0
            };
        }

        const results = [];

        for (const farm of farms) {
            const result = await exports.monitorFarm(farm._id);
            results.push(result);
        }

        const totalSent = results.reduce((sum, r) => sum + (r.alertsSent || 0), 0);
        const totalSkipped = results.reduce((sum, r) => sum + (r.alertsSkipped || 0), 0);

        return {
            success: true,
            userId,
            farmsChecked: farms.length,
            totalAlertsSent: totalSent,
            totalAlertsSkipped: totalSkipped,
            results
        };
    } catch (error) {
        console.error(`[WeatherMonitoring] Error monitoring user ${userId} farms:`, error.message);
        return { success: false, userId, error: error.message };
    }
};

/**
 * Monitor weather for all active farmers (batch operation)
 * @param {Object} options - Monitoring options
 * @returns {Object} - Batch monitoring result
 */
exports.monitorAllFarms = async (options = {}) => {
    const { limit = null, skipErrors = true } = options;
    
    try {
        console.log('[WeatherMonitoring] Starting batch weather monitoring for all farms...');
        
        const query = { roles: 'farmer', isActive: true };
        const farmers = limit 
            ? await User.find(query).select('_id firstName lastName').limit(limit)
            : await User.find(query).select('_id firstName lastName');

        if (farmers.length === 0) {
            return {
                success: true,
                message: 'No active farmers found',
                farmersChecked: 0
            };
        }

        console.log(`[WeatherMonitoring] Found ${farmers.length} active farmers to monitor`);

        let totalFarmsChecked = 0;
        let totalAlertsSent = 0;
        let totalAlertsSkipped = 0;
        const errors = [];

        for (const farmer of farmers) {
            try {
                const result = await exports.monitorUserFarms(farmer._id);
                
                if (result.success) {
                    totalFarmsChecked += result.farmsChecked;
                    totalAlertsSent += result.totalAlertsSent;
                    totalAlertsSkipped += result.totalAlertsSkipped;
                } else if (!skipErrors) {
                    errors.push({ userId: farmer._id, error: result.error });
                }
            } catch (error) {
                console.error(`[WeatherMonitoring] Error monitoring farmer ${farmer._id}:`, error.message);
                if (!skipErrors) {
                    errors.push({ userId: farmer._id, error: error.message });
                }
            }
        }

        console.log(`[WeatherMonitoring] Batch monitoring complete. Farms: ${totalFarmsChecked}, Alerts sent: ${totalAlertsSent}, Skipped: ${totalAlertsSkipped}`);

        return {
            success: true,
            farmersChecked: farmers.length,
            farmsChecked: totalFarmsChecked,
            alertsSent: totalAlertsSent,
            alertsSkipped: totalAlertsSkipped,
            errors: errors.length > 0 ? errors : undefined,
            timestamp: new Date()
        };
    } catch (error) {
        console.error('[WeatherMonitoring] Batch monitoring failed:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Schedule weather monitoring (to be called by cron job)
 * Recommended: Run every 6 hours
 */
exports.scheduledMonitoring = async () => {
    console.log('[WeatherMonitoring] Scheduled monitoring triggered at', new Date().toISOString());
    const result = await exports.monitorAllFarms({ skipErrors: true });
    console.log('[WeatherMonitoring] Scheduled monitoring result:', JSON.stringify(result, null, 2));
    return result;
};

module.exports = exports;
