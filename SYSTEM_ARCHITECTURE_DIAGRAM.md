# ESP32 Smart Irrigation System - Architecture Diagram

## 🏗️ Complete System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PHYSICAL LAYER                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Soil    │  │  DHT11   │  │   TDS    │  │   Flow   │  │  Relay   │ │
│  │ Moisture │  │  Temp/   │  │  Sensor  │  │  Sensor  │  │  Module  │ │
│  │  Sensor  │  │ Humidity │  │          │  │          │  │          │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │             │             │             │             │        │
│       └─────────────┴─────────────┴─────────────┴─────────────┘        │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        CONTROLLER LAYER                                 │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                      ESP32 DevKit                                 │ │
│  │                                                                   │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │ │
│  │  │  Sensor Reader  │  │  MQTT Client    │  │  Relay Control  │  │ │
│  │  │  • Read ADC     │  │  • Subscribe    │  │  • GPIO Output  │  │ │
│  │  │  • Process data │  │  • Publish      │  │  • Safety logic │  │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │ │
│  │                                                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │              Safety Monitoring System                       │ │ │
│  │  │  • Dry run detection (5s timeout)                          │ │ │
│  │  │  • Soil response monitoring (60s check)                    │ │ │
│  │  │  • Emergency shutdown                                       │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ WiFi (2.4 GHz)
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLOUD LAYER                                    │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                    Adafruit IO Platform                           │ │
│  │                                                                   │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │ │
│  │  │  MQTT Broker    │  │  Data Storage   │  │   REST API      │  │ │
│  │  │  Port: 1883     │  │  30-day history │  │  HTTPS          │  │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │ │
│  │                                                                   │ │
│  │  Feeds:                                                           │ │
│  │  • pump-control (command)    • soil-moisture (sensor)            │ │
│  │  • pump-status (feedback)    • temperature (sensor)              │ │
│  │  • flow-rate (sensor)        • humidity (sensor)                 │ │
│  │  • tds (sensor)              • water-volume (sensor)             │ │
│  │  • dry-run-alert (alert)     • soil-warning (alert)              │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ HTTPS REST API
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                                  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │              React Dashboard (farmer_ai-frontend)                 │ │
│  │                                                                   │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │ │
│  │  │  Data Fetcher   │  │  AI Decision    │  │  User Interface │  │ │
│  │  │  • Poll feeds   │  │  Engine         │  │  • Real-time    │  │ │
│  │  │  • 4s interval  │  │  • ET calc      │  │    charts       │  │ │
│  │  └─────────────────┘  │  • Auto control │  │  • Pump control │  │ │
│  │                       └─────────────────┘  │  • Alerts       │  │ │
│  │                                            └─────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📡 Data Flow Diagrams

### Sensor Data Flow (ESP32 → Dashboard)

```
┌─────────────┐
│   Sensors   │ Read every 4 seconds
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────┐
│  ESP32: readAndPublishSensors()     │
│  • readSoilMoisture()               │
│  • readTemperature()                │
│  • readHumidity()                   │
│  • readTDS()                        │
│  • calculateFlowRate()              │
└──────┬──────────────────────────────┘
       │ MQTT Publish
       ↓
┌─────────────────────────────────────┐
│  Adafruit IO MQTT Broker            │
│  Topic: {username}/feeds/{feedname} │
└──────┬──────────────────────────────┘
       │ Store in feed
       ↓
┌─────────────────────────────────────┐
│  Adafruit IO Data Storage           │
│  • Last value cached                │
│  • 30-day history                   │
└──────┬──────────────────────────────┘
       │ REST API GET
       ↓
┌─────────────────────────────────────┐
│  Dashboard: fetchAdafruitFeeds()    │
│  GET /feeds/{feedname}/data/last    │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  React State Update                 │
│  setSensorData({ ... })             │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  UI Render                          │
│  • Display values                   │
│  • Update charts                    │
│  • Run AI decision engine           │
└─────────────────────────────────────┘
```

### Pump Control Flow (Dashboard → ESP32)

```
┌─────────────────────────────────────┐
│  User clicks pump button            │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Dashboard: sendPumpCommand(true)   │
│  • Set pumpLoading = true           │
│  • Call aioPublish()                │
└──────┬──────────────────────────────┘
       │ HTTP POST
       ↓
┌─────────────────────────────────────┐
│  POST /feeds/pump-control/data      │
│  Headers: X-AIO-Key                 │
│  Body: { "value": "1" }             │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Adafruit IO REST API               │
│  • Validate key                     │
│  • Store value in feed              │
│  • Publish to MQTT topic            │
└──────┬──────────────────────────────┘
       │ MQTT Publish
       ↓
┌─────────────────────────────────────┐
│  Adafruit IO MQTT Broker            │
│  Topic: {username}/feeds/pump-control│
│  Payload: "1"                       │
└──────┬──────────────────────────────┘
       │ MQTT Subscribe
       ↓
┌─────────────────────────────────────┐
│  ESP32: mqtt.readSubscription()     │
│  • Receive message                  │
│  • Match feed_pump_control          │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  ESP32: handlePumpCommand("1")      │
│  • Parse value                      │
│  • Call pumpON()                    │
└──────┬──────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  ESP32: pumpON()                    │
│  • digitalWrite(26, HIGH)           │
│  • Set pumpActive = true            │
│  • Record start time                │
│  • Publish pump-status = 1          │
└──────┬──────────────────────────────┘
       │ GPIO HIGH
       ↓
┌─────────────────────────────────────┐
│  Relay Module                       │
│  • Optical isolator activates       │
│  • Switch closes (click sound)      │
└──────┬──────────────────────────────┘
       │ 12V circuit closes
       ↓
┌─────────────────────────────────────┐
│  Irrigation Pump                    │
│  • Motor runs                       │
│  • Water flows                      │
└─────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Flow Sensor                        │
│  • Detects water flow               │
│  • Generates pulses                 │
│  • ESP32 counts pulses              │
└──────┬──────────────────────────────┘
       │ Publish flow-rate
       ↓
┌─────────────────────────────────────┐
│  Dashboard reads pump-status        │
│  • UI updates to "ACTIVE"           │
│  • Flow rate displays               │
│  • Green animation plays            │
└─────────────────────────────────────┘
```

---

## 🔄 Complete Round-Trip Communication

```
USER ACTION → DASHBOARD → ADAFRUIT IO → ESP32 → HARDWARE → SENSORS → ESP32 → ADAFRUIT IO → DASHBOARD → USER FEEDBACK

Timeline:
T+0ms    : User clicks button
T+50ms   : POST request sent
T+200ms  : Adafruit IO receives
T+300ms  : MQTT message published
T+400ms  : ESP32 receives command
T+410ms  : GPIO goes HIGH
T+420ms  : Relay clicks
T+430ms  : Pump starts
T+500ms  : Flow sensor detects water
T+4000ms : ESP32 publishes status
T+4200ms : Dashboard polls status
T+4250ms : UI updates to show ACTIVE

Total latency: ~4.25 seconds (limited by polling interval)
```

---

## 🧩 Component Interaction Matrix

| Component | Sends To | Receives From | Protocol | Frequency |
|-----------|----------|---------------|----------|-----------|
| Soil Sensor | ESP32 | - | Analog | Continuous |
| DHT11 | ESP32 | - | Digital (1-Wire) | On request |
| TDS Sensor | ESP32 | - | Analog | Continuous |
| Flow Sensor | ESP32 | - | Digital (Interrupt) | Continuous |
| ESP32 | Adafruit IO | Adafruit IO | MQTT | 4s publish, instant receive |
| Relay | Pump | ESP32 | GPIO | Instant |
| Adafruit IO | Dashboard, ESP32 | Dashboard, ESP32 | MQTT, HTTPS | Instant |
| Dashboard | Adafruit IO | Adafruit IO | HTTPS | 4s polling |
| User | Dashboard | Dashboard | UI Events | On demand |

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
└─────────────────────────────────────────────────────────────┘

Layer 1: Network Security
├─ WiFi: WPA2 encryption
├─ MQTT: TLS 1.2 (optional, port 8883)
└─ HTTPS: TLS 1.3 for REST API

Layer 2: Authentication
├─ Adafruit IO Key (AIO_KEY)
│  ├─ 32-character secret
│  ├─ Sent in X-AIO-Key header
│  └─ Never exposed in client-side code
└─ Username (AIO_USERNAME)
   └─ Public identifier

Layer 3: Authorization
├─ Feed-level permissions
├─ Rate limiting (30 data points/min)
└─ Account-level quotas

Layer 4: Application Security
├─ Environment variables (.env)
├─ .gitignore prevents key commits
└─ No hardcoded credentials

Layer 5: Physical Security
├─ Relay optical isolation
├─ Dry run protection
└─ Emergency shutdown capability
```

---

## ⚡ Power Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Power Distribution                       │
└─────────────────────────────────────────────────────────────┘

12V Power Supply (2A)
├─ Irrigation Pump (12V, 1-2A)
└─ Step-down to 5V (Buck converter)
   └─ Relay Module VCC (5V, 100mA)

5V Power Supply (2A) or USB
├─ ESP32 VIN (5V, 500mA)
│  └─ Internal 3.3V regulator
│     ├─ ESP32 Core (3.3V, 200mA)
│     ├─ WiFi Module (3.3V, 200mA peak)
│     └─ 3.3V Output Pin
│        ├─ DHT11 (3.3V, 2.5mA)
│        └─ Soil Sensor (3.3V, 20mA)
└─ TDS Sensor (5V, 5mA)

⚠️ CRITICAL: Never connect pump power to ESP32!
Always use relay with optical isolation.
```

---

## 📊 Data Model

### Adafruit IO Feed Structure

```
Feed: pump-control
├─ Type: Numeric
├─ Direction: Dashboard → ESP32
├─ Values: 0 (OFF) or 1 (ON)
├─ Update rate: On demand (user action)
└─ Purpose: Command pump state

Feed: pump-status
├─ Type: Numeric
├─ Direction: ESP32 → Dashboard
├─ Values: 0 (OFF) or 1 (ON)
├─ Update rate: Every 4 seconds
└─ Purpose: Actual pump state feedback

Feed: soil-moisture
├─ Type: Numeric
├─ Direction: ESP32 → Dashboard
├─ Values: 0-100 (percentage)
├─ Update rate: Every 4 seconds
└─ Purpose: Soil moisture level

Feed: temperature
├─ Type: Numeric
├─ Direction: ESP32 → Dashboard
├─ Values: 0-50 (Celsius)
├─ Update rate: Every 4 seconds
└─ Purpose: Ambient temperature

Feed: humidity
├─ Type: Numeric
├─ Direction: ESP32 → Dashboard
├─ Values: 0-100 (percentage)
├─ Update rate: Every 4 seconds
└─ Purpose: Relative humidity

Feed: tds
├─ Type: Numeric
├─ Direction: ESP32 → Dashboard
├─ Values: 0-2000 (ppm)
├─ Update rate: Every 4 seconds
└─ Purpose: Fertilizer concentration

Feed: flow-rate
├─ Type: Numeric
├─ Direction: ESP32 → Dashboard
├─ Values: 0-10 (L/min)
├─ Update rate: Every 1 second (calculated)
└─ Purpose: Water flow rate

Feed: water-volume
├─ Type: Numeric
├─ Direction: ESP32 → Dashboard
├─ Values: 0-∞ (liters)
├─ Update rate: Every 4 seconds
└─ Purpose: Total water dispensed

Feed: dry-run-alert
├─ Type: Numeric
├─ Direction: ESP32 → Dashboard
├─ Values: 0 (OK) or 1 (ALERT)
├─ Update rate: On event
└─ Purpose: Dry run detection

Feed: soil-warning
├─ Type: Numeric
├─ Direction: ESP32 → Dashboard
├─ Values: 0 (OK) or 1 (WARNING)
├─ Update rate: On event
└─ Purpose: Soil not responding
```

---

## 🎯 AI Decision Engine Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              AI Decision Engine (Dashboard)                 │
└─────────────────────────────────────────────────────────────┘

Input Layer:
├─ Sensor Data
│  ├─ soilMoisture (%)
│  ├─ temperature (°C)
│  ├─ humidity (%)
│  ├─ tdsValue (ppm)
│  ├─ flowRate (L/min)
│  └─ pumpActive (boolean)

Processing Layer:
├─ ET Index Calculation
│  └─ ET = (temp - 15) / 2 + (100 - humidity) / 10
│
├─ Irrigation Decision Rules
│  ├─ Rule 1: soilMoisture < 35% AND ET > 10
│  │  └─ Action: START irrigation (high priority)
│  ├─ Rule 2: soilMoisture < 35%
│  │  └─ Action: START irrigation (normal priority)
│  ├─ Rule 3: soilMoisture > 60%
│  │  └─ Action: STOP irrigation
│  └─ Rule 4: pumpActive AND flowRate < 0.1
│     └─ Action: EMERGENCY STOP (dry run)
│
├─ Fertilizer Decision Rules
│  ├─ tdsValue < 600 ppm → LOW (inject needed)
│  ├─ 600 ≤ tdsValue ≤ 1200 → OPTIMAL
│  └─ tdsValue > 1200 ppm → HIGH (risk of burn)
│
└─ Runtime Calculation
   ├─ High ET: (60 - soilMoisture) × 30 seconds
   └─ Normal: (60 - soilMoisture) × 20 seconds

Output Layer:
├─ irrigation (0 or 1)
├─ fertilizer_needed (boolean)
├─ fertilizer_level (low/optimal/high)
├─ dry_run_warning (boolean)
├─ recommended_runtime_seconds (integer)
├─ et_index (float)
└─ decision_reason (string)

Execution:
├─ Manual Override: User control, AI disabled
└─ Auto Mode: AI sends pump commands automatically
```

---

## 🛡️ Safety System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Safety Monitoring System                 │
└─────────────────────────────────────────────────────────────┘

Monitor 1: Dry Run Detection
├─ Trigger: pumpActive = true AND flowRate < 0.1 L/min
├─ Timeout: 5 seconds
├─ Action:
│  ├─ Turn pump OFF immediately
│  ├─ Publish dry-run-alert = 1
│  └─ Log to Serial Monitor
└─ Reset: When flow detected or pump manually restarted

Monitor 2: Soil Response Check
├─ Trigger: Pump running for 60+ seconds
├─ Check: soilMoisture increase < 2% from start
├─ Action:
│  ├─ Publish soil-warning = 1
│  └─ Log to Serial Monitor
└─ Reset: When pump stops

Monitor 3: MQTT Connection Watchdog
├─ Check: mqtt.connected() every loop
├─ Action on disconnect:
│  ├─ Attempt reconnection (3 retries)
│  ├─ If failed: ESP32 restart
│  └─ Log to Serial Monitor
└─ Prevents: Zombie state (no commands received)

Monitor 4: Memory Leak Detection
├─ Check: ESP.getFreeHeap() every 10 seconds
├─ Threshold: < 50,000 bytes
├─ Action:
│  ├─ Log warning to Serial Monitor
│  └─ Consider restart if critical
└─ Prevents: System crashes

Monitor 5: Relay Failsafe
├─ Check: Pump state matches command
├─ Action on mismatch:
│  ├─ Re-send GPIO command
│  └─ Log to Serial Monitor
└─ Prevents: Stuck relay
```

---

## 📈 Performance Characteristics

### Latency

| Operation | Latency | Notes |
|-----------|---------|-------|
| Sensor read | < 10ms | Local ADC/digital read |
| MQTT publish | 50-200ms | Network dependent |
| MQTT receive | 50-200ms | Near real-time |
| Dashboard poll | 4000ms | Configurable interval |
| Pump activation | < 50ms | GPIO to relay |
| Total command latency | 4-5s | Limited by polling |

### Throughput

| Metric | Value | Limit |
|--------|-------|-------|
| Sensor readings/sec | 0.25 | Every 4 seconds |
| MQTT publishes/min | 150 | 10 feeds × 15/min |
| API calls/min | 150 | Dashboard polling |
| Max rate (free tier) | 30/min | Adafruit IO limit |
| Recommended rate | 15/min | 50% safety margin |

### Reliability

| Component | MTBF | Recovery |
|-----------|------|----------|
| ESP32 | 100,000 hours | Auto-restart |
| WiFi connection | 99.9% uptime | Auto-reconnect |
| MQTT connection | 99.9% uptime | Auto-reconnect (3 retries) |
| Adafruit IO | 99.9% SLA | Retry with backoff |
| Relay | 100,000 cycles | Manual replacement |

---

## 🔧 Maintenance Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Maintenance Points                       │
└─────────────────────────────────────────────────────────────┘

Hardware Maintenance:
├─ Soil Sensor
│  ├─ Clean every 2 weeks (remove mineral buildup)
│  └─ Recalibrate every month
├─ Flow Sensor
│  ├─ Clean filter every week
│  └─ Check for debris monthly
├─ TDS Sensor
│  ├─ Clean probe every 2 weeks
│  └─ Calibrate with standard solution monthly
├─ Relay
│  ├─ Check for burning/pitting every 3 months
│  └─ Replace if contacts damaged
└─ Pump
   ├─ Check impeller every month
   └─ Replace if flow rate drops

Software Maintenance:
├─ Firmware Updates
│  ├─ Check for ESP32 core updates quarterly
│  └─ Update libraries as needed
├─ Adafruit IO Key Rotation
│  ├─ Rotate every 6 months
│  └─ Update both ESP32 and dashboard
├─ Dashboard Updates
│  ├─ Update dependencies monthly
│  └─ Security patches immediately
└─ Data Cleanup
   ├─ Adafruit IO: 30-day auto-cleanup
   └─ Local logs: Manual cleanup as needed

Monitoring:
├─ Daily: Check dashboard for alerts
├─ Weekly: Review Serial Monitor logs
├─ Monthly: Verify all sensors accurate
└─ Quarterly: Full system test
```

---

## 🎓 Learning Resources

### Understanding the Architecture

1. **MQTT Protocol**
   - Publish/Subscribe pattern
   - Quality of Service (QoS) levels
   - Topic structure

2. **ESP32 Capabilities**
   - Dual-core processor
   - WiFi/Bluetooth
   - ADC resolution (12-bit)
   - GPIO capabilities

3. **React State Management**
   - useState for local state
   - useEffect for side effects
   - useCallback for memoization

4. **IoT Best Practices**
   - Sensor calibration
   - Data validation
   - Error handling
   - Security considerations

---

## ✅ Architecture Validation Checklist

- [ ] All components have clear responsibilities
- [ ] Data flows are unidirectional where possible
- [ ] Error handling at every layer
- [ ] Security implemented at multiple layers
- [ ] Monitoring and logging throughout
- [ ] Scalability considered (multiple zones possible)
- [ ] Maintainability (modular design)
- [ ] Documentation complete
- [ ] Testing strategy defined
- [ ] Disaster recovery plan (auto-restart, reconnect)

---

**This architecture provides a robust, scalable, and maintainable smart irrigation system!** 🏗️🌱
