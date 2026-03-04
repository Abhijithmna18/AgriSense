/**
 * server.integration.patch.js
 * 
 * Integration patch for farm weather monitoring system
 * 
 * INSTRUCTIONS:
 * 1. Open server.js
 * 2. Find the section that starts background jobs (around line 145)
 * 3. Add the highlighted lines below
 */

// BEFORE (Current code):
/*
if (require.main === module) {
    const PORT = process.env.PORT || 5000;

    // Start background jobs
    const { startWeatherCron } = require('./src/cron/weatherAlertsJob');
    startWeatherCron();

    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}
*/

// AFTER (Add these lines):
if (require.main === module) {
    const PORT = process.env.PORT || 5000;

    // Start background jobs
    const { startWeatherCron } = require('./src/cron/weatherAlertsJob');
    const { startFarmWeatherMonitoringCron } = require('./src/cron/farmWeatherMonitoringJob'); // ADD THIS LINE
    
    startWeatherCron(); // Legacy weather alerts
    startFarmWeatherMonitoringCron(); // ADD THIS LINE - New farm-specific monitoring

    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

/**
 * ALTERNATIVE: If you want to replace the old system entirely
 */

// Option 2: Replace old system (recommended after testing)
if (require.main === module) {
    const PORT = process.env.PORT || 5000;

    // Start background jobs
    // const { startWeatherCron } = require('./src/cron/weatherAlertsJob'); // COMMENT OUT OLD SYSTEM
    const { startFarmWeatherMonitoringCron } = require('./src/cron/farmWeatherMonitoringJob');
    
    // startWeatherCron(); // COMMENT OUT OLD SYSTEM
    startFarmWeatherMonitoringCron(); // New farm-specific monitoring

    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

/**
 * VERIFICATION:
 * 
 * After making changes, restart the server and look for this output:
 * 
 * ================================================================================
 * ⏰ FARM WEATHER MONITORING CRON JOB SCHEDULED
 * ================================================================================
 * Schedule: Every 6 hours (00:00, 06:00, 12:00, 18:00)
 * Cron Expression: 0 0,6,12,18 * * *
 * Next run: 2026-03-02T06:00:00.000Z
 * ================================================================================
 * 
 * If you see this, the integration is successful!
 */
