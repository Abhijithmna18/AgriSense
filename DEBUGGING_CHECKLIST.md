# ESP32 Irrigation System - Debugging Checklist

## 🔍 Quick Diagnostic Tool

Use this checklist to systematically debug issues with your smart irrigation system.

---

## 1️⃣ ESP32 Hardware Check

### Power Supply
- [ ] ESP32 has stable 5V power (measure with multimeter)
- [ ] Power LED on ESP32 is lit
- [ ] No brownout detector resets in Serial Monitor
- [ ] USB cable is data-capable (not charge-only)

### Relay Module
- [ ] Relay has separate 5V power supply
- [ ] Relay LED lights up when activated
- [ ] Audible "click" when relay switches
- [ ] Measure GPIO 26: 3.3V when ON, 0V when OFF

### Sensors
```
Sensor          | Pin  | Expected Reading
----------------|------|------------------
Soil Moisture   | 34   | 1500-4095 (analog)
DHT11 Temp      | 27   | 15-40°C
DHT11 Humidity  | 27   | 20-90%
TDS Sensor      | 35   | 0-2000 ppm
Flow Sensor     | 25   | Pulses when water flows
```

**Test Command** (add to `loop()` temporarily):
```cpp
Serial.print("Soil raw: "); Serial.println(analogRead(34));
Serial.print("TDS raw: "); Serial.println(analogRead(35));
Serial.print("Flow pulses: "); Serial.println(flowPulseCount);
```

---

## 2️⃣ WiFi Connection Check

### Serial Monitor Output
Look for these messages:

✅ **Success**:
```
Connecting to WiFi... ✓
WiFi connected! IP: 192.168.1.100
```

❌ **Failure**:
```
Connecting to WiFi...................
WiFi connection failed! Restarting...
```

### Troubleshooting Steps

**Problem**: WiFi won't connect

1. **Check credentials**:
   ```cpp
   #define WIFI_SSID "YourNetworkName"  // Exact name, case-sensitive
   #define WIFI_PASS "YourPassword"     // Exact password
   ```

2. **Check WiFi band**:
   - ESP32 only supports 2.4 GHz WiFi
   - 5 GHz networks won't work
   - Verify router has 2.4 GHz enabled

3. **Check signal strength**:
   ```cpp
   // Add to setup() after WiFi.begin():
   Serial.print("Signal strength: ");
   Serial.println(WiFi.RSSI());
   // Should be > -70 dBm for stable connection
   ```

4. **Check router settings**:
   - Disable MAC address filtering (temporarily)
   - Ensure DHCP is enabled
   - Check if router has device limit

5. **Test with mobile hotspot**:
   - Create hotspot on phone
   - Update SSID/password in code
   - If this works → router configuration issue

---

## 3️⃣ Adafruit IO Connection Check

### Serial Monitor Output

✅ **Success**:
```
Connecting to Adafruit IO... ✓
Connected to Adafruit IO!
```

❌ **Failure**:
```
Connecting to MQTT... 
Connection refused
Retrying MQTT connection in 5 seconds...
```

### Troubleshooting Steps

**Problem**: Can't connect to Adafruit IO

1. **Verify credentials**:
   ```cpp
   #define AIO_USERNAME "your_username"  // From io.adafruit.com
   #define AIO_KEY "aio_xxxxxxxxxxxx"    // From "My Key" page
   ```

2. **Check Adafruit IO status**:
   - Visit https://status.adafruit.com
   - Ensure service is operational

3. **Test credentials manually**:
   ```bash
   # Test REST API access:
   curl -H "X-AIO-Key: YOUR_KEY" \
        https://io.adafruit.com/api/v2/YOUR_USERNAME/feeds
   
   # Should return JSON list of feeds
   ```

4. **Check firewall**:
   - Ensure port 1883 (MQTT) is not blocked
   - Try from different network

5. **Verify feed names**:
   - Log into io.adafruit.com
   - Check all 10 feeds exist with exact names:
     - `pump-control`
     - `pump-status`
     - `soil-moisture`
     - `temperature`
     - `humidity`
     - `tds`
     - `flow-rate`
     - `water-volume`
     - `dry-run-alert`
     - `soil-warning`

---

## 4️⃣ Sensor Data Publishing Check

### Serial Monitor Output

✅ **Success**:
```
─── Sensor Reading ───
Soil Moisture: 45.2%
Temperature: 24.8°C
Humidity: 62%
TDS: 750 ppm
Flow Rate: 0.00 L/min
Total Volume: 0.0 L
Pump Status: OFF
✓ Data published to Adafruit IO
```

❌ **Failure**:
```
─── Sensor Reading ───
Soil Moisture: 0.0%
Temperature: 0.0°C
✗ Failed to publish soil moisture
✗ Failed to publish temperature
```

### Troubleshooting Steps

**Problem**: Sensor readings are 0 or NaN

1. **Check sensor connections**:
   ```cpp
   // Add debug output:
   int soilRaw = analogRead(SOIL_MOISTURE_PIN);
   Serial.print("Soil raw ADC: "); Serial.println(soilRaw);
   
   float temp = dht.readTemperature();
   Serial.print("DHT temp: "); Serial.println(temp);
   if (isnan(temp)) Serial.println("DHT read failed!");
   ```

2. **Verify sensor power**:
   - Measure 3.3V on sensor VCC pins
   - Check ground connections

3. **Test sensors individually**:
   ```cpp
   // Minimal test sketch:
   void loop() {
     Serial.println(analogRead(34));  // Soil sensor
     delay(1000);
   }
   ```

**Problem**: Data not appearing in Adafruit IO

1. **Check publish return values**:
   ```cpp
   bool success = feed_soil_moisture.publish(soilMoisture);
   if (!success) {
     Serial.println("Publish failed!");
     Serial.print("MQTT state: ");
     Serial.println(mqtt.connected() ? "Connected" : "Disconnected");
   }
   ```

2. **Check rate limits**:
   - Free tier: 30 data points/minute
   - With 10 feeds at 4-second intervals = 150 points/minute
   - **Solution**: Increase interval to 10 seconds

3. **Verify feed names match**:
   ```cpp
   // Feed path format:
   AIO_USERNAME "/feeds/pump-status"
   
   // Common mistake: extra spaces or wrong case
   // ❌ "pump status" (space)
   // ❌ "Pump-Status" (wrong case)
   // ✅ "pump-status" (correct)
   ```

---

## 5️⃣ Pump Control Check

### Serial Monitor Output

✅ **Success**:
```
╔════════════════════════════════════════╗
║  PUMP COMMAND RECEIVED: ON   ║
╚════════════════════════════════════════╝
✓ PUMP TURNED ON
  Soil moisture at start: 45.2%
```

❌ **Failure**:
```
(No message appears when button clicked)
```

### Troubleshooting Steps

**Problem**: No command received when button clicked

1. **Check MQTT subscription**:
   ```cpp
   // In setup(), verify:
   mqtt.subscribe(&feed_pump_control);
   
   // Add debug in loop():
   Serial.println("Waiting for messages...");
   Adafruit_MQTT_Subscribe *subscription;
   while ((subscription = mqtt.readSubscription(100))) {
     Serial.println("Message received!");
     if (subscription == &feed_pump_control) {
       Serial.print("Pump command: ");
       Serial.println((char *)feed_pump_control.lastread);
     }
   }
   ```

2. **Test with Adafruit IO dashboard**:
   - Go to io.adafruit.com
   - Open `pump-control` feed
   - Manually add data point: `1`
   - Check if ESP32 receives it

3. **Check feed name**:
   ```cpp
   // Verify exact feed path:
   Adafruit_MQTT_Subscribe feed_pump_control = 
     Adafruit_MQTT_Subscribe(&mqtt, AIO_USERNAME "/feeds/pump-control");
   //                                                    ^^^^^^^^^^^^
   //                                                    Must match exactly
   ```

**Problem**: Command received but pump doesn't turn on

1. **Check GPIO output**:
   ```cpp
   void pumpON() {
     digitalWrite(PUMP_RELAY_PIN, HIGH);
     Serial.print("GPIO 26 state: ");
     Serial.println(digitalRead(PUMP_RELAY_PIN));  // Should print 1
     
     // Measure with multimeter: should be 3.3V
   }
   ```

2. **Check relay wiring**:
   - Relay IN pin connected to GPIO 26?
   - Relay VCC connected to 5V?
   - Relay GND connected to GND?

3. **Test relay directly**:
   ```cpp
   void setup() {
     pinMode(26, OUTPUT);
     digitalWrite(26, HIGH);  // Force ON
     delay(5000);
     digitalWrite(26, LOW);   // Force OFF
   }
   // Should hear relay click
   ```

4. **Check relay logic**:
   - Some relays are active-LOW
   - Try: `digitalWrite(PUMP_RELAY_PIN, LOW)` to turn ON

---

## 6️⃣ Dashboard Connection Check

### Browser Console Output

✅ **Success**:
```
✓ Published to pump-control: 1
✓ Pump command sent successfully: ON
✓ Pump status confirmed: ON
```

❌ **Failure**:
```
✗ Error publishing to pump-control: Failed to fetch
Cannot reach Adafruit IO. Check your network and credentials.
```

### Troubleshooting Steps

**Problem**: Dashboard shows "OFFLINE"

1. **Check .env file**:
   ```bash
   # In farmer_ai-frontend/.env:
   cat .env
   
   # Should show:
   VITE_AIO_USERNAME=your_username
   VITE_AIO_KEY=aio_xxxxxxxxxxxx
   ```

2. **Verify environment variables loaded**:
   ```javascript
   // In browser console:
   console.log(import.meta.env.VITE_AIO_USERNAME);
   console.log(import.meta.env.VITE_AIO_KEY);
   
   // Should NOT be undefined
   ```

3. **Restart dev server**:
   ```bash
   # .env changes require restart:
   npm run dev
   ```

4. **Check CORS**:
   - Adafruit IO allows CORS by default
   - Check browser console for CORS errors

5. **Test API manually**:
   ```bash
   # Test from command line:
   curl -H "X-AIO-Key: YOUR_KEY" \
        https://io.adafruit.com/api/v2/YOUR_USERNAME/feeds/soil-moisture/data/last
   
   # Should return JSON with latest value
   ```

**Problem**: Pump button doesn't work

1. **Check browser console**:
   - Open DevTools (F12)
   - Click pump button
   - Look for errors

2. **Verify API call**:
   ```javascript
   // In SmartIrrigationDashboard.jsx, add logging:
   const sendPumpCommand = async (on) => {
     console.log('🎯 Sending pump command:', on ? 'ON' : 'OFF');
     console.log('Feed:', FEEDS.PUMP_CONTROL);
     console.log('URL:', `${AIO_BASE}/${FEEDS.PUMP_CONTROL}/data`);
     
     const response = await fetch(`${AIO_BASE}/${FEEDS.PUMP_CONTROL}/data`, {
       method: 'POST',
       headers: AIO_HEADERS,
       body: JSON.stringify({ value: String(on ? 1 : 0) }),
     });
     
     console.log('Response status:', response.status);
     console.log('Response:', await response.json());
   };
   ```

3. **Check network tab**:
   - Open DevTools → Network tab
   - Click pump button
   - Look for POST request to `io.adafruit.com`
   - Check response status (should be 200)

---

## 7️⃣ Safety Features Check

### Dry Run Protection

**Test procedure**:
1. Turn pump ON (without water supply)
2. Wait 5 seconds
3. Expected: Pump auto-stops, alert appears

**Debug if not working**:
```cpp
void checkDryRun() {
  Serial.print("Pump active: "); Serial.println(pumpActive);
  Serial.print("Flow rate: "); Serial.println(flowRate);
  Serial.print("Time with no flow: ");
  Serial.println(millis() - pumpOnWithNoFlowStart);
  
  if (pumpActive && flowRate < 0.1) {
    if (pumpOnWithNoFlowStart == 0) {
      pumpOnWithNoFlowStart = millis();
      Serial.println("Started dry run timer");
    } else if (millis() - pumpOnWithNoFlowStart >= DRY_RUN_TIMEOUT) {
      Serial.println("DRY RUN DETECTED!");
      pumpOFF();
      feed_dry_run_alert.publish(1);
    }
  }
}
```

### Soil Response Monitoring

**Test procedure**:
1. Disconnect soil sensor
2. Run pump for 60+ seconds
3. Expected: Soil warning appears

**Debug if not working**:
```cpp
void checkSoilResponse() {
  if (!pumpActive) return;
  
  unsigned long runtime = millis() - pumpStartTime;
  Serial.print("Pump runtime: "); Serial.println(runtime / 1000);
  
  if (runtime >= SOIL_RESPONSE_TIMEOUT && !soilWarning) {
    float currentMoisture = readSoilMoisture();
    float increase = currentMoisture - soilMoistureAtPumpStart;
    
    Serial.print("Moisture at start: "); Serial.println(soilMoistureAtPumpStart);
    Serial.print("Current moisture: "); Serial.println(currentMoisture);
    Serial.print("Increase: "); Serial.println(increase);
    
    if (increase < 2.0) {
      Serial.println("SOIL WARNING!");
      soilWarning = true;
      feed_soil_warning.publish(1);
    }
  }
}
```

---

## 8️⃣ Performance Check

### Memory Usage

```cpp
void loop() {
  // Add to monitor free heap:
  static unsigned long lastMemCheck = 0;
  if (millis() - lastMemCheck >= 10000) {
    Serial.print("Free heap: ");
    Serial.println(ESP.getFreeHeap());
    lastMemCheck = millis();
  }
}

// Free heap should be > 100,000 bytes
// If < 50,000 → memory leak
```

### MQTT Connection Stability

```cpp
void loop() {
  // Monitor connection drops:
  static bool wasConnected = false;
  bool isConnected = mqtt.connected();
  
  if (wasConnected && !isConnected) {
    Serial.println("⚠️ MQTT connection lost!");
  } else if (!wasConnected && isConnected) {
    Serial.println("✓ MQTT connection restored");
  }
  
  wasConnected = isConnected;
}
```

### Publish Success Rate

```cpp
int publishAttempts = 0;
int publishFailures = 0;

void readAndPublishSensors() {
  publishAttempts++;
  
  if (!feed_soil_moisture.publish(soilMoisture)) {
    publishFailures++;
  }
  
  // Log every 10 attempts:
  if (publishAttempts % 10 == 0) {
    float successRate = 100.0 * (publishAttempts - publishFailures) / publishAttempts;
    Serial.print("Publish success rate: ");
    Serial.print(successRate);
    Serial.println("%");
  }
}

// Success rate should be > 95%
```

---

## 9️⃣ Common Error Messages

### ESP32 Errors

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `Brownout detector was triggered` | Insufficient power | Use 2A power supply |
| `Guru Meditation Error` | Memory corruption | Check array bounds, reduce variables |
| `Stack canary watchpoint triggered` | Stack overflow | Reduce local variables, increase stack size |
| `Task watchdog got triggered` | Loop blocking | Add `yield()` or `delay()` in loops |
| `Connection refused` | Wrong MQTT credentials | Verify AIO_USERNAME and AIO_KEY |

### Dashboard Errors

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `Failed to fetch` | Network issue or wrong URL | Check internet, verify AIO credentials |
| `CORS error` | Browser security | Adafruit IO allows CORS, check URL |
| `401 Unauthorized` | Wrong AIO key | Verify VITE_AIO_KEY in .env |
| `404 Not Found` | Feed doesn't exist | Create feed in Adafruit IO |
| `429 Too Many Requests` | Rate limit exceeded | Increase polling interval |

---

## 🔟 System Health Indicators

### ✅ Healthy System

```
ESP32 Serial Monitor:
- WiFi connected with IP address
- MQTT connected to Adafruit IO
- Sensor readings updating every 4 seconds
- All publish operations successful
- Free heap > 100,000 bytes

Dashboard:
- Status shows "LIVE" (green)
- Sensor values updating every 4 seconds
- Pump button responsive
- No error messages in console
- Charts showing data trends

Physical:
- ESP32 power LED lit
- No excessive heat
- Relay clicks when commanded
- Pump runs when activated
- Flow sensor detects water
```

### ⚠️ Warning Signs

```
- Free heap < 50,000 bytes → Memory leak
- Publish success rate < 90% → Network issues
- WiFi RSSI < -80 dBm → Weak signal
- Frequent MQTT reconnections → Unstable connection
- Sensor readings stuck at same value → Sensor failure
```

### 🚨 Critical Issues

```
- ESP32 keeps restarting → Power or code issue
- No MQTT connection after 3 retries → Credentials wrong
- Pump won't turn off → Relay stuck, safety hazard
- Dry run alert not triggering → Flow sensor broken
- Dashboard always shows "OFFLINE" → API credentials wrong
```

---

## 📊 Diagnostic Commands

### Quick Test Script

Add this to your ESP32 code for comprehensive diagnostics:

```cpp
void runDiagnostics() {
  Serial.println("\n╔════════════════════════════════════════╗");
  Serial.println("║        SYSTEM DIAGNOSTICS              ║");
  Serial.println("╚════════════════════════════════════════╝\n");
  
  // WiFi
  Serial.println("─── WiFi ───");
  Serial.print("Status: "); Serial.println(WiFi.status() == WL_CONNECTED ? "✓ Connected" : "✗ Disconnected");
  Serial.print("SSID: "); Serial.println(WiFi.SSID());
  Serial.print("IP: "); Serial.println(WiFi.localIP());
  Serial.print("Signal: "); Serial.print(WiFi.RSSI()); Serial.println(" dBm");
  
  // MQTT
  Serial.println("\n─── MQTT ───");
  Serial.print("Status: "); Serial.println(mqtt.connected() ? "✓ Connected" : "✗ Disconnected");
  Serial.print("Server: "); Serial.println(AIO_SERVER);
  Serial.print("Username: "); Serial.println(AIO_USERNAME);
  
  // Sensors
  Serial.println("\n─── Sensors ───");
  Serial.print("Soil (raw): "); Serial.println(analogRead(SOIL_MOISTURE_PIN));
  Serial.print("Soil (%): "); Serial.println(readSoilMoisture());
  Serial.print("Temp (°C): "); Serial.println(readTemperature());
  Serial.print("Humidity (%): "); Serial.println(readHumidity());
  Serial.print("TDS (ppm): "); Serial.println(readTDS());
  Serial.print("Flow (L/min): "); Serial.println(flowRate);
  
  // GPIO
  Serial.println("\n─── GPIO ───");
  Serial.print("Pump relay (GPIO 26): "); Serial.println(digitalRead(PUMP_RELAY_PIN) ? "HIGH" : "LOW");
  
  // Memory
  Serial.println("\n─── Memory ───");
  Serial.print("Free heap: "); Serial.println(ESP.getFreeHeap());
  Serial.print("Heap size: "); Serial.println(ESP.getHeapSize());
  
  Serial.println("\n╚════════════════════════════════════════╝\n");
}

// Call from Serial Monitor:
// Send 'D' to run diagnostics
void loop() {
  if (Serial.available()) {
    char cmd = Serial.read();
    if (cmd == 'D' || cmd == 'd') {
      runDiagnostics();
    }
  }
}
```

---

## 🎯 Quick Fix Flowchart

```
Problem: System not working
    ↓
Is ESP32 powered? → NO → Check power supply
    ↓ YES
Is WiFi connected? → NO → Check SSID/password, signal strength
    ↓ YES
Is MQTT connected? → NO → Check AIO credentials, feeds exist
    ↓ YES
Are sensors reading? → NO → Check sensor connections, pins
    ↓ YES
Is data in Adafruit IO? → NO → Check publish success, rate limits
    ↓ YES
Is dashboard showing data? → NO → Check .env file, restart dev server
    ↓ YES
Does pump button work? → NO → Check subscription, feed name
    ↓ YES
Does pump turn on? → NO → Check relay wiring, GPIO output
    ↓ YES
✅ SYSTEM WORKING!
```

---

## 📞 Getting Help

If you've gone through this checklist and still have issues:

1. **Gather information**:
   - ESP32 Serial Monitor output (full log)
   - Browser console output
   - Network tab showing API calls
   - Photos of hardware connections

2. **Check these resources**:
   - [Adafruit IO Forums](https://forums.adafruit.com/viewforum.php?f=56)
   - [ESP32 Arduino Issues](https://github.com/espressif/arduino-esp32/issues)
   - [Project GitHub Issues](your-repo-url)

3. **Provide details**:
   - What step in the guide did you complete?
   - What error messages do you see?
   - What have you tried already?
   - Hardware setup (photos help!)

---

## ✅ Final Verification

Before considering the system "working", verify ALL of these:

- [ ] ESP32 connects to WiFi automatically on power-up
- [ ] ESP32 connects to Adafruit IO automatically
- [ ] Sensor data appears in Serial Monitor every 4 seconds
- [ ] Sensor data appears in Adafruit IO feeds
- [ ] Dashboard shows "LIVE" status
- [ ] Dashboard displays all sensor readings
- [ ] Clicking pump button sends command
- [ ] ESP32 receives pump command
- [ ] Relay activates (audible click)
- [ ] Pump motor runs
- [ ] Flow sensor detects water flow
- [ ] Pump status updates in dashboard
- [ ] Dry run protection triggers correctly
- [ ] Soil warning triggers correctly
- [ ] AI decision engine makes recommendations
- [ ] System runs for 24+ hours without crashes

**If all checked → Your system is production-ready!** 🎉
