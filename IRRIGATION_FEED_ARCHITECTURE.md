# Adafruit IO Feed Architecture for Smart Irrigation

This document details the Adafruit IO feed structure required for the ESP32 Irrigation Controller and the React Frontend Dashboard to communicate correctly.

## Required Feeds

All feeds must be created under the Adafruit IO account specified by `AIO_USERNAME`.
The feed keys must exactly match the names below.

### 1. Control & Status Feeds
* **`pump-control`**
  * **Direction:** Frontend → ESP32
  * **Values:** `1` (ON), `0` (OFF)
  * **Purpose:** Command feed. The ESP32 subscribes to this feed. The frontend publishes to it when the manual override button is pressed, or when the AI decides to trigger irrigation.
* **`pump-status`**
  * **Direction:** ESP32 → Frontend
  * **Values:** `1` (Running), `0` (Stopped)
  * **Purpose:** Feedback feed. The ESP32 publishes to this feed after the relay successfully changes state. The frontend reads this to confirm the pump actually turned on or off.

### 2. Sensor Telemetry Feeds
* **`soil-moisture`**
  * **Direction:** ESP32 → Frontend
  * **Units:** Percentage (0-100%)
* **`temperature`**
  * **Direction:** ESP32 → Frontend
  * **Units:** Celsius (°C)
* **`humidity`**
  * **Direction:** ESP32 → Frontend
  * **Units:** Percentage (0-100%)
* **`tds`**
  * **Direction:** ESP32 → Frontend
  * **Units:** ppm (Parts Per Million)
* **`flow-rate`**
  * **Direction:** ESP32 → Frontend
  * **Units:** L/min (Liters per minute)
* **`water-volume`**
  * **Direction:** ESP32 → Frontend
  * **Units:** Liters (L) - Cumulative amount of water pumped

### 3. Safety & Alert Feeds
* **`dry-run-alert`**
  * **Direction:** ESP32 → Frontend
  * **Values:** `1` (Alert), `0` (Clear)
  * **Purpose:** If the pump is running but flow-rate is < 0.1 L/min for 5 seconds, the ESP32 stops the pump and publishes a `1`.
* **`soil-warning`**
  * **Direction:** ESP32 → Frontend
  * **Values:** `1` (Warning), `0` (Clear)
  * **Purpose:** If the pump runs for 60 seconds but the soil moisture does not increase by at least 2%, a `1` is published.

*Note: In the React frontend, these feeds are accessed via the Adafruit IO REST API at `https://io.adafruit.com/api/v2/{username}/feeds/{feed_key}/data`.*
