# Water Flow Meter Fix Guide

## Problem
The water flow meter continues to show readings even when the pump is OFF, indicating either sensor noise or improper calibration.

## Backend Software Fix (COMPLETED ✓)

The backend has been updated with the following improvements:

### 1. Noise Filtering
- Added `FLOW_NOISE_THRESHOLD = 0.1 L/min` to filter out sensor noise
- Readings below this threshold are set to 0

### 2. Pump State Validation
- Flow is forced to 0 when `pump_status` is OFF
- Only records actual flow when pump is confirmed ON

### 3. Mock Data Generator
- Updated to simulate realistic pump cycling (70% OFF, 30% ON)
- Flow only generated when pump status is ON
- Realistic flow range: 1.0 - 2.5 L/min when running

## ESP32/Arduino Firmware Fix (ACTION REQUIRED)

You need to update your ESP32/Arduino code to send pump status along with sensor data.

### Current Data Format (Assumed)
```cpp
{
  "temperature": 25.2,
  "humidity": 49,
  "soil_moisture": 100,
  "water_flow": 0.00
}
```

### Updated Data Format (Required)
```cpp
{
  "temperature": 25.2,
  "humidity": 49,
  "soil_moisture": 100,
  "water_flow": 0.00,
  "pump_status": "OFF"  // or "ON"
}
```

### Example ESP32 Code Fix

```cpp
// Global variables
volatile int flowPulseCount = 0;
float flowRate = 0.0;
bool pumpIsOn = false;
const int PUMP_PIN = 5;  // Your pump control pin
const int FLOW_SENSOR_PIN = 2;  // Your flow sensor pin

// Interrupt handler for flow sensor
void IRAM_ATTR flowPulseCounter() {
  flowPulseCount++;
}

void setup() {
  pinMode(PUMP_PIN, OUTPUT);
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), flowPulseCounter, FALLING);
}

void loop() {
  // Read other sensors
  float temperature = readTemperature();
  float humidity = readHumidity();
  float soilMoisture = readSoilMoisture();
  
  // Check pump status
  pumpIsOn = digitalRead(PUMP_PIN) == HIGH;
  
  // Calculate flow rate
  if (pumpIsOn) {
    // Only calculate flow when pump is ON
    flowRate = (flowPulseCount / 7.5);  // Adjust calibration factor for your sensor
    flowPulseCount = 0;
  } else {
    // Pump is OFF - force flow to zero
    flowRate = 0.0;
    flowPulseCount = 0;  // Reset counter
  }
  
  // Send data to backend
  String jsonData = "{";
  jsonData += "\"temperature\":" + String(temperature) + ",";
  jsonData += "\"humidity\":" + String(humidity) + ",";
  jsonData += "\"soil_moisture\":" + String(soilMoisture) + ",";
  jsonData += "\"water_flow\":" + String(flowRate, 2) + ",";
  jsonData += "\"pump_status\":\"" + String(pumpIsOn ? "ON" : "OFF") + "\"";
  jsonData += "}";
  
  // Send via HTTP POST to your backend
  sendToBackend(jsonData);
  
  delay(5000);  // Send every 5 seconds
}
```

## Hardware Troubleshooting

### 1. Check Physical Connections
- Ensure flow sensor is properly connected to the water line
- Verify sensor is oriented correctly (arrow shows flow direction)
- Check for loose wiring connections

### 2. Sensor Calibration
Different flow sensors have different pulse-per-liter ratios:
- **YF-S201**: ~450 pulses/liter (7.5 pulses/second/L/min)
- **YF-S402**: ~4380 pulses/liter
- **YF-B1**: ~96 pulses/liter

Adjust the calibration factor in your code accordingly.

### 3. Electrical Noise Reduction
```cpp
// Add debouncing to interrupt handler
unsigned long lastPulseTime = 0;
const unsigned long DEBOUNCE_TIME = 10;  // milliseconds

void IRAM_ATTR flowPulseCounter() {
  unsigned long currentTime = millis();
  if (currentTime - lastPulseTime > DEBOUNCE_TIME) {
    flowPulseCount++;
    lastPulseTime = currentTime;
  }
}
```

### 4. Power Supply Check
- Ensure flow sensor has stable 5V power supply
- Use a separate power supply for the pump to avoid voltage drops
- Add a 100µF capacitor across sensor power pins to filter noise

## Testing the Fix

### 1. Backend Testing (No Hardware Required)
The mock data generator now simulates proper pump behavior:
```bash
cd farmer_ai-backend
npm start
```

Watch the console - you should see flow readings only when pump_status is "ON".

### 2. With Real Hardware
1. Update your ESP32 firmware with the pump_status field
2. Upload the code to your ESP32
3. Monitor serial output to verify:
   - Flow is 0 when pump is OFF
   - Flow shows realistic values when pump is ON
4. Check the dashboard - flow should now correctly show 0 when pump is off

## API Endpoint

The backend endpoint expects this format:

**POST** `/api/iot/sensor-data`

```json
{
  "temperature": 25.2,
  "humidity": 49,
  "soil_moisture": 100,
  "water_flow": 1.66,
  "pump_status": "ON"
}
```

## Adafruit IO Integration

If you're using Adafruit IO, update your feed publishing:

```cpp
// Publish to Adafruit IO
aio_temperature->save(temperature);
aio_humidity->save(humidity);
aio_soil_moisture->save(soilMoisture);

// Only publish non-zero flow when pump is ON
if (pumpIsOn && flowRate > 0.1) {
  aio_water_flow->save(flowRate);
} else {
  aio_water_flow->save(0);
}

// Add pump status feed
aio_pump_status->save(pumpIsOn ? 1 : 0);
```

## Expected Results

After implementing these fixes:
- ✓ Flow meter shows 0.00 L/min when pump is OFF
- ✓ Flow meter shows realistic values (1-2.5 L/min) when pump is ON
- ✓ No more phantom flow readings
- ✓ Accurate water usage tracking

## Need More Help?

If the issue persists after these fixes:
1. Check if the flow sensor is faulty (test with multimeter)
2. Verify the sensor is compatible with your pump flow rate
3. Consider using a different flow sensor model
4. Add a relay module to completely cut power to the sensor when pump is off

## Summary

The backend software fix is complete. You now need to:
1. Update your ESP32/Arduino firmware to include `pump_status` in the data payload
2. Implement the flow rate logic that respects pump state
3. Test and verify the fix works correctly

The system will now accurately track water flow only when the pump is actually running.
