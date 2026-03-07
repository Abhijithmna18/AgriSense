# Troubleshooting Flowchart

## 🔍 Systematic Problem Diagnosis

Use this flowchart to diagnose and fix issues quickly.

---

## Problem: Pump Doesn't Turn ON

```
START: User clicks "Pump ON" button
    ↓
Does dashboard show any error message?
    ├─ YES → Check browser console
    │         ├─ "Failed to publish" → Check Adafruit IO credentials in .env
    │         ├─ "Network error" → Check internet connection
    │         └─ Other error → See error-specific solutions below
    │
    └─ NO → Continue
         ↓
    Does dashboard show "LIVE" status?
        ├─ NO → Dashboard not connected to Adafruit IO
        │       ├─ Check VITE_AIO_USERNAME in .env
        │       ├─ Check VITE_AIO_KEY in .env
        │       ├─ Verify feeds exist in Adafruit IO
        │       └─ Refresh dashboard page
        │
        └─ YES → Continue
             ↓
        Check Adafruit IO website
        Go to Feeds → pump-control
        Does it show latest value = 1?
            ├─ NO → Frontend not publishing correctly
            │       ├─ Check browser console for errors
            │       ├─ Verify AIO_KEY is correct
            │       ├─ Test with curl command:
            │       │   curl -H "X-AIO-Key: YOUR_KEY" \
            │       │     -d '{"value":"1"}' \
            │       │     https://io.adafruit.com/api/v2/USER/feeds/pump-control/data
            │       └─ If curl works, issue is in frontend code
            │
            └─ YES → Continue
                 ↓
            Check ESP32 Serial Monitor
            Does it show "PUMP COMMAND RECEIVED: ON"?
                ├─ NO → ESP32 not receiving MQTT messages
                │       ├─ Check ESP32 WiFi connection
                │       ├─ Check "Connected to Adafruit IO" message
                │       ├─ Verify AIO_USERNAME and AIO_KEY in ESP32 code
                │       ├─ Check feed name is exactly "pump-control"
                │       └─ Press ESP32 reset button and retry
                │
                └─ YES → Continue
                     ↓
                Does Serial Monitor show "✓ PUMP TURNED ON"?
                    ├─ NO → Code execution issue
                    │       ├─ Check for error messages in Serial Monitor
                    │       ├─ Verify pumpON() function is called
                    │       └─ Re-upload firmware
                    │
                    └─ YES → Continue
                         ↓
                    Measure voltage on GPIO 26
                    Is it 3.3V?
                        ├─ NO → GPIO pin issue
                        │       ├─ Check pin definition in code
                        │       ├─ Try different GPIO pin
                        │       └─ ESP32 may be damaged
                        │
                        └─ YES → Continue
                             ↓
                        Check relay module
                        Does LED light up?
                            ├─ NO → Relay not receiving signal
                            │       ├─ Check relay IN pin connection
                            │       ├─ Check relay VCC (should be 5V)
                            │       ├─ Check relay GND connection
                            │       └─ Test relay with direct 3.3V to IN pin
                            │
                            └─ YES → Continue
                                 ↓
                            Do you hear relay click?
                                ├─ NO → Relay module faulty
                                │       └─ Replace relay module
                                │
                                └─ YES → Continue
                                     ↓
                                Measure voltage across relay output (COM-NO)
                                Does it match pump power supply voltage?
                                    ├─ NO → Relay contacts issue
                                    │       └─ Replace relay module
                                    │
                                    └─ YES → Continue
                                         ↓
                                    Check pump motor
                                    Does it run when connected directly to power?
                                        ├─ NO → Pump motor faulty
                                        │       └─ Replace pump motor
                                        │
                                        └─ YES → Check pump power supply
                                             └─ Verify voltage and current rating

SOLUTION FOUND ✓
```

---

## Problem: Dashboard Shows "OFFLINE"

```
START: Dashboard displays "OFFLINE" status
    ↓
Open browser console (F12)
Are there any error messages?
    ├─ YES → Read error message
    │       ├─ "Failed to fetch" → Network issue
    │       │   ├─ Check internet connection
    │       │   └─ Try different network
    │       │
    │       ├─ "401 Unauthorized" → Invalid credentials
    │       │   ├─ Check VITE_AIO_KEY in .env
    │       │   └─ Regenerate key in Adafruit IO
    │       │
    │       └─ "404 Not Found" → Feed doesn't exist
    │           └─ Create missing feeds in Adafruit IO
    │
    └─ NO → Continue
         ↓
    Check .env file
    Does it have VITE_AIO_USERNAME and VITE_AIO_KEY?
        ├─ NO → Add credentials to .env file
        │       └─ Restart dev server (npm run dev)
        │
        └─ YES → Continue
             ↓
        Test Adafruit IO connection manually
        Open: https://io.adafruit.com/api/v2/YOUR_USERNAME/feeds
        Add header: X-AIO-Key: YOUR_KEY
            ├─ Returns feed list → Credentials are correct
            │   └─ Issue is in frontend code
            │
            └─ Returns error → Credentials are wrong
                └─ Update .env file with correct values

SOLUTION FOUND ✓
```

---

## Problem: Sensor Readings Show "—"

```
START: Dashboard shows "—" for sensor values
    ↓
Check ESP32 Serial Monitor
Are sensor readings being printed?
    ├─ NO → ESP32 not reading sensors
    │       ├─ Check sensor power connections (3.3V/5V)
    │       ├─ Check sensor GND connections
    │       ├─ Check sensor signal pin connections
    │       ├─ Test each sensor individually
    │       └─ Verify pin definitions in code match wiring
    │
    └─ YES → Continue
         ↓
    Does Serial Monitor show "✓ Data published to Adafruit IO"?
        ├─ NO → Publishing failed
        │       ├─ Check MQTT connection status
        │       ├─ Verify feed names match exactly
        │       └─ Check for "Failed to publish" errors
        │
        └─ YES → Continue
             ↓
        Check Adafruit IO website
        Go to Feeds → Select a sensor feed
        Does it show recent data (< 10 seconds old)?
            ├─ NO → Data not reaching Adafruit IO
            │       ├─ Check ESP32 MQTT connection
            │       ├─ Verify feed names are correct
            │       └─ Check Adafruit IO account status
            │
            └─ YES → Continue
                 ↓
            Dashboard is not fetching data
            Check browser console for fetch errors
                ├─ Errors present → Fix based on error message
                └─ No errors → Check fetchAdafruitFeeds() function

SOLUTION FOUND ✓
```

---

## Problem: "DRY RUN DETECTED" Alert

```
START: Dashboard shows dry run alert
    ↓
Is pump actually running?
    ├─ NO → False alert
    │       ├─ Check pump-status feed value
    │       ├─ Verify ESP32 pumpActive variable
    │       └─ May be stale alert from previous run
    │
    └─ YES → Continue
         ↓
    Check flow sensor
    Is water actually flowing?
        ├─ NO → Real dry run condition
        │       ├─ Check water supply
        │       ├─ Check for blockages
        │       ├─ Check pump inlet
        │       └─ Verify pump is primed
        │
        └─ YES → Continue
             ↓
        Flow sensor not detecting flow
        Check flow sensor wiring
            ├─ VCC connected to 5V?
            ├─ GND connected?
            ├─ Signal pin to GPIO 25?
            └─ Sensor oriented correctly (arrow shows flow direction)?
                 ↓
            Test flow sensor
            Manually spin turbine
            Does Serial Monitor show pulse count increasing?
                ├─ NO → Flow sensor faulty
                │       └─ Replace flow sensor
                │
                └─ YES → Check flow rate calculation
                     └─ Adjust calibration factor in code

SOLUTION FOUND ✓
```

---

## Problem: ESP32 Won't Connect to WiFi

```
START: Serial Monitor shows WiFi connection failed
    ↓
Check WiFi credentials in code
Are WIFI_SSID and WIFI_PASS correct?
    ├─ NO → Update credentials
    │       └─ Re-upload firmware
    │
    └─ YES → Continue
         ↓
    Check WiFi network
    Is it 2.4GHz?
        ├─ NO → ESP32 doesn't support 5GHz
        │       └─ Use 2.4GHz network or create guest network
        │
        └─ YES → Continue
             ↓
        Is WiFi network visible?
            ├─ NO → Network issue
            │       ├─ Check router is on
            │       ├─ Check SSID broadcast is enabled
            │       └─ Move ESP32 closer to router
            │
            └─ YES → Continue
                 ↓
            Does WiFi have MAC filtering?
                ├─ YES → Add ESP32 MAC address to whitelist
                │       └─ MAC shown in Serial Monitor on boot
                │
                └─ NO → Continue
                     ↓
                Does WiFi require captive portal login?
                    ├─ YES → ESP32 can't handle captive portals
                    │       └─ Use different network
                    │
                    └─ NO → Try different ESP32 board
                         └─ Current board may have WiFi hardware issue

SOLUTION FOUND ✓
```

---

## Problem: Pump Runs But Soil Moisture Doesn't Increase

```
START: "SOIL NOT RESPONDING" alert appears
    ↓
Is water actually flowing?
    ├─ NO → Check pump and water supply
    │       └─ See "Pump Doesn't Turn ON" flowchart
    │
    └─ YES → Continue
         ↓
    Check soil moisture sensor
    Is it in the soil?
        ├─ NO → Insert sensor into soil
        │       └─ Ensure good contact
        │
        └─ YES → Continue
             ↓
        Is sensor near irrigation point?
            ├─ NO → Water not reaching sensor
            │       ├─ Move sensor closer to irrigation
            │       ├─ Check water distribution
            │       └─ Verify drip lines/sprinklers working
            │
            └─ YES → Continue
                 ↓
            Test sensor manually
            Pour water directly on sensor
            Does reading increase?
                ├─ NO → Sensor faulty
                │       └─ Replace soil moisture sensor
                │
                └─ YES → Irrigation distribution issue
                     ├─ Check for clogged emitters
                     ├─ Verify water pressure
                     └─ Adjust irrigation layout

SOLUTION FOUND ✓
```

---

## Problem: TDS Readings Incorrect

```
START: TDS shows unrealistic values
    ↓
What is the reading?
    ├─ Always 0 → Sensor not connected
    │   ├─ Check VCC to 3.3V
    │   ├─ Check GND connection
    │   └─ Check AOUT to GPIO 35
    │
    ├─ Always 4095 (max) → Sensor short circuit
    │   ├─ Check for water in connector
    │   ├─ Dry sensor thoroughly
    │   └─ Check for damaged wires
    │
    └─ Fluctuating wildly → Needs calibration
         ↓
    Calibrate TDS sensor
    1. Clean sensor probe
    2. Test in distilled water (should read ~0)
    3. Test in calibration solution (1413 µS/cm)
    4. Adjust formula in code if needed
         ↓
    Still incorrect?
        └─ Replace TDS sensor

SOLUTION FOUND ✓
```

---

## Quick Diagnostic Commands

### Test Adafruit IO Connection
```bash
# Replace with your credentials
curl -H "X-AIO-Key: YOUR_KEY" \
  https://io.adafruit.com/api/v2/YOUR_USERNAME/feeds
```

### Test Pump Control Feed
```bash
# Send pump ON command
curl -H "X-AIO-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"value":"1"}' \
  https://io.adafruit.com/api/v2/YOUR_USERNAME/feeds/pump-control/data
```

### Check Feed Latest Value
```bash
curl -H "X-AIO-Key: YOUR_KEY" \
  https://io.adafruit.com/api/v2/YOUR_USERNAME/feeds/pump-status/data/last
```

---

## Common Error Messages & Solutions

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `Failed to publish to pump-control` | Invalid AIO key | Check .env file |
| `Cannot reach Adafruit IO` | Network issue | Check internet connection |
| `WiFi connection failed` | Wrong credentials | Update SSID/password |
| `MQTT connection failed` | Invalid AIO credentials | Verify username/key |
| `Failed to read temperature` | DHT sensor issue | Check DHT wiring |
| `Relay not responding` | Wiring issue | Check GPIO 26 connection |
| `Flow sensor timeout` | Sensor not connected | Check GPIO 25 wiring |

---

## Emergency Procedures

### System Won't Stop Pumping
1. **Immediate:** Unplug pump power supply
2. Check ESP32 Serial Monitor for errors
3. Verify relay is de-energizing
4. Check for stuck relay contacts
5. Replace relay if necessary

### ESP32 Keeps Restarting
1. Check power supply (needs stable 5V 2A)
2. Check for short circuits
3. Remove all sensors and test ESP32 alone
4. Re-upload firmware
5. Try different ESP32 board

### Dashboard Completely Unresponsive
1. Clear browser cache
2. Check browser console for errors
3. Restart dev server
4. Verify .env file exists and is correct
5. Try different browser

---

## Prevention Checklist

To avoid common issues:

- [ ] Use quality jumper wires (avoid loose connections)
- [ ] Secure all connections with heat shrink or tape
- [ ] Use adequate power supply (5V 2A minimum)
- [ ] Keep ESP32 and sensors dry
- [ ] Regular maintenance of sensors
- [ ] Monitor Serial output for warnings
- [ ] Keep firmware updated
- [ ] Document any custom calibrations
- [ ] Test system regularly
- [ ] Have spare components available

---

**Remember:** Most issues are wiring or configuration problems, not code bugs!

Always start with the basics:
1. Check power
2. Check connections
3. Check credentials
4. Check Serial Monitor
5. Test components individually
