# Irrigation System Architecture

This outlines the data flow between the React Frontend, Adafruit IO, and ESP32 hardware.

```mermaid
sequenceDiagram
    participant F as React Frontend
    participant AIO as Adafruit IO (MQTT/REST)
    participant ESP as ESP32 Controller
    participant Pump as Motor Relay
    participant Sensors as Environment Sensors

    Note over F, Sensors: Telemetry Loop (Every 4 seconds)
    Sensors->>ESP: Read Analog/Digital (I2C/ADC)
    ESP->>AIO: Publish to feeds via MQTT (temp, humidity, flow, etc.)
    AIO->>F: React polls /data/last via REST API
    F->>F: AI Decision Engine evaluates logic
    
    Note over F, Pump: Manual Control Flow
    F->>AIO: POST { "value": 1 } to pump-control
    AIO->>ESP: MQTT Push to subscribed topic
    ESP->>ESP: handlePumpCommand()
    ESP->>Pump: digitalWrite(HIGH)
    ESP->>AIO: Publish 1 to pump-status (Feedback)
    AIO->>F: React polls pump-status, UI updates to ACTIVE

    Note over F, Pump: AI Auto-Control Flow
    F->>F: AI detects Low Soil Moisture + High ET
    F->>AIO: POST { "value": 1 } to pump-control
    AIO->>ESP: MQTT Push to subscribed topic
    ESP->>Pump: Turn ON
    
    Note over ESP, Pump: Edge Safety Processing (Dry Run)
    ESP->>Sensors: Check Flow Rate
    alt Flow == 0 for 5 seconds
        ESP->>Pump: digitalWrite(LOW) (Emergency Stop)
        ESP->>AIO: Publish 1 to dry-run-alert
        AIO->>F: React displays Critical Alert
    end
```

## Core Components
1. **Frontend:** React application that serves as the command center. Implements AI logic for deciding when to water based on temperature, humidity (ET Index), and TDS.
2. **Adafruit IO:** The MQTT broker acting as the middleman.
3. **ESP32 Controller:** The edge device. It runs a non-blocking loop maintaining a persistent MQTT connection, reading local sensors, directly switching the relay, and detecting faults locally to ensure safety even if the internet disconnects.
