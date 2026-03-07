# Adafruit IO Feed Configuration Guide

## Overview
This guide explains how to configure Adafruit IO feeds for the AI Irrigation & Fertigation Dashboard.

## Required Adafruit IO Feeds

### Input Feeds (ESP32 → Adafruit IO → Dashboard)
These feeds receive sensor data from your ESP32 device:

1. **soil-moisture**
   - Type: Numeric
   - Unit: Percentage (%)
   - Range: 0-100
   - Description: Soil moisture level from capacitive sensor

2. **temperature**
   - Type: Numeric
   - Unit: Celsius (°C)
   - Range: 0-50
   - Description: Ambient temperature from DHT sensor

3. **humidity**
   - Type: Numeric
   - Unit: Percentage (%)
   - Range: 0-100
   - Description: Relative humidity from DHT sensor

4. **tds**
   - Type: Numeric
   - Unit: PPM (parts per million)
   - Range: 0-2000
   - Description: Total Dissolved Solids for fertilizer monitoring

5. **water-flow**
   - Type: Numeric
   - Unit: L/min (liters per minute)
   - Range: 0-10
   - Description: Water flow rate from flow sensor

### Output Feeds (Dashboard → Adafruit IO → ESP32)
These feeds control the irrigation system:

6. **pump**
   - Type: Numeric (0 or 1)
   - Description: Main pump control (AI-controlled)
   - Values:
     - 0 = Pump OFF
     - 1 = Pump ON

7. **manual-pump**
   - Type: Numeric (0 or 1)
   - Description: Manual pump override control
   - Values:
     - 0 = Pump OFF
     - 1 = Pump ON

## Setup Instructions

### Step 1: Create Adafruit IO Account
1. Go to https://io.adafruit.com
2. Sign up for a free account
3. Note your username and AIO Key

### Step 2: Create Feeds
1. Navigate to "Feeds" in Adafruit IO
2. Click "New Feed" for each feed listed above
3. Use the exact feed names as specified (case-sensitive)

### Step 3: Configure Dashboard Environment Variables
Update your `.env` file in `farmer_ai-frontend`:

```env
VITE_AIO_USERNAME=your_adafruit_username
VITE_AIO_KEY=your_adafruit_io_key
```

### Step 4: ESP32 Configuration
Update your ESP32 code to publish to these feeds:

```cpp
// Adafruit IO Configuration
#define AIO_USERNAME "your_username"
#define AIO_KEY "your_aio_key"

// Feed names
#define SOIL_MOISTURE_FEED "soil-moisture"
#define TEMPERATURE_FEED "temperature"
#define HUMIDITY_FEED "humidity"
#define TDS_FEED "tds"
#define WATER_FLOW_FEED "water-flow"
#define PUMP_FEED "pump"
#define MANUAL_PUMP_FEED "manual-pump"

// Example: Publishing sensor data
void publishSensorData() {
  // Read sensors
  float soilMoisture = readSoilMoisture();
  float temperature = readTemperature();
  float humidity = readHumidity();
  float tds = readTDS();
  float flowRate = readFlowRate();
  
  // Publish to Adafruit IO
  soilMoistureFeed->save(soilMoisture);
  temperatureFeed->save(temperature);
  humidityFeed->save(humidity);
  tdsFeed->save(tds);
  waterFlowFeed->save(flowRate);
}

// Example: Subscribing to pump control
void handlePumpMessage(AdafruitIO_Data *data) {
  int pumpState = data->toInt();
  
  if (pumpState == 1) {
    digitalWrite(PUMP_PIN, HIGH);  // Turn pump ON
    Serial.println("Pump ON");
  } else {
    digitalWrite(PUMP_PIN, LOW);   // Turn pump OFF
    Serial.println("Pump OFF");
  }
}

void setup() {
  // Subscribe to pump feeds
  pumpFeed->onMessage(handlePumpMessage);
  manualPumpFeed->onMessage(handlePumpMessage);
}
```

## Data Flow

### Sensor Data Flow (ESP32 → Dashboard)
```
ESP32 Sensors → Adafruit IO Feeds → Dashboard Display
```

1. ESP32 reads sensors every 4 seconds
2. Publishes data to Adafruit IO feeds
3. Dashboard fetches latest values every 4 seconds
4. AI engine processes data and makes decisions

### Control Flow (Dashboard → ESP32)
```
Dashboard Button → Adafruit IO Feed → ESP32 Relay
```

1. User clicks pump toggle or AI makes decision
2. Dashboard publishes to `manual-pump` or `pump` feed
3. ESP32 subscribes to feed and receives command
4. ESP32 controls relay to turn pump ON/OFF

## AI Decision Logic

The dashboard automatically:
- Monitors soil moisture and triggers irrigation when < 35%
- Calculates ET (Evapotranspiration) index from temperature and humidity
- Monitors TDS levels for fertilizer management
- Detects dry-run conditions (pump ON but no flow)
- Provides recommended runtime based on moisture deficit

## Feed Update Rates

- **Sensor Inputs**: Updated every 4 seconds by ESP32
- **Dashboard Polling**: Fetches data every 4 seconds
- **Pump Control**: Immediate (real-time)

## Troubleshooting

### Dashboard shows "OFFLINE"
- Check internet connection
- Verify AIO_USERNAME and AIO_KEY in `.env` file
- Ensure Adafruit IO feeds are created with correct names

### Pump not responding
- Check ESP32 is connected to Adafruit IO
- Verify ESP32 is subscribed to `pump` and `manual-pump` feeds
- Check relay wiring and power supply

### Sensor readings show "—"
- Verify ESP32 is publishing to correct feed names
- Check sensor connections
- Ensure feeds have recent data (< 1 minute old)

### TDS readings unavailable
- Create `tds` feed in Adafruit IO
- Connect TDS sensor to ESP32
- Publish TDS values from ESP32 code

## Security Best Practices

1. **Never commit AIO_KEY to version control**
   - Use `.env` file (already in `.gitignore`)
   - Use environment variables in production

2. **Rotate AIO_KEY periodically**
   - Generate new key in Adafruit IO settings
   - Update both dashboard and ESP32

3. **Use HTTPS only**
   - Adafruit IO API uses HTTPS by default
   - Never use HTTP for API calls

## Feed Limits (Free Tier)

- **Data points per minute**: 30
- **Data storage**: 30 days
- **Active feeds**: Unlimited
- **API calls per minute**: 60

With 7 feeds updating every 4 seconds, you're well within limits.

## Example ESP32 Complete Code Snippet

```cpp
#include <WiFi.h>
#include "Adafruit_MQTT.h"
#include "Adafruit_MQTT_Client.h"

// WiFi credentials
#define WIFI_SSID "your_wifi_ssid"
#define WIFI_PASS "your_wifi_password"

// Adafruit IO
#define AIO_SERVER "io.adafruit.com"
#define AIO_SERVERPORT 1883
#define AIO_USERNAME "your_username"
#define AIO_KEY "your_aio_key"

WiFiClient client;
Adafruit_MQTT_Client mqtt(&client, AIO_SERVER, AIO_SERVERPORT, AIO_USERNAME, AIO_KEY);

// Publish feeds
Adafruit_MQTT_Publish soilMoistureFeed = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/soil-moisture");
Adafruit_MQTT_Publish temperatureFeed = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/temperature");
Adafruit_MQTT_Publish humidityFeed = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/humidity");
Adafruit_MQTT_Publish tdsFeed = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/tds");
Adafruit_MQTT_Publish waterFlowFeed = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/water-flow");

// Subscribe feeds
Adafruit_MQTT_Subscribe pumpFeed = Adafruit_MQTT_Subscribe(&mqtt, AIO_USERNAME "/feeds/pump");
Adafruit_MQTT_Subscribe manualPumpFeed = Adafruit_MQTT_Subscribe(&mqtt, AIO_USERNAME "/feeds/manual-pump");

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
  
  // Setup MQTT subscriptions
  mqtt.subscribe(&pumpFeed);
  mqtt.subscribe(&manualPumpFeed);
  
  pinMode(PUMP_PIN, OUTPUT);
}

void loop() {
  MQTT_connect();
  
  // Process incoming messages
  Adafruit_MQTT_Subscribe *subscription;
  while ((subscription = mqtt.readSubscription(1000))) {
    if (subscription == &pumpFeed || subscription == &manualPumpFeed) {
      int pumpState = atoi((char *)subscription->lastread);
      digitalWrite(PUMP_PIN, pumpState == 1 ? HIGH : LOW);
    }
  }
  
  // Publish sensor data every 4 seconds
  static unsigned long lastPublish = 0;
  if (millis() - lastPublish > 4000) {
    publishSensorData();
    lastPublish = millis();
  }
}

void MQTT_connect() {
  if (mqtt.connected()) return;
  
  Serial.print("Connecting to MQTT... ");
  int8_t ret;
  while ((ret = mqtt.connect()) != 0) {
    Serial.println(mqtt.connectErrorString(ret));
    mqtt.disconnect();
    delay(5000);
  }
  Serial.println("MQTT Connected!");
}
```

## Summary

The dashboard is now configured to use your Adafruit IO feed names:
- ✅ `soil-moisture` - Soil moisture percentage
- ✅ `temperature` - Temperature in Celsius
- ✅ `humidity` - Relative humidity percentage
- ✅ `tds` - Total Dissolved Solids (fertilizer)
- ✅ `water-flow` - Flow rate in L/min
- ✅ `pump` - Main pump control (AI)
- ✅ `manual-pump` - Manual pump override

The system will automatically fetch sensor readings and control the pump based on AI decisions or manual override.
