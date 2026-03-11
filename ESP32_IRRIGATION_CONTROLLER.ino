/*
 * ESP32 Smart Irrigation & Fertigation Controller
 * 
 * Hardware:
 * - ESP32 DevKit
 * - Relay Module (Pump Control)
 * - Capacitive Soil Moisture Sensor
 * - DHT11 Temperature & Humidity Sensor
 * - TDS Sensor (Fertilizer Monitoring)
 * - Water Flow Sensor (YF-S201 or similar)
 * 
 * Adafruit IO Integration:
 * - Publishes sensor data every 4 seconds
 * - Subscribes to pump-control commands
 * - Publishes pump-status feedback
 * - Implements dry-run protection
 * - Monitors soil response to irrigation
 */

#include <WiFi.h>
#include "Adafruit_MQTT.h"
#include "Adafruit_MQTT_Client.h"
#include <DHT.h>

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION - UPDATE THESE VALUES
// ═══════════════════════════════════════════════════════════════════════════

// WiFi Credentials
#define WIFI_SSID "moto g82 5G"
#define WIFI_PASS "Abhijith123"

// Adafruit IO Credentials
#define AIO_SERVER "io.adafruit.com"
#define AIO_SERVERPORT 1883
#define AIO_USERNAME "your_adafruit_username"
#define AIO_KEY "your_adafruit_io_key"

// Pin Definitions
#define PUMP_RELAY_PIN 26        // Relay control pin
#define SOIL_MOISTURE_PIN 34     // Analog pin for soil moisture
#define DHT_PIN 27               // DHT11 data pin
#define TDS_SENSOR_PIN 35        // Analog pin for TDS sensor
#define FLOW_SENSOR_PIN 25       // Digital pin for flow sensor

// Sensor Configuration
#define DHT_TYPE DHT11
#define SOIL_DRY_VALUE 4095      // Calibrate: value when soil is dry
#define SOIL_WET_VALUE 1500      // Calibrate: value when soil is wet
#define TDS_VREF 3.3             // ESP32 ADC reference voltage
#define TDS_SCOUNT 30            // Sample count for TDS averaging

// Safety Thresholds
#define DRY_RUN_TIMEOUT 5000     // 5 seconds with no flow = dry run
#define SOIL_RESPONSE_TIMEOUT 60000  // 60 seconds to see soil moisture increase

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL VARIABLES
// ═══════════════════════════════════════════════════════════════════════════

// WiFi and MQTT
WiFiClient client;
Adafruit_MQTT_Client mqtt(&client, AIO_SERVER, AIO_SERVERPORT, AIO_USERNAME, AIO_KEY);

// Sensors
DHT dht(DHT_PIN, DHT_TYPE);

// Flow Sensor
volatile int flowPulseCount = 0;
float flowRate = 0.0;
unsigned long flowLastTime = 0;

// Pump State
bool pumpActive = false;
unsigned long pumpStartTime = 0;
float soilMoistureAtPumpStart = 0;

// Dry Run Detection
unsigned long pumpOnWithNoFlowStart = 0;
bool dryRunDetected = false;

// Soil Response Monitoring
bool soilWarning = false;

// Water Volume Tracking
float totalWaterVolume = 0.0;

// ═══════════════════════════════════════════════════════════════════════════
// ADAFRUIT IO FEEDS
// ═══════════════════════════════════════════════════════════════════════════

// Publish Feeds (ESP32 → Adafruit IO → Dashboard)
Adafruit_MQTT_Publish feed_pump_status = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/pump");
Adafruit_MQTT_Publish feed_soil_moisture = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/soil-moisture");
Adafruit_MQTT_Publish feed_temperature = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/temperature");
Adafruit_MQTT_Publish feed_humidity = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/humidity");
Adafruit_MQTT_Publish feed_tds = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/tds");
Adafruit_MQTT_Publish feed_flow_rate = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/water-flow");
Adafruit_MQTT_Publish feed_water_volume = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/water-volume");
Adafruit_MQTT_Publish feed_dry_run_alert = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/dry-run-alert");

// Subscribe Feed (Dashboard → Adafruit IO → ESP32)
Adafruit_MQTT_Subscribe feed_pump_control = Adafruit_MQTT_Subscribe(&mqtt, AIO_USERNAME "/feeds/pump");

// ═══════════════════════════════════════════════════════════════════════════
// INTERRUPT SERVICE ROUTINE - Flow Sensor
// ═══════════════════════════════════════════════════════════════════════════

void IRAM_ATTR flowPulseCounter() {
  flowPulseCount++;
}

// ═══════════════════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════════════════

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n");
  Serial.println("╔════════════════════════════════════════════════════════╗");
  Serial.println("║   ESP32 Smart Irrigation & Fertigation Controller     ║");
  Serial.println("╚════════════════════════════════════════════════════════╝");
  Serial.println();
  
  // Initialize pins
  pinMode(PUMP_RELAY_PIN, OUTPUT);
  digitalWrite(PUMP_RELAY_PIN, HIGH);  // Pump OFF initially (Active-LOW relay)
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), flowPulseCounter, FALLING);
  
  // Initialize sensors
  dht.begin();
  
  // Connect to WiFi
  connectWiFi();
  
  // Setup MQTT subscriptions
  mqtt.subscribe(&feed_pump_control);
  
  // Connect to Adafruit IO
  connectMQTT();
  
  Serial.println("✓ System initialized successfully");
  Serial.println("✓ Ready to receive commands\n");
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════════════════════

void loop() {
  // Maintain MQTT connection
  if (!mqtt.connected()) {
    connectMQTT();
  }
  
  // Process incoming MQTT messages (non-blocking, 100ms timeout)
  Adafruit_MQTT_Subscribe *subscription;
  while ((subscription = mqtt.readSubscription(100))) {
    if (subscription == &feed_pump_control) {
      handlePumpCommand((char *)feed_pump_control.lastread);
    }
  }
  
  // Read and publish sensor data every 60 seconds
  static unsigned long lastSensorRead = 0;
  if (millis() - lastSensorRead >= 60000) {
    readAndPublishSensors();
    lastSensorRead = millis();
  }
  
  // Calculate flow rate every second
  static unsigned long lastFlowCalc = 0;
  if (millis() - lastFlowCalc >= 1000) {
    calculateFlowRate();
    lastFlowCalc = millis();
  }
  
  // Safety checks
  checkDryRun();
  checkSoilResponse();
  
  // Keep MQTT alive
  mqtt.ping();
}

// ═══════════════════════════════════════════════════════════════════════════
// WIFI CONNECTION
// ═══════════════════════════════════════════════════════════════════════════

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" ✓");
    Serial.print("WiFi connected! IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(" ✗");
    Serial.println("WiFi connection failed! Restarting...");
    ESP.restart();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MQTT CONNECTION
// ═══════════════════════════════════════════════════════════════════════════

void connectMQTT() {
  if (mqtt.connected()) return;
  
  Serial.print("Connecting to Adafruit IO");
  
  int8_t ret;
  uint8_t retries = 3;
  
  while ((ret = mqtt.connect()) != 0) {
    Serial.println(mqtt.connectErrorString(ret));
    Serial.println("Retrying MQTT connection in 5 seconds...");
    mqtt.disconnect();
    delay(5000);
    retries--;
    if (retries == 0) {
      Serial.println("MQTT connection failed! Restarting...");
      ESP.restart();
    }
  }
  
  Serial.println(" ✓");
  Serial.println("Connected to Adafruit IO!");
}

// ═══════════════════════════════════════════════════════════════════════════
// PUMP CONTROL
// ═══════════════════════════════════════════════════════════════════════════

void handlePumpCommand(char *data) {
  int command = atoi(data);
  
  Serial.println("\n╔════════════════════════════════════════╗");
  Serial.print("║  PUMP COMMAND RECEIVED: ");
  Serial.print(command == 1 ? "ON " : "OFF");
  Serial.println("  ║");
  Serial.println("╚════════════════════════════════════════╝");
  
  if (command == 1) {
    pumpON();
  } else {
    pumpOFF();
  }
}

void pumpON() {
  if (pumpActive) {
    Serial.println("⚠ Pump already ON");
    return;
  }
  
  digitalWrite(PUMP_RELAY_PIN, LOW);   // Active-LOW relay ON
  pumpActive = true;
  pumpStartTime = millis();
  soilMoistureAtPumpStart = readSoilMoisture();
  pumpOnWithNoFlowStart = 0;
  dryRunDetected = false;
  soilWarning = false;
  
  Serial.println("✓ PUMP TURNED ON");
  Serial.print("  Soil moisture at start: ");
  Serial.print(soilMoistureAtPumpStart);
  Serial.println("%");
  
  // Publish pump status
  feed_pump_status.publish((uint32_t)1);
  feed_dry_run_alert.publish((uint32_t)0);  // Clear any previous alerts
}

void pumpOFF() {
  if (!pumpActive) {
    Serial.println("⚠ Pump already OFF");
    return;
  }
  
  digitalWrite(PUMP_RELAY_PIN, HIGH);  // Active-LOW relay OFF
  pumpActive = false;
  
  unsigned long runtime = (millis() - pumpStartTime) / 1000;
  Serial.println("✓ PUMP TURNED OFF");
  Serial.print("  Runtime: ");
  Serial.print(runtime);
  Serial.println(" seconds");
  
  // Publish pump status
  feed_pump_status.publish((uint32_t)0);
}

// ═══════════════════════════════════════════════════════════════════════════
// SENSOR READING
// ═══════════════════════════════════════════════════════════════════════════

float readSoilMoisture() {
  int rawValue = analogRead(SOIL_MOISTURE_PIN);
  // Convert to percentage (0% = dry, 100% = wet)
  float moisture = map(rawValue, SOIL_DRY_VALUE, SOIL_WET_VALUE, 0, 100);
  moisture = constrain(moisture, 0, 100);
  return moisture;
}

float readTemperature() {
  float temp = dht.readTemperature();
  if (isnan(temp)) {
    Serial.println("⚠ Failed to read temperature");
    return 25.0;  // Default value
  }
  return temp;
}

float readHumidity() {
  float hum = dht.readHumidity();
  if (isnan(hum)) {
    Serial.println("⚠ Failed to read humidity");
    return 50.0;  // Default value
  }
  return hum;
}

float readTDS() {
  int analogBuffer[TDS_SCOUNT];
  int analogBufferIndex = 0;
  
  // Take multiple samples
  for (int i = 0; i < TDS_SCOUNT; i++) {
    analogBuffer[i] = analogRead(TDS_SENSOR_PIN);
    delay(10);
  }
  
  // Sort and get median
  for (int i = 0; i < TDS_SCOUNT - 1; i++) {
    for (int j = i + 1; j < TDS_SCOUNT; j++) {
      if (analogBuffer[i] > analogBuffer[j]) {
        int temp = analogBuffer[i];
        analogBuffer[i] = analogBuffer[j];
        analogBuffer[j] = temp;
      }
    }
  }
  
  // Average middle samples
  float averageVoltage = 0;
  for (int i = 2; i < TDS_SCOUNT - 2; i++) {
    averageVoltage += analogBuffer[i];
  }
  averageVoltage = averageVoltage / (TDS_SCOUNT - 4);
  averageVoltage = (averageVoltage / 4095.0) * TDS_VREF;
  
  // Convert voltage to TDS value
  float tdsValue = (133.42 * averageVoltage * averageVoltage * averageVoltage 
                    - 255.86 * averageVoltage * averageVoltage 
                    + 857.39 * averageVoltage) * 0.5;
  
  return tdsValue;
}

void calculateFlowRate() {
  // YF-S201 flow sensor: ~450 pulses per liter (7.5 pulses per second per L/min)
  flowRate = (flowPulseCount / 7.5);  // L/min
  flowPulseCount = 0;
  
  // Update total volume if pump is running
  if (pumpActive && flowRate > 0) {
    totalWaterVolume += (flowRate / 60.0);  // Add liters per second
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLISH SENSOR DATA
// ═══════════════════════════════════════════════════════════════════════════

void readAndPublishSensors() {
  Serial.println("\n─── Sensor Reading ───");
  
  float soilMoisture = readSoilMoisture();
  float temperature = readTemperature();
  float humidity = readHumidity();
  float tds = readTDS();
  
  Serial.print("Soil Moisture: "); Serial.print(soilMoisture); Serial.println("%");
  Serial.print("Temperature: "); Serial.print(temperature); Serial.println("°C");
  Serial.print("Humidity: "); Serial.print(humidity); Serial.println("%");
  Serial.print("TDS: "); Serial.print(tds); Serial.println(" ppm");
  Serial.print("Flow Rate: "); Serial.print(flowRate); Serial.println(" L/min");
  Serial.print("Total Volume: "); Serial.print(totalWaterVolume); Serial.println(" L");
  Serial.print("Pump Status: "); Serial.println(pumpActive ? "ON" : "OFF");
  
  // Publish to Adafruit IO
  if (!feed_soil_moisture.publish(soilMoisture)) {
    Serial.println("✗ Failed to publish soil moisture");
  }
  if (!feed_temperature.publish(temperature)) {
    Serial.println("✗ Failed to publish temperature");
  }
  if (!feed_humidity.publish(humidity)) {
    Serial.println("✗ Failed to publish humidity");
  }
  if (!feed_tds.publish(tds)) {
    Serial.println("✗ Failed to publish TDS");
  }
  if (!feed_flow_rate.publish(flowRate)) {
    Serial.println("✗ Failed to publish flow rate");
  }
  if (!feed_water_volume.publish(totalWaterVolume)) {
    Serial.println("✗ Failed to publish water volume");
  }
  
  Serial.println("✓ Data published to Adafruit IO");
}

// ═══════════════════════════════════════════════════════════════════════════
// SAFETY CHECKS
// ═══════════════════════════════════════════════════════════════════════════

void checkDryRun() {
  if (!pumpActive) {
    pumpOnWithNoFlowStart = 0;
    return;
  }
  
  // Check if pump is running but no flow detected
  if (flowRate < 0.1) {  // Less than 0.1 L/min = no flow
    if (pumpOnWithNoFlowStart == 0) {
      pumpOnWithNoFlowStart = millis();
    } else if (millis() - pumpOnWithNoFlowStart >= DRY_RUN_TIMEOUT) {
      if (!dryRunDetected) {
        Serial.println("\n╔════════════════════════════════════════╗");
        Serial.println("║  🚨 DRY RUN DETECTED!                 ║");
        Serial.println("║  Pump running with no water flow      ║");
        Serial.println("║  Shutting down pump for safety        ║");
        Serial.println("╚════════════════════════════════════════╝\n");
        
        dryRunDetected = true;
        pumpOFF();
        feed_dry_run_alert.publish((uint32_t)1);
      }
    }
  } else {
    pumpOnWithNoFlowStart = 0;  // Reset if flow detected
  }
}

void checkSoilResponse() {
  if (!pumpActive) return;
  
  unsigned long pumpRuntime = millis() - pumpStartTime;
  
  // Check after 60 seconds of irrigation
  if (pumpRuntime >= SOIL_RESPONSE_TIMEOUT && !soilWarning) {
    float currentMoisture = readSoilMoisture();
    float moistureIncrease = currentMoisture - soilMoistureAtPumpStart;
    
    // If soil moisture hasn't increased by at least 2%
    if (moistureIncrease < 2.0) {
      Serial.println("\n╔════════════════════════════════════════╗");
      Serial.println("║  ⚠️  SOIL NOT RESPONDING              ║");
      Serial.println("║  Irrigation running but no moisture   ║");
      Serial.println("║  increase detected. Check system.     ║");
      Serial.println("╚════════════════════════════════════════╝\n");
      
      soilWarning = true;
    }
  }
}
