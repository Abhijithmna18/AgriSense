const cron = require('node-cron');
const Farm = require('../models/Farm');
const weatherAPI = require('../services/weatherAPI');
const { sendWeatherAlert } = require('../services/notificationService');

/**
 * Weather Alerts Cron Job
 * 
 * Runs every day at 06:00 AM (or more frequently depending on testing).
 * Fetches the registered farms, checks the weather, and generates
 * push notifications if dangerous or warning-level conditions exist.
 */
const checkWeatherAndSendAlerts = async () => {
    console.log(`[${new Date().toISOString()}] 🌦️ Running Weather Alerts Cron Job...`);

    try {
        // Fetch all farms with owner references
        const farms = await Farm.find().populate('owner', '_id name');

        if (!farms || farms.length === 0) {
            console.log('[WeatherCron] No farms found to check.');
            return;
        }

        let alertsSent = 0;

        for (const farm of farms) {
            // Ensure owner and location exist
            if (!farm.owner || !farm.location || (!farm.location.coordinates && !farm.location.city)) {
                continue;
            }

            try {
                let weather;
                // Prefer coordinates for higher accuracy
                if (farm.location.coordinates && farm.location.coordinates.length === 2) {
                    const [lon, lat] = farm.location.coordinates;
                    weather = await weatherAPI.getCurrentWeatherByCoords(lat, lon);
                } else {
                    const city = `${farm.location.district || farm.location.city}, ${farm.location.state}`;
                    weather = await weatherAPI.getCurrentWeatherByCity(city);
                }

                // Generate alerts based on thresholds
                const alerts = weatherAPI.generateWeatherAlerts(weather);

                // Filter out 'success' or 'info' messages to avoid spamming
                const actionableAlerts = alerts.filter(a => a.type === 'danger' || a.type === 'warning');

                for (const alert of actionableAlerts) {
                    await sendWeatherAlert(
                        farm.owner._id,
                        `Farm "${farm.name}": ${alert.message}`,
                        alert.type
                    );
                    alertsSent++;
                }

            } catch (farmError) {
                console.error(`[WeatherCron] Error checking weather for farm ${farm.name}:`, farmError.message);
                // Continue with next farm even if one fails
            }
        }

        console.log(`[WeatherCron] Finished. Sent ${alertsSent} weather alerts.`);

    } catch (error) {
        console.error('[WeatherCron] Critical Error:', error);
    }
};

// Start the cron sequence
// "0 6,18 * * *" -> Runs at 6 AM and 6 PM every day.
const startWeatherCron = () => {
    cron.schedule('0 6,18 * * *', checkWeatherAndSendAlerts);
    console.log('⏰ Weather Alerts Cron Job scheduled for 06:00 and 18:00 daily.');
};

module.exports = {
    startWeatherCron,
    checkWeatherAndSendAlerts // Exported for manual testing
};
