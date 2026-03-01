/**
 * Test Weather Alert System
 * Quick test script to verify weather alert functionality
 * Usage: node scripts/test_weather_alerts.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const weatherAPI = require('../src/services/weatherAPI');
const notificationService = require('../src/services/notificationService');

const testWeatherAlerts = async () => {
    try {
        console.log('='.repeat(60));
        console.log('Weather Alert System Test');
        console.log('='.repeat(60));
        console.log('');

        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✓ MongoDB connected');
        console.log('');

        // Test 1: Fetch current weather
        console.log('Test 1: Fetching current weather for Pune...');
        const currentWeather = await weatherAPI.getCurrentWeatherByCity('Pune');
        console.log('✓ Current weather:', {
            city: currentWeather.city,
            temp: currentWeather.temp,
            humidity: currentWeather.humidity,
            rain: currentWeather.rain_1h,
            wind: currentWeather.wind_speed
        });
        console.log('');

        // Test 2: Generate alerts
        console.log('Test 2: Generating weather alerts...');
        const alerts = weatherAPI.generateWeatherAlerts(currentWeather);
        console.log(`✓ Generated ${alerts.length} alerts:`);
        alerts.forEach((alert, i) => {
            console.log(`  ${i + 1}. [${alert.type.toUpperCase()}] ${alert.message}`);
        });
        console.log('');

        // Test 3: Fetch forecast
        console.log('Test 3: Fetching 7-day forecast...');
        const forecast = await weatherAPI.getForecastByCity('Pune');
        console.log(`✓ Forecast retrieved for ${forecast.length} days`);
        forecast.slice(0, 3).forEach((day, i) => {
            console.log(`  Day ${i + 1} (${day.date}): ${day.temp_min}°C - ${day.temp_max}°C, Rain: ${day.rain_mm}mm`);
        });
        console.log('');

        // Test 4: Analyze forecast alerts
        console.log('Test 4: Analyzing forecast for alerts...');
        const forecastAlerts = weatherAPI.analyzeForecastAlerts(forecast);
        console.log(`✓ Found ${forecastAlerts.length} forecast alerts:`);
        forecastAlerts.forEach((alert, i) => {
            console.log(`  ${i + 1}. [${alert.type.toUpperCase()}] ${alert.message}`);
        });
        console.log('');

        // Test 5: Complete weather analysis
        console.log('Test 5: Getting complete weather analysis...');
        const analysis = await weatherAPI.getWeatherAnalysis('Pune');
        console.log('✓ Analysis complete:');
        console.log(`  Current alerts: ${analysis.alerts.current.length}`);
        console.log(`  Forecast alerts: ${analysis.alerts.forecast.length}`);
        console.log(`  Total alerts: ${analysis.alerts.all.length}`);
        console.log('');

        // Test 6: Test notification cooldown (requires a user ID)
        console.log('Test 6: Testing notification cooldown system...');
        const User = require('../models/User');
        const testUser = await User.findOne({ roles: 'farmer' });
        
        if (testUser) {
            console.log(`✓ Found test user: ${testUser.firstName} ${testUser.lastName}`);
            
            // Send first alert
            const result1 = await notificationService.sendWeatherAlert(
                testUser._id,
                'Test alert: High temperatures expected',
                'warning',
                'extreme_heat',
                currentWeather,
                { city: 'Pune', coordinates: [] }
            );
            console.log(`  First alert: ${result1.sent ? 'SENT' : 'SKIPPED'} - ${result1.reason}`);
            
            // Try to send duplicate alert (should be skipped due to cooldown)
            const result2 = await notificationService.sendWeatherAlert(
                testUser._id,
                'Test alert: High temperatures expected',
                'warning',
                'extreme_heat',
                currentWeather,
                { city: 'Pune', coordinates: [] }
            );
            console.log(`  Duplicate alert: ${result2.sent ? 'SENT' : 'SKIPPED'} - ${result2.reason}`);
            
            if (!result2.sent) {
                console.log('  ✓ Cooldown system working correctly!');
            }
        } else {
            console.log('  ⚠ No farmer users found in database. Skipping cooldown test.');
        }
        console.log('');

        // Test 7: Test coordinates-based weather
        console.log('Test 7: Testing coordinates-based weather...');
        const coordWeather = await weatherAPI.getCurrentWeatherByCoords(18.5204, 73.8567); // Pune coords
        console.log('✓ Weather by coordinates:', {
            temp: coordWeather.temp,
            description: coordWeather.description
        });
        console.log('');

        console.log('='.repeat(60));
        console.log('All Tests Completed Successfully! ✓');
        console.log('='.repeat(60));
        console.log('');
        console.log('Next steps:');
        console.log('1. Test with your farms: POST /api/weather/check-user-farms');
        console.log('2. Set up cron job: See WEATHER_ALERT_SYSTEM.md');
        console.log('3. Monitor alerts in the Notifications collection');
        console.log('');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('');
        console.error('='.repeat(60));
        console.error('TEST FAILED');
        console.error('='.repeat(60));
        console.error(error);
        
        await mongoose.disconnect();
        process.exit(1);
    }
};

testWeatherAlerts();
