# Farm Weather Monitoring System - Setup Guide

## Overview

Automated farm-specific weather monitoring system that checks weather conditions for all active farms every 6 hours and sends alerts based on threshold rules.

## Features

✅ **Automated Monitoring**: Runs every 6 hours (00:00, 06:00, 12:00, 18:00)  
✅ **Farm-Specific Alerts**: Each farm gets personalized weather alerts  
✅ **Threshold-Based Rules**: 8 different alert types with configurable thresholds  
✅ **Cooldown Prevention**: Prevents duplicate alerts within 24 hours  
✅ **Batch Processing**: Efficient processing with rate limit protection  
✅ **Comprehensive Logging**: Detailed logs and metrics  
✅ **Error Handling**: Graceful error handling with retry logic  

## Alert Rules

| Alert Type | Threshold | Severity | Cooldown |
|------------|-----------|----------|----------|
| **frost** | Temperature ≤ 0°C | danger | 12 hours |
| **cold_stress** | 0°C < Temperature < 15°C | warning | 12 hours |
| **heat_stress** | Temperature > 35°C | warning | 12 hours |
| **extreme_heat** | Temperature > 40°C | danger | 12 hours |
| **heavy_rain** | Rainfall > 50mm | danger | 6 hours |
| **moderate_rain** | 25mm < Rainfall ≤ 50mm | warning | 6 hours |
| **strong_wind** | Wind speed > 12 m/s | warning | 6 hours |
| **high_humidity** | Humidity > 85% | info | 24 hours |
| **high_uv** | UV index > 8 | info | 24 hours |
| **drought_risk** | Rainfall < 5mm for 5 days | warning | 24 hours |

## Installation

### Step 1: Create Database Indexes

Run the index creation script to optimize query performance:

```bash
cd farmer_ai-backend
node src/scripts/createWeatherMonitoringIndexes.js
```

Expected output:
```
✅ Connected to MongoDB
📍 Creating Farm indexes...
  ✓ Geospatial index on location.coordinates
  ✓ Compound index on user + location.coordinates
  ✓ Index on user field
🌦️  Creating WeatherAlert indexes...
  ✓ Compound index on user + alertType + sentAt
  ...
✅ All indexes created successfully!
```

### Step 2: Update server.js

Add the new cron job to your server.js file. Find this section:

```javascript
if (require.main === module) {
    const PORT = process.env.PORT || 5000;

    // Start background jobs
    const { startWeatherCron } = require('./src/cron/weatherAlertsJob');
    startWeatherCron();

    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}
```

Replace with:

```javascript
if (require.main === module) {
    const PORT = process.env.PORT || 5000;

    // Start background jobs
    const { startWeatherCron } = require('./src/cron/weatherAlertsJob');
    const { startFarmWeatherMonitoringCron } = require('./src/cron/farmWeatherMonitoringJob');
    
    startWeatherCron(); // Legacy weather alerts
    startFarmWeatherMonitoringCron(); // New farm-specific monitoring

    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}
```

### Step 3: Restart Server

```bash
npm start
```

You should see:
```
⏰ FARM WEATHER MONITORING CRON JOB SCHEDULED
Schedule: Every 6 hours (00:00, 06:00, 12:00, 18:00)
Cron Expression: 0 0,6,12,18 * * *
Next run: 2026-03-02T06:00:00.000Z
```

## Testing

### Test Single Farm

```bash
# List available farms
node src/scripts/testWeatherMonitoring.js list

# Test specific farm
node src/scripts/testWeatherMonitoring.js single <farmId>
```

### Test User Farms

```bash
node src/scripts/testWeatherMonitoring.js user <userId>
```

### Test Batch Monitoring

```bash
# Test with all farms
node src/scripts/testWeatherMonitoring.js batch

# Test with limit
node src/scripts/testWeatherMonitoring.js batch 5
```

### Get Statistics

```bash
# Last 24 hours
node src/scripts/testWeatherMonitoring.js stats

# Last 6 hours
node src/scripts/testWeatherMonitoring.js stats 6
```

### Manual Trigger

You can manually trigger the monitoring job:

```javascript
const { runNow } = require('./src/cron/farmWeatherMonitoringJob');

// In your code or REPL
runNow().then(result => {
    console.log('Monitoring complete:', result);
});
```

## API Integration

### Monitor Specific Farm

```javascript
const farmWeatherMonitoringService = require('./src/services/farmWeatherMonitoringService');

// Monitor single farm
const result = await farmWeatherMonitoringService.monitorSingleFarm(farm);

// Monitor all farms of a user
const result = await farmWeatherMonitoringService.monitorUserFarms(userId);

// Monitor all farms (batch)
const result = await farmWeatherMonitoringService.monitorAllFarms({
    limit: 100,
    batchSize: 10,
    delayBetweenBatches: 1000
});
```

### Get Statistics

```javascript
const stats = await farmWeatherMonitoringService.getMonitoringStats({
    hours: 24
});

console.log(`Total alerts: ${stats.totalAlerts}`);
console.log(`Unique farms: ${stats.uniqueFarms}`);
console.log(`By type:`, stats.byType);
```

## Database Schema

### WeatherAlert Model

```javascript
{
    user: ObjectId,              // User who owns the farm
    farm: ObjectId,              // Farm being monitored
    alertType: String,           // frost, heavy_rain, etc.
    severity: String,            // info, warning, danger
    message: String,             // Alert message
    weatherData: {
        temperature: Number,
        rainfall: Number,
        humidity: Number,
        windSpeed: Number,
        uvIndex: Number
    },
    location: {
        city: String,
        coordinates: [Number]    // [longitude, latitude]
    },
    sentAt: Date,                // When alert was sent
    expiresAt: Date              // When cooldown expires
}
```

### Indexes

```javascript
// Cooldown check (most important)
{ user: 1, alertType: 1, sentAt: -1 }

// Farm history
{ farm: 1, sentAt: -1 }

// Statistics
{ alertType: 1, sentAt: -1 }

// TTL (auto-delete after 30 days)
{ sentAt: 1 } with expireAfterSeconds: 2592000
```

## Performance Optimization

### Batch Processing

The system processes farms in batches to avoid API rate limits:

```javascript
{
    batchSize: 10,              // Process 10 farms at a time
    delayBetweenBatches: 1000   // 1 second delay between batches
}
```

### Caching

Weather data is cached in the WeatherCache model (if implemented) to reduce API calls.

### Query Optimization

All queries use compound indexes for optimal performance:
- Farm lookup: `{ user: 1, 'location.coordinates': 1 }`
- Cooldown check: `{ user: 1, alertType: 1, sentAt: -1 }`
- Statistics: `{ alertType: 1, sentAt: -1 }`

## Monitoring & Logs

### Cron Job Logs

```
🌦️  FARM WEATHER MONITORING JOB STARTED
⏰  Time: 2026-03-02T06:00:00.000Z
================================================================================

📊 MONITORING JOB RESULTS:
--------------------------------------------------------------------------------
✅ Farms Checked: 150
✅ Successful: 148
❌ Failed: 2
📨 Alerts Sent: 45
⏭️  Alerts Skipped (cooldown): 12
⏱️  Avg Processing Time: 234ms
⏱️  Total Duration: 35678ms

📈 ALERT STATISTICS (Last 6 hours):
--------------------------------------------------------------------------------
Total Alerts: 45
Unique Farms: 38
Unique Users: 35

By Alert Type:
  heat_stress: 18
  high_humidity: 12
  heavy_rain: 8
  drought_risk: 7

By Severity:
  warning: 33
  danger: 8
  info: 4
```

### Error Handling

Errors are logged but don't stop the batch process:

```javascript
{
    success: false,
    farmId: '507f1f77bcf86cd799439011',
    error: 'Weather API timeout',
    duration: 5000
}
```

## Customization

### Modify Alert Thresholds

Edit `farmer_ai-backend/src/services/farmWeatherMonitoringService.js`:

```javascript
const ALERT_RULES = {
    heat_stress: {
        check: (weather) => weather.temp > 35,  // Change threshold here
        severity: 'warning',
        message: (weather, farm) => `Heat alert...`,
        cooldownHours: 12  // Change cooldown here
    }
};
```

### Add New Alert Type

```javascript
const ALERT_RULES = {
    // ... existing rules
    
    low_soil_moisture: {
        check: (weather) => {
            // Your custom logic
            return weather.humidity < 30 && weather.temp > 35;
        },
        severity: 'warning',
        message: (weather, farm) => 
            `Low soil moisture risk at ${farm.name}. Consider irrigation.`,
        cooldownHours: 24
    }
};
```

### Change Cron Schedule

Edit `farmer_ai-backend/src/cron/farmWeatherMonitoringJob.js`:

```javascript
// Current: Every 6 hours (00:00, 06:00, 12:00, 18:00)
const cronExpression = '0 0,6,12,18 * * *';

// Every 3 hours
const cronExpression = '0 */3 * * *';

// Every day at 6 AM
const cronExpression = '0 6 * * *';

// Every hour
const cronExpression = '0 * * * *';
```

## Troubleshooting

### No Alerts Being Sent

1. Check if farms have valid coordinates:
```javascript
db.farms.find({ 'location.coordinates': { $exists: false } })
```

2. Check if users are active:
```javascript
db.users.find({ isActive: false })
```

3. Check cooldown status:
```javascript
db.weatheralerts.find({ 
    user: ObjectId('...'),
    sentAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
})
```

### Weather API Errors

Check Open-Meteo API status:
```bash
curl "https://api.open-meteo.com/v1/forecast?latitude=10.8505&longitude=76.2711&current=temperature_2m"
```

### Performance Issues

1. Verify indexes are created:
```javascript
db.farms.getIndexes()
db.weatheralerts.getIndexes()
```

2. Reduce batch size:
```javascript
monitorAllFarms({ batchSize: 5, delayBetweenBatches: 2000 })
```

3. Add limit for testing:
```javascript
monitorAllFarms({ limit: 10 })
```

## Migration from Old System

If you're migrating from the old `weatherAlertsJob.js`:

1. Both systems can run in parallel
2. New system is farm-specific (more accurate)
3. Old system can be disabled after testing:

```javascript
// Comment out in server.js
// startWeatherCron();
```

## Production Checklist

- [ ] Database indexes created
- [ ] Cron job integrated in server.js
- [ ] Tested with sample farms
- [ ] Verified alert delivery
- [ ] Checked logs for errors
- [ ] Monitored API rate limits
- [ ] Set up error alerting (optional)
- [ ] Documented custom thresholds

## Support

For issues or questions:
1. Check logs in console
2. Run test scripts
3. Verify database indexes
4. Check Open-Meteo API status

## License

Part of AgriSense Platform - MIT License
