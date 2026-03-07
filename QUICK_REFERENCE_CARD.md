# ESP32 Smart Irrigation - Quick Reference Card

## 🚀 Quick Start (5 Minutes)

### 1. Hardware Setup
```
ESP32 Pin 26 → Relay IN
ESP32 Pin 34 → Soil Moisture Sensor
ESP32 Pin 27 → DHT11 Data
ESP32 Pin 35 → TDS Sensor
ESP32 Pin 25 → Flow Sensor
ESP32 GND → All sensor grounds
ESP32 3.3V → DHT11, Soil Sensor VCC
```

### 2. Software Setup
```cpp
// Update in ESP32_IRRIGATION_CONTROLLER.ino:
#define WIFI_SSID "YourWiFiName"
#define WIFI_PASS "YourPassword"
#define AIO_USERNAME "your_adafruit_username"
#define AIO_KEY "your_aio_key"
```

```bash
# Update in farmer_ai-frontend/.env:
VITE_AIO_USERNAME=your_adafruit_username
VITE_AIO_KEY=your_aio_key
```

### 3. Upload & Run
```bash
# Upload ESP32 firmware (Arduino IDE)
# Start dashboard
cd farmer_ai-frontend
npm run dev
```

---

## 📋 Adafruit IO Feeds (Must Create All 10)

| Feed Name | Type | Direction |
|-----------|------|-----------|
| `pump-control` | Numeric | Dashboard → ESP32 |
| `pump-status` | Numeric | ESP32 → Dashboard |
| `soil-moisture` | Numeric | ESP32 → Dashboard |
| `temperature` | Numeric | ESP32 → Dashboard |
| `humidity` | Numeric | ESP32 → Dashboard |
| `tds` | Numeric | ESP32 → Dashboard |
| `flow-rate` | Numeric | ESP32 → Dashboard |
| `water-volume` | Numeric | ESP32 → Dashboard |
| `dry-run-alert` | Numeric | ESP32 → Dashboard |
| `soil-warning` | Numeric | ESP32 → Dashboard |

---

## 🔍 Serial Monitor Commands

### Normal Operation
```
─── Sensor Reading ───
Soil Moisture: 45.2%
Temperature: 24.8°C
Humidity: 62%
TDS: 750 ppm
Flow Rate: 2.50 L/min
✓ Data published to Adafruit IO
```

### Pump ON
```
╔════════════════════════════════════════╗
║  PUMP COMMAND RECEIVED: ON   ║
╚════════════════════════════════════════╝
✓ PUMP TURNED ON
```

### Dry Run Alert
```
╔════════════════════════════════════════╗
║  🚨 DRY RUN DETECTED!                 ║
║  Shutting down pump for safety        ║
╚════════════════════════════════════════╝
```

---

## 🐛 Troubleshooting (30 Seconds)

### Dashboard shows "OFFLINE"
```bash
# Check .env file
cat farmer_ai-frontend/.env

# Restart dev server
npm run dev
```

### Pump button doesn't work
```
1. Check Serial Monitor for "PUMP COMMAND RECEIVED"
2. If not appearing → Check feed name is "pump-control"
3. Verify ESP32 connected to Adafruit IO
```

### Sensor readings are 0
```cpp
// Add to loop() for debugging:
Serial.println(analogRead(34));  // Soil sensor
Serial.println(dht.readTemperature());  // DHT11
```

---

## 📊 Expected Values

| Sensor | Normal Range | Alert Threshold |
|--------|--------------|-----------------|
| Soil Moisture | 30-70% | < 35% (irrigation needed) |
| Temperature | 15-35°C | > 40°C (heat stress) |
| Humidity | 40-80% | < 30% (high ET) |
| TDS | 600-1200 ppm | < 600 (low fertilizer) |
| Flow Rate | 1-5 L/min | < 0.1 (dry run) |

---

## 🔧 Common Fixes

### WiFi won't connect
```cpp
// ESP32 only supports 2.4 GHz WiFi
// Check router has 2.4 GHz enabled
// Try mobile hotspot to test
```

### Relay doesn't click
```cpp
// Check GPIO output:
digitalWrite(26, HIGH);
delay(2000);
digitalWrite(26, LOW);
// Should hear click
```

### Rate limit exceeded
```cpp
// Increase polling interval:
if (millis() - lastSensorRead >= 10000) {  // 10s instead of 4s
    readAndPublishSensors();
}
```

---

## 🎯 AI Decision Rules

```
IF soilMoisture < 35% AND ET > 10
  → START irrigation (high priority)
  → Runtime: (60 - soilMoisture) × 30 seconds

IF soilMoisture < 35%
  → START irrigation (normal priority)
  → Runtime: (60 - soilMoisture) × 20 seconds

IF soilMoisture > 60%
  → STOP irrigation

IF pumpActive AND flowRate < 0.1 for 5s
  → EMERGENCY STOP (dry run)
```

---

## 📞 Quick Help

### Check System Status
```
ESP32: Open Serial Monitor (115200 baud)
Dashboard: Check top-right status indicator
Adafruit IO: Visit io.adafruit.com/feeds
```

### Test Pump Control
```
1. Dashboard: Click pump toggle
2. Serial Monitor: Look for "PUMP COMMAND RECEIVED"
3. Physical: Hear relay click
4. Dashboard: Status updates to "ACTIVE"
```

### Verify Data Flow
```
ESP32 → Adafruit IO:
  Check Serial Monitor for "✓ Data published"

Adafruit IO → Dashboard:
  Check dashboard shows "LIVE" status
  Values update every 4 seconds
```

---

## 🔐 Security Checklist

- [ ] `.env` file in `.gitignore`
- [ ] AIO_KEY never committed to git
- [ ] WiFi uses WPA2 encryption
- [ ] Rotate AIO_KEY every 6 months
- [ ] Use dedicated IoT network if possible

---

## ⚡ Performance Tips

### Reduce API Calls
```cpp
// ESP32: Increase publish interval
if (millis() - lastSensorRead >= 10000) {  // 10s

// Dashboard: Increase poll interval
const id = setInterval(fetchAdafruitFeeds, 10000);  // 10s
```

### Improve Reliability
```cpp
// Add connection monitoring:
if (!mqtt.connected()) {
  connectMQTT();
}
mqtt.ping();  // Keep connection alive
```

---

## 📈 Monitoring Dashboard

### Key Metrics to Watch
```
✅ Status: LIVE (green)
✅ Soil Moisture: 40-60%
✅ TDS: 600-1200 ppm
✅ Flow Rate: > 0 when pump ON
✅ No alerts displayed
```

### Warning Signs
```
⚠️ Status: OFFLINE (red)
⚠️ Soil Moisture: < 35%
⚠️ TDS: < 600 or > 1200 ppm
⚠️ Flow Rate: 0 when pump ON
⚠️ Dry run alert
```

---

## 🎓 Understanding the System

### Data Flow
```
Sensors → ESP32 → Adafruit IO → Dashboard
Dashboard → Adafruit IO → ESP32 → Relay → Pump
```

### Update Frequency
```
Sensors: Read continuously
ESP32 Publish: Every 4 seconds
Dashboard Poll: Every 4 seconds
Pump Command: Instant (< 1 second)
```

### Safety Features
```
1. Dry run detection (5s timeout)
2. Soil response monitoring (60s check)
3. Auto-reconnect (WiFi, MQTT)
4. Emergency shutdown capability
```

---

## 🔄 Maintenance Schedule

### Daily
- [ ] Check dashboard for alerts
- [ ] Verify pump operation

### Weekly
- [ ] Clean flow sensor filter
- [ ] Review Serial Monitor logs

### Monthly
- [ ] Clean soil sensor
- [ ] Clean TDS sensor
- [ ] Verify sensor accuracy
- [ ] Check relay contacts

### Quarterly
- [ ] Full system test
- [ ] Update firmware/libraries
- [ ] Check all connections

---

## 📱 Mobile Access

### View Dashboard on Phone
```
1. Find your computer's IP address
2. On phone, visit: http://YOUR_IP:5173
3. Bookmark for quick access
```

### Remote Access (Advanced)
```
1. Deploy dashboard to Vercel/Netlify
2. Access from anywhere
3. Control irrigation remotely
```

---

## 🎉 Success Indicators

Your system is working when:

✅ Dashboard shows "LIVE"
✅ Sensor values update every 4 seconds
✅ Pump button turns pump ON/OFF
✅ Relay clicks when commanded
✅ Flow sensor detects water
✅ AI makes irrigation decisions
✅ Alerts appear for issues
✅ System runs 24/7 without crashes

---

**Keep this card handy for quick reference!** 📋✨
