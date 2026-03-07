# Create Missing Adafruit IO Feeds

## Problem
Your dashboard is showing 404 errors for these feeds:
- `dry-run-alert`
- `soil-warning`

These are optional safety alert feeds, but creating them will stop the 404 errors.

## Solution: Create the Feeds

### Option 1: Via Adafruit IO Web Interface (Easiest)

1. Go to https://io.adafruit.com
2. Log in with username: `Abhijith2002`
3. Click on "Feeds" in the left sidebar
4. Click "New Feed" button
5. Create these two feeds:

**Feed 1:**
- Name: `dry-run-alert`
- Description: `Dry run detection alert (1 = alert, 0 = OK)`
- Click "Create"

**Feed 2:**
- Name: `soil-warning`
- Description: `Soil not responding to irrigation (1 = warning, 0 = OK)`
- Click "Create"

### Option 2: Via API (Advanced)

Run this command (replace YOUR_AIO_KEY with your actual key):

```bash
# Create dry-run-alert feed
curl -X POST https://io.adafruit.com/api/v2/Abhijith2002/feeds \
  -H "X-AIO-Key: YOUR_AIO_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"dry-run-alert","description":"Dry run detection alert"}'

# Create soil-warning feed
curl -X POST https://io.adafruit.com/api/v2/Abhijith2002/feeds \
  -H "X-AIO-Key: YOUR_AIO_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"soil-warning","description":"Soil not responding to irrigation"}'
```

### Option 3: Initialize Feeds with Data

Once created, initialize them with a value of 0:

```bash
# Initialize dry-run-alert to 0
curl -X POST https://io.adafruit.com/api/v2/Abhijith2002/feeds/dry-run-alert/data \
  -H "X-AIO-Key: YOUR_AIO_KEY" \
  -H "Content-Type: application/json" \
  -d '{"value":"0"}'

# Initialize soil-warning to 0
curl -X POST https://io.adafruit.com/api/v2/Abhijith2002/feeds/soil-warning/data \
  -H "X-AIO-Key: YOUR_AIO_KEY" \
  -H "Content-Type: application/json" \
  -d '{"value":"0"}'
```

## Why These Feeds Are Important

### dry-run-alert
- **Purpose**: Detects when pump is running but no water is flowing
- **Values**: 
  - `0` = Normal operation
  - `1` = DRY RUN DETECTED (pump auto-stopped)
- **Published by**: ESP32 when flow sensor reads 0 L/min for 5+ seconds while pump is ON
- **Safety**: Prevents pump damage from running dry

### soil-warning
- **Purpose**: Detects when irrigation runs but soil moisture doesn't increase
- **Values**:
  - `0` = Normal operation
  - `1` = Soil not responding (check sensor or water distribution)
- **Published by**: ESP32 after 60 seconds of irrigation if moisture hasn't increased by 2%
- **Diagnostic**: Helps identify sensor issues or water distribution problems

## After Creating Feeds

1. Refresh your dashboard
2. The 404 errors should stop
3. The dashboard will display alert status when ESP32 publishes to these feeds

## Current Feed Status

✅ **Existing feeds** (working):
- `pump-control`
- `pump-status`
- `soil-moisture`
- `temperature`
- `humidity`
- `tds`
- `flow-rate`
- `water-volume`

❌ **Missing feeds** (causing 404 errors):
- `dry-run-alert`
- `soil-warning`

## Note

The dashboard code already handles missing feeds gracefully - it returns `0` when a feed doesn't exist. The 404 errors you see are just browser console logs and don't break functionality. However, creating these feeds will:
1. Stop the console spam
2. Enable safety alerts when ESP32 detects issues
3. Complete your IoT system architecture

## Quick Check

After creating the feeds, verify they exist:

```bash
curl -H "X-AIO-Key: YOUR_AIO_KEY" \
  https://io.adafruit.com/api/v2/Abhijith2002/feeds
```

You should see all 10 feeds listed.
