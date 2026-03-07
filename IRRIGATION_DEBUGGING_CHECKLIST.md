# Irrigation System Debugging Checklist

If the pump is not turning on when the frontend button is pressed, or if sensor data is missing, follow this checklist to isolate the problem.

## 1. Network & Cloud Setup
- [ ] **WiFi Credentials:** Is the ESP32 connected to WiFi? Check the ESP32 Serial Monitor (baud rate 115200) for `IP: ...`.
- [ ] **Adafruit IO Credentials:** Are `AIO_USERNAME` and `AIO_KEY` correct on both the ESP32 and the frontend (`.env` file)?
- [ ] **Feeds Created:** Are all 9 feeds created in Adafruit IO with the exact keys (e.g., `pump-control`, `pump-status`)?

## 2. Frontend to Cloud (The Command)
- [ ] **Payload Structure:** Open the browser's Network Tab and click the Pump Button. Is the POST request going to `https://io.adafruit.com/api/v2/{username}/feeds/pump-control/data`?
- [ ] **Body Format:** Did the body send `{ "value": 1 }` (as an integer), not `{ "value": "1" }`?
- [ ] **API Key:** Does the header contain `X-AIO-Key: YOUR_KEY_HERE`?
- [ ] **Adafruit IO Verification:** Go to io.adafruit.com -> Feeds -> pump-control. Does the value `1` or `0` show up in the history immediately after clicking the button?

## 3. Cloud to ESP32 (The Subscription)
- [ ] **MQTT Connection:** Check the ESP32 Serial Monitor. Does it say `Connected to Adafruit IO!`?
- [ ] **Message Received:** When you send `1` via Adafruit IO dashboard or React, does the ESP32 print `PUMP COMMAND RECEIVED: ON`?
- [ ] **Subscription Timeout:** The loop uses `mqtt.readSubscription(100)`. Ensure the loop is not blocked by `delay()` calls elsewhere in the code.

## 4. ESP32 to Relay (The Hardware)
- [ ] **Relay Clicking:** When the ESP32 says "PUMP TURNED ON", do you hear an audible click from the relay?
- [ ] **Pin Assignment:** Is `PUMP_RELAY_PIN` correctly defined as 26?
- [ ] **Wiring:** Is the ESP32 pin 26 connected to the IN pin of the relay module? Are VCC and GND securely connected?

## 5. ESP32 to Cloud (The Status Feedback)
- [ ] **Status Publication:** After the pump turns on, does the ESP32 send `1` to `pump-status`?
- [ ] **Frontend Update:** Does the React Dashboard read the `pump-status` feed and update the UI to "ACTIVE"? (Wait ~2-4 seconds for the polling interval).

## 6. Safety Systems (Dry Run & Soil Response)
- [ ] **Dry Run:** If the ESP32 turns the pump ON but the flow sensor is disconnected (0 L/min) for 5 seconds, it will automatically shut off and send a `dry-run-alert`. If the pump turns off immediately, check the flow sensor.
- [ ] **Soil Warning:** If the pump runs for 60s and the soil moisture doesn't change, check if the pump is actually moving water to the plant.
