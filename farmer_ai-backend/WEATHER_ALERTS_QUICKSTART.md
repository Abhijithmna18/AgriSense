# Weather Alert System - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Test the System

Run the test script to verify everything works:

```bash
cd farmer_ai-backend
node scripts/test_weather_alerts.js
```

This will:
- ✓ Connect to your database
- ✓ Fetch real weather data for Pune
- ✓ Generate alerts based on conditions
- ✓ Test the cooldown system
- ✓ Verify all components are working

### 2. Test with Your Farms

Use the API endpoints to check weather for your farms:

```bash
# Check all your farms (requires authentication)
curl -X POST http://localhost:5002/api/weather/check-user-farms \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Set Up Automated Monitoring

#### Option A: Manual Cron Job (Recommended)

```bash
# Run every 6 hours
crontab -e

# Add this line:
0 */6 * * * cd /path/to/farmer_ai-backend && node scripts/run_weather_monitoring.js >> logs/weather.log 2>&1
```

#### Option B: Node.js Scheduler

Install node-cron:
```bash
npm install node-cron
```

Add to `server.js`:
```javascript
const cron = require('node-cron');
const weatherMonitoring = require('./src/services/weatherMonitoringService');

// Run every 6 hours
cron.schedule('0 */6 * * *', async () => {
  await weatherMonitoring.scheduledMonitoring();
});
```

## 📋 API Endpoints

### For Farmers

```javascript
// Get current weather
GET /api/weather/current?city=Pune

// Get 7-day forecast
GET /api/weather/forecast?city=Pune

// Get weather analysis (current + forecast + alerts)
GET /api/weather/analysis?city=Pune

// Get weather for specific farm
GET /api/weather/farm/:farmId

// Check weather and send alerts for your farms
POST /api/weather/check-user-farms
```

### For Admins

```javascript
// Batch check all farms (for cron jobs)
POST /api/weather/check-all-farms
```

## 🔔 Alert Types

| Alert Type | Trigger | Cooldown | Severity |
|------------|---------|----------|----------|
| Frost | ≤0°C or <5°C | 12 hours | Danger |
| Heavy Rain | >30mm or >10mm | 6 hours | Danger/Warning |
| Extreme Heat | >38°C or >33°C | 12 hours | Danger/Warning |
| Drought Risk | <5mm in 7 days + high temp | 24 hours | Warning |
| Strong Wind | >12 m/s | 6 hours | Warning |
| High Humidity | >85% | 24 hours | Info |
| High UV | >8 index | 24 hours | Info |

## 🧪 Testing

### Test Individual Components

```bash
# Test weather API
node -e "
const weatherAPI = require('./src/services/weatherAPI');
weatherAPI.getCurrentWeatherByCity('Pune').then(console.log);
"

# Test monitoring service
node scripts/run_weather_monitoring.js

# Test with specific farm
curl -X POST http://localhost:5002/api/weather/check-farm/FARM_ID \
  -H "Authorization: Bearer TOKEN"
```

### Check Sent Alerts

```javascript
// In MongoDB shell or Compass
db.notifications.find({ type: 'weather_alert' }).sort({ createdAt: -1 })

// Check cooldown tracking
db.weatheralerts.find().sort({ sentAt: -1 })
```

## 📊 Monitoring

### View Logs

```bash
# Real-time monitoring
tail -f logs/weather_monitoring.log

# Check for errors
grep ERROR logs/weather_monitoring.log
```

### Database Queries

```javascript
// Count alerts sent today
db.notifications.countDocuments({
  type: 'weather_alert',
  createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
})

// Most common alert types
db.weatheralerts.aggregate([
  { $group: { _id: '$alertType', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

## 🔧 Configuration

### Customize Alert Thresholds

Edit `farmer_ai-backend/src/services/weatherAPI.js`:

```javascript
// Line ~120 - Adjust these values
if (weather.temp > 38) { // Change 38 to your threshold
  alerts.push({ type: 'danger', ... });
}
```

### Customize Cooldown Periods

Edit `farmer_ai-backend/src/services/notificationService.js`:

```javascript
// Line ~90 - Adjust cooldown hours
const COOLDOWN_PERIODS = {
  frost: 12,        // Change to 6, 12, 24, etc.
  heavy_rain: 6,
  extreme_heat: 12,
  // ...
};
```

## 🐛 Troubleshooting

### No Alerts Being Sent?

1. **Check farm locations:**
   ```javascript
   db.farms.find({}, { name: 1, location: 1 })
   ```
   Ensure farms have valid coordinates or district/state.

2. **Test weather API:**
   ```bash
   curl http://localhost:5002/api/weather/current?city=Pune
   ```

3. **Check cooldown:**
   ```javascript
   db.weatheralerts.find({ user: ObjectId('USER_ID') }).sort({ sentAt: -1 })
   ```

### Too Many Alerts?

1. Increase cooldown periods (see Configuration above)
2. Adjust alert thresholds to be less sensitive
3. Filter to only critical alerts (danger level)

### API Errors?

1. Check internet connectivity
2. Verify Open-Meteo API is accessible: https://api.open-meteo.com/v1/forecast?latitude=18.5&longitude=73.8&current=temperature_2m
3. Check timeout settings (default: 10 seconds)

## 📱 Frontend Integration Example

```javascript
// React component example
const WeatherAlerts = () => {
  const [alerts, setAlerts] = useState([]);

  const checkWeather = async () => {
    const response = await fetch('/api/weather/check-user-farms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    
    if (data.success) {
      toast.success(`Checked ${data.farmsChecked} farms`);
    }
  };

  const getAnalysis = async (city) => {
    const response = await fetch(`/api/weather/analysis?city=${city}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setAlerts(data.data.alerts.all);
  };

  return (
    <div>
      <button onClick={checkWeather}>Check Weather</button>
      {alerts.map((alert, i) => (
        <Alert key={i} severity={alert.type}>
          {alert.message}
        </Alert>
      ))}
    </div>
  );
};
```

## 📚 Full Documentation

For complete documentation, see: `WEATHER_ALERT_SYSTEM.md`

## ✅ Checklist

- [ ] Run test script successfully
- [ ] Test with at least one farm
- [ ] Verify alerts appear in notifications
- [ ] Set up cron job or scheduler
- [ ] Configure alert thresholds (optional)
- [ ] Integrate with frontend
- [ ] Monitor logs for first 24 hours

## 🎯 Next Steps

1. **Production Deployment:**
   - Set up proper logging (Winston, Bunyan)
   - Configure monitoring (Datadog, New Relic)
   - Set up error alerting (Sentry)

2. **Enhancements:**
   - Add SMS alerts for critical conditions
   - Implement email digests
   - Add crop-specific recommendations
   - Integrate IoT sensor data

3. **Optimization:**
   - Cache weather data (5-10 minutes)
   - Batch API calls for nearby farms
   - Implement rate limiting

## 💡 Tips

- Run monitoring during off-peak hours (e.g., 6 AM, 12 PM, 6 PM, 12 AM)
- Monitor API response times and adjust timeout if needed
- Review alert effectiveness after 1 week and adjust thresholds
- Consider farmer feedback for alert relevance

## 🆘 Support

If you encounter issues:
1. Check logs: `logs/weather_monitoring.log`
2. Run test script: `node scripts/test_weather_alerts.js`
3. Verify database: Check `notifications` and `weatheralerts` collections
4. Review API responses: Test endpoints with curl/Postman

---

**System Status:** ✅ Ready to use (no API key required)

**Last Updated:** February 28, 2026
