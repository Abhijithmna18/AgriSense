# Weather-Based Alert System Documentation

## Overview

The Weather-Based Alert System automatically monitors weather conditions for all registered farms and sends push notifications to farmers when adverse conditions are detected. The system uses the Open-Meteo API (free, no API key required) to fetch real-time weather data and 7-day forecasts.

## Features

### 1. Alert Types

The system monitors and alerts for the following conditions:

- **Frost Warning** (≤0°C or <5°C)
  - Critical for protecting sensitive crops
  - Cooldown: 12 hours

- **Heavy Rain** (>30mm or >10mm)
  - Helps farmers prepare drainage and delay operations
  - Cooldown: 6 hours

- **Extreme Heat** (>38°C or >33°C)
  - Alerts for irrigation needs
  - Cooldown: 12 hours

- **Drought Risk** (<5mm rainfall in 7 days + high temps)
  - Long-term planning alert
  - Cooldown: 24 hours

- **Strong Winds** (>12 m/s)
  - Prevents spray drift during pesticide application
  - Cooldown: 6 hours

- **High Humidity** (>85%)
  - Fungal disease risk warning
  - Cooldown: 24 hours

- **High UV Index** (>8)
  - Worker safety alert
  - Cooldown: 24 hours

### 2. Cooldown System

To prevent notification spam, the system implements intelligent cooldown periods:

- Each alert type has a specific cooldown period (6-24 hours)
- Duplicate alerts within the cooldown window are automatically skipped
- Cooldown tracking is stored in the `WeatherAlert` model
- Alerts automatically expire after their cooldown period

### 3. Multi-Source Weather Data

- **Current Weather**: Real-time conditions including temperature, humidity, rainfall, wind speed, UV index
- **7-Day Forecast**: Daily predictions for proactive planning
- **Forecast Analysis**: Detects upcoming adverse conditions (frost, heavy rain, extreme heat)

## API Endpoints

### GET /api/weather/current
Get current weather for a location.

**Query Parameters:**
- `city` (string): City name (e.g., "Pune")
- OR `lat` (number) & `lon` (number): Coordinates

**Response:**
```json
{
  "success": true,
  "data": {
    "city": "Pune",
    "temp": 28.5,
    "humidity": 65,
    "rain_1h": 0,
    "wind_speed": 5.2,
    "alerts": [...]
  }
}
```

### GET /api/weather/forecast
Get 7-day weather forecast.

**Query Parameters:**
- `city` (string): City name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-02-28",
      "temp_min": 18,
      "temp_max": 32,
      "rain_mm": 2.5,
      "description": "Partly cloudy"
    }
  ]
}
```

### GET /api/weather/analysis
Get comprehensive weather analysis with current and forecast alerts.

**Query Parameters:**
- `city` (string): City name
- OR `lat` (number) & `lon` (number): Coordinates

**Response:**
```json
{
  "success": true,
  "data": {
    "current": {...},
    "forecast": [...],
    "alerts": {
      "current": [...],
      "forecast": [...],
      "all": [...]
    }
  }
}
```

### GET /api/weather/farm/:farmId
Get weather data for a specific farm location.

**Response:**
```json
{
  "success": true,
  "farm": {
    "id": "...",
    "name": "My Farm"
  },
  "data": {
    "temp": 28.5,
    "alerts": [...]
  }
}
```

### POST /api/weather/check-farm/:farmId
Check weather conditions for a farm and send alerts if needed.

**Response:**
```json
{
  "success": true,
  "farm": {
    "id": "...",
    "name": "My Farm"
  },
  "alertsSent": 2,
  "alertsSkipped": 1,
  "details": {
    "sent": [...],
    "skipped": [...]
  }
}
```

### POST /api/weather/check-user-farms
Check weather for all farms of the logged-in user.

**Response:**
```json
{
  "success": true,
  "farmsChecked": 3,
  "results": [
    {
      "farmId": "...",
      "farmName": "Farm 1",
      "alertsSent": 1,
      "alertsSkipped": 0
    }
  ]
}
```

### POST /api/weather/check-all-farms (Admin Only)
Batch check weather for all active farmers.

**Response:**
```json
{
  "success": true,
  "farmersChecked": 150,
  "farmsChecked": 320,
  "alertsSent": 45,
  "alertsSkipped": 12
}
```

## Automated Monitoring

### Manual Execution

Run the monitoring script manually:

```bash
node scripts/run_weather_monitoring.js
```

This will:
1. Connect to MongoDB
2. Fetch all active farmers
3. Check weather for all their farms
4. Send alerts for adverse conditions
5. Display summary statistics

### Cron Job Setup

For automated monitoring, set up a cron job to run every 6 hours:

#### Linux/Mac (crontab)

```bash
# Edit crontab
crontab -e

# Add this line (runs at 6 AM, 12 PM, 6 PM, 12 AM)
0 6,12,18,0 * * * cd /path/to/farmer_ai-backend && node scripts/run_weather_monitoring.js >> logs/weather_monitoring.log 2>&1
```

#### Windows (Task Scheduler)

1. Open Task Scheduler
2. Create Basic Task
3. Name: "Weather Monitoring"
4. Trigger: Daily, repeat every 6 hours
5. Action: Start a program
   - Program: `node`
   - Arguments: `scripts/run_weather_monitoring.js`
   - Start in: `C:\path\to\farmer_ai-backend`

#### Node.js Cron (node-cron package)

Add to your `server.js`:

```javascript
const cron = require('node-cron');
const weatherMonitoringService = require('./src/services/weatherMonitoringService');

// Run every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled weather monitoring...');
  await weatherMonitoringService.scheduledMonitoring();
});
```

Install node-cron:
```bash
npm install node-cron
```

## Database Models

### WeatherAlert Model

Tracks sent alerts to implement cooldown logic:

```javascript
{
  user: ObjectId,           // User who received the alert
  farm: ObjectId,           // Farm associated with alert
  alertType: String,        // frost, heavy_rain, etc.
  severity: String,         // danger, warning, info
  message: String,          // Alert message
  weatherData: {
    temperature: Number,
    rainfall: Number,
    humidity: Number,
    windSpeed: Number,
    uvIndex: Number
  },
  location: {
    city: String,
    coordinates: [Number]
  },
  sentAt: Date,            // When alert was sent
  expiresAt: Date          // When cooldown expires
}
```

### Notification Model (Extended)

Added `weather_alert` type to existing notification system:

```javascript
{
  recipient: ObjectId,
  type: 'weather_alert',
  title: '🔴 Critical Weather Alert',
  message: 'Frost warning expected tonight...',
  isRead: Boolean,
  createdAt: Date
}
```

## Configuration

### Environment Variables

No API key required! The system uses Open-Meteo's free API.

Optional configuration in `.env`:

```env
# Weather monitoring settings (optional)
WEATHER_CHECK_INTERVAL=6h
WEATHER_ALERT_COOLDOWN_FROST=12
WEATHER_ALERT_COOLDOWN_RAIN=6
WEATHER_ALERT_COOLDOWN_HEAT=12
```

### Alert Thresholds

Current thresholds (can be customized in `weatherAPI.js`):

```javascript
const THRESHOLDS = {
  FROST_CRITICAL: 0,      // °C
  FROST_WARNING: 5,       // °C
  HEAT_CRITICAL: 38,      // °C
  HEAT_WARNING: 33,       // °C
  RAIN_HEAVY: 30,         // mm
  RAIN_MODERATE: 10,      // mm
  WIND_STRONG: 12,        // m/s
  HUMIDITY_HIGH: 85,      // %
  UV_HIGH: 8,             // index
  DROUGHT_RAIN: 5,        // mm in 7 days
  DROUGHT_TEMP: 35        // °C average
};
```

## Usage Examples

### Frontend Integration

```javascript
// Check weather for user's farms
const checkWeather = async () => {
  const response = await fetch('/api/weather/check-user-farms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  console.log(`Checked ${data.farmsChecked} farms, sent ${data.alertsSent} alerts`);
};

// Get weather analysis for a location
const getWeatherAnalysis = async (city) => {
  const response = await fetch(`/api/weather/analysis?city=${city}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data; // { current, forecast, alerts }
};
```

### Admin Dashboard

```javascript
// Trigger batch monitoring for all farmers
const runBatchMonitoring = async () => {
  const response = await fetch('/api/weather/check-all-farms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  const data = await response.json();
  console.log(`Monitored ${data.farmsChecked} farms for ${data.farmersChecked} farmers`);
};
```

## Testing

### Test Individual Farm

```bash
# Using curl
curl -X POST http://localhost:5002/api/weather/check-farm/FARM_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test User Farms

```bash
curl -X POST http://localhost:5002/api/weather/check-user-farms \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Batch Monitoring (Admin)

```bash
curl -X POST http://localhost:5002/api/weather/check-all-farms \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Monitoring & Logs

### Log Files

When running via cron, logs are saved to:
- `logs/weather_monitoring.log` - Monitoring execution logs
- `combined.log` - Application logs
- `error.log` - Error logs

### Monitoring Metrics

Track these metrics in your admin dashboard:
- Total alerts sent per day
- Alert types distribution
- Farms with most alerts
- Alert cooldown effectiveness
- API response times

## Troubleshooting

### No Alerts Being Sent

1. Check if farms have valid location data (coordinates or district/state)
2. Verify weather API is accessible: `GET /api/weather/current?city=Pune`
3. Check cooldown periods in `WeatherAlert` collection
4. Review logs for API errors

### Too Many Alerts

1. Adjust cooldown periods in `notificationService.js`
2. Increase alert thresholds in `weatherAPI.js`
3. Filter alert types (only send critical alerts)

### API Errors

1. Open-Meteo API is free and doesn't require authentication
2. Check internet connectivity
3. Verify city names are valid (use coordinates for accuracy)
4. Check API timeout settings (default: 10 seconds)

## Future Enhancements

- [ ] SMS alerts for critical conditions
- [ ] Email digest of weekly weather outlook
- [ ] Crop-specific alert customization
- [ ] Historical weather data analysis
- [ ] Integration with IoT sensors for micro-climate monitoring
- [ ] Machine learning for personalized alert thresholds
- [ ] Multi-language alert messages
- [ ] Weather-based farming recommendations

## Support

For issues or questions:
1. Check logs: `logs/weather_monitoring.log`
2. Review API responses: `GET /api/weather/analysis`
3. Verify database: Check `WeatherAlert` and `Notification` collections
4. Test manually: `node scripts/run_weather_monitoring.js`

## License

Part of the Farmer AI Backend system.
