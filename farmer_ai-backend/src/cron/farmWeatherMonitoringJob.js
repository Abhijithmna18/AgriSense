/**
 * farmWeatherMonitoringJob.js
 * 
 * Automated cron job for farm-specific weather monitoring
 * 
 * Schedule: Every 6 hours (00:00, 06:00, 12:00, 18:00)
 * 
 * Features:
 * - Monitors all active farms with location data
 * - Applies threshold-based alert rules
 * - Prevents duplicate alerts within cooldown period
 * - Comprehensive error handling and logging
 * - Performance metrics tracking
 */

const cron = require('node-cron');
const farmWeatherMonitoringService = require('../services/farmWeatherMonitoringService');

/**
 * Main monitoring job function
 */
const runMonitoringJob = async () => {
    const jobStartTime = Date.now();
    console.log('\n' + '='.repeat(80));
    console.log(`🌦️  FARM WEATHER MONITORING JOB STARTED`);
    console.log(`⏰  Time: ${new Date().toISOString()}`);
    console.log('='.repeat(80) + '\n');
    
    try {
        // Run batch monitoring with optimized settings
        const result = await farmWeatherMonitoringService.monitorAllFarms({
            batchSize: 10,           // Process 10 farms at a time
            delayBetweenBatches: 1000 // 1 second delay between batches
        });
        
        // Log results
        console.log('\n' + '-'.repeat(80));
        console.log('📊 MONITORING JOB RESULTS:');
        console.log('-'.repeat(80));
        console.log(`✅ Farms Checked: ${result.farmsChecked}`);
        console.log(`✅ Successful: ${result.farmsSuccessful}`);
        console.log(`❌ Failed: ${result.farmsFailed}`);
        console.log(`📨 Alerts Sent: ${result.alertsSent}`);
        console.log(`⏭️  Alerts Skipped (cooldown): ${result.alertsSkipped}`);
        console.log(`⏱️  Avg Processing Time: ${result.avgProcessingTime}ms`);
        console.log(`⏱️  Total Duration: ${result.totalDuration}ms`);
        
        if (result.errors && result.errors.length > 0) {
            console.log(`\n⚠️  ERRORS (${result.errors.length}):`);
            result.errors.slice(0, 5).forEach(err => {
                console.log(`   - Farm ${err.farmId}: ${err.error}`);
            });
            if (result.errors.length > 5) {
                console.log(`   ... and ${result.errors.length - 5} more errors`);
            }
        }
        
        console.log('-'.repeat(80) + '\n');
        
        // Get monitoring statistics
        const stats = await farmWeatherMonitoringService.getMonitoringStats({ hours: 6 });
        if (!stats.error) {
            console.log('📈 ALERT STATISTICS (Last 6 hours):');
            console.log('-'.repeat(80));
            console.log(`Total Alerts: ${stats.totalAlerts}`);
            console.log(`Unique Farms: ${stats.uniqueFarms}`);
            console.log(`Unique Users: ${stats.uniqueUsers}`);
            
            if (Object.keys(stats.byType).length > 0) {
                console.log('\nBy Alert Type:');
                Object.entries(stats.byType)
                    .sort((a, b) => b[1] - a[1])
                    .forEach(([type, count]) => {
                        console.log(`  ${type}: ${count}`);
                    });
            }
            
            if (Object.keys(stats.bySeverity).length > 0) {
                console.log('\nBy Severity:');
                Object.entries(stats.bySeverity)
                    .sort((a, b) => b[1] - a[1])
                    .forEach(([severity, count]) => {
                        console.log(`  ${severity}: ${count}`);
                    });
            }
            console.log('-'.repeat(80) + '\n');
        }
        
        const jobDuration = Date.now() - jobStartTime;
        console.log('='.repeat(80));
        console.log(`✅ FARM WEATHER MONITORING JOB COMPLETED`);
        console.log(`⏱️  Total Job Duration: ${jobDuration}ms (${(jobDuration / 1000).toFixed(2)}s)`);
        console.log('='.repeat(80) + '\n');
        
        return result;
    } catch (error) {
        console.error('\n' + '='.repeat(80));
        console.error('❌ FARM WEATHER MONITORING JOB FAILED');
        console.error('='.repeat(80));
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        console.error('='.repeat(80) + '\n');
        
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

/**
 * Start the cron job
 * Schedule: Every 6 hours at 00:00, 06:00, 12:00, 18:00
 */
const startFarmWeatherMonitoringCron = () => {
    // Cron expression: "0 */6 * * *" = Every 6 hours at minute 0
    // Alternative: "0 0,6,12,18 * * *" = At 00:00, 06:00, 12:00, 18:00
    
    const cronExpression = '0 0,6,12,18 * * *';
    
    cron.schedule(cronExpression, async () => {
        await runMonitoringJob();
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('⏰ FARM WEATHER MONITORING CRON JOB SCHEDULED');
    console.log('='.repeat(80));
    console.log(`Schedule: Every 6 hours (00:00, 06:00, 12:00, 18:00)`);
    console.log(`Cron Expression: ${cronExpression}`);
    console.log(`Next run: ${getNextRunTime()}`);
    console.log('='.repeat(80) + '\n');
};

/**
 * Get next scheduled run time
 * @returns {string} - Next run time
 */
const getNextRunTime = () => {
    const now = new Date();
    const hours = [0, 6, 12, 18];
    const currentHour = now.getHours();
    
    // Find next run hour
    let nextHour = hours.find(h => h > currentHour);
    
    if (!nextHour) {
        // Next run is tomorrow at 00:00
        nextHour = 0;
        now.setDate(now.getDate() + 1);
    }
    
    now.setHours(nextHour, 0, 0, 0);
    return now.toISOString();
};

/**
 * Run monitoring job immediately (for testing)
 */
const runNow = async () => {
    console.log('🚀 Running farm weather monitoring job immediately...\n');
    return await runMonitoringJob();
};

module.exports = {
    startFarmWeatherMonitoringCron,
    runMonitoringJob,
    runNow
};
