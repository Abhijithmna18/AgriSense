/**
 * Manual Weather Monitoring Script
 * Run this script to manually trigger weather monitoring for all farms
 * Usage: node scripts/run_weather_monitoring.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const weatherMonitoringService = require('../src/services/weatherMonitoringService');

const runMonitoring = async () => {
    try {
        console.log('='.repeat(60));
        console.log('Weather Monitoring Script Started');
        console.log('='.repeat(60));
        console.log('Timestamp:', new Date().toISOString());
        console.log('');

        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✓ MongoDB connected');
        console.log('');

        // Run monitoring
        console.log('Starting weather monitoring for all farms...');
        const result = await weatherMonitoringService.monitorAllFarms({ skipErrors: true });

        console.log('');
        console.log('='.repeat(60));
        console.log('Monitoring Complete');
        console.log('='.repeat(60));
        console.log('Farmers checked:', result.farmersChecked);
        console.log('Farms checked:', result.farmsChecked);
        console.log('Alerts sent:', result.alertsSent);
        console.log('Alerts skipped (cooldown):', result.alertsSkipped);
        
        if (result.errors && result.errors.length > 0) {
            console.log('Errors encountered:', result.errors.length);
            console.log('Error details:', JSON.stringify(result.errors, null, 2));
        }

        console.log('');
        console.log('Script completed successfully');
        
        // Disconnect
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('');
        console.error('='.repeat(60));
        console.error('ERROR: Weather monitoring failed');
        console.error('='.repeat(60));
        console.error(error);
        
        await mongoose.disconnect();
        process.exit(1);
    }
};

runMonitoring();
