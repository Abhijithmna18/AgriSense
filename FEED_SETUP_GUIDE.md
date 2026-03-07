# Adafruit IO Feed Setup Guide

## 🚨 Problem: 404 Feed Not Found

If you see this error in your browser console:
```
Failed to load resource: the server responded with a status of 404
io.adafruit.com/api/v2/Abhijith2002/feeds/soil-warning/data/last
```

**This means the feed doesn't exist in your Adafruit IO account yet.**

---

## ✅ Solution: Create All Required Feeds

You have 3 options to create the feeds:

### Option 1: Automated Script (Recommended) ⚡

#### Using Python:
```bash
python create_adafruit_feeds.py YOUR_USERNAME YOUR_AIO_KEY
```

#### Using Node.js:
```bash
node create_adafruit_feeds.js YOUR_USERNAME YOUR_AIO_KEY
```

**Example:**
```bash
python create_adafruit_feeds.py Abhijith2002 aio_xxxxxxxxxxxx
```

**Output:**
```
╔════════════════════════════════════════════════════════╗
║   Adafruit IO Feed Creator                            ║
╚════════════════════════════════════════════════════════╝

Username: Abhijith2002
Creating 10 feeds...

✅ Created: pump-control
✅ Created: pump-status
✅ Created: soil-moisture
✅ Created: temperature
✅ Created: humidity
✅ Created: tds
✅ Created: flow-rate
✅ Created: water-volume
✅ Created: dry-run-alert
✅ Created: soil-warning

🎉 All feeds are ready!
```

---

### Option 2: Check Existing Feeds First 🔍

Before creating, check which feeds already exist:

```bash
chmod +x check_feeds.sh
./check_feeds.sh YOUR_USERNAME YOUR_AIO_KEY
```

**Output:**
```
╔════════════════════════════════════════════════════════╗
║   Checking Adafruit IO Feeds                          ║
╚════════════════════════════════════════════════════════╝

Username: Abhijith2002

✅ pump-control
✅ pump-status
✅ soil-moisture
✅ temperature
✅ humidity
✅ tds
✅ flow-rate
✅ water-volume
❌ dry-run-alert (missing)
❌ soil-warning (missing)

Summary:
✅ Exists: 8
❌ Missing: 2
```

---

### Option 3: Manual Creation (5 minutes) 🖱️

1. Go to https://io.adafruit.com
2. Log in with your account
3. Click **"Feeds"** in the left sidebar
4. Click **"New Feed"** button (blue button, top right)
5. Create each feed with these exact names:

| Feed Key | Feed Name | Description |
|----------|-----------|-------------|
| `pump-control` | Pump Control | Command to turn pump ON/OFF (0 or 1) |
| `pump-status` | Pump Status | Actual pump state feedback (0 or 1) |
| `soil-moisture` | Soil Moisture | Soil moisture percentage (0-100%) |
| `temperature` | Temperature | Ambient temperature in Celsius |
| `humidity` | Humidity | Relative humidity percentage (0-100%) |
| `tds` | TDS | Total Dissolved Solids - fertilizer concentration (ppm) |
| `flow-rate` | Flow Rate | Water flow rate (L/min) |
| `water-volume` | Water Volume | Total water dispensed (liters) |
| `dry-run-alert` | Dry Run Alert | Dry run detection alert (0 or 1) |
| `soil-warning` | Soil Warning | Soil not responding to irrigation (0 or 1) |

**Important:** Use the exact "Feed Key" values (case-sensitive, with hyphens)

---

## 📋 Required Feeds Checklist

Make sure ALL 10 feeds exist:

- [ ] `pump-control` - Dashboard sends commands here
- [ ] `pump-status` - ESP32 publishes actual pump state
- [ ] `soil-moisture` - ESP32 publishes soil moisture %
- [ ] `temperature` - ESP32 publishes temperature
- [ ] `humidity` - ESP32 publishes humidity
- [ ] `tds` - ESP32 publishes fertilizer concentration
- [ ] `flow-rate` - ESP32 publishes water flow rate
- [ ] `water-volume` - ESP32 publishes total water used
- [ ] `dry-run-alert` - ESP32 publishes dry run alerts
- [ ] `soil-warning` - ESP32 publishes soil warnings

---

## 🔐 Getting Your Adafruit IO Credentials

### 1. Get Your Username
- Go to https://io.adafruit.com
- Your username is shown in the top-right corner
- Example: `Abhijith2002`

### 2. Get Your AIO Key
- Click on **"My Key"** (yellow key icon in top-right)
- Or go to: https://io.adafruit.com/api/docs/#authentication
- Copy your **Active Key**
- Format: `aio_xxxxxxxxxxxxxxxxxxxx` (32 characters)

**⚠️ SECURITY WARNING:**
- Never share your AIO Key publicly
- Never commit it to Git
- Store it in `.env` files only

---

## 🧪 Testing After Feed Creation

### 1. Test with curl:
```bash
# Replace with your credentials
USERNAME="Abhijith2002"
AIO_KEY="aio_xxxxxxxxxxxx"

# Test reading a feed
curl -H "X-AIO-Key: $AIO_KEY" \
     "https://io.adafruit.com/api/v2/$USERNAME/feeds/soil-warning"

# Should return JSON with feed info (not 404)
```

### 2. Test with browser:
```
Open: https://io.adafruit.com/Abhijith2002/feeds/soil-warning
(Replace Abhijith2002 with your username)

Should show the feed page (not 404 error)
```

### 3. Test dashboard:
```bash
cd farmer_ai-frontend
npm run dev

# Open browser console (F12)
# Should see no 404 errors
# Dashboard should show "LIVE" status
```

---

## 🐛 Troubleshooting

### Error: "401 Unauthorized"
**Cause:** Wrong AIO Key
**Solution:** 
1. Go to https://io.adafruit.com
2. Click "My Key"
3. Copy the correct key
4. Update your `.env` file

### Error: "422 Unprocessable Entity"
**Cause:** Feed already exists
**Solution:** This is OK! The feed is already created.

### Error: "429 Too Many Requests"
**Cause:** Rate limit exceeded
**Solution:** Wait 1 minute and try again

### Script doesn't run
**Python:**
```bash
# Check Python version (need 3.x)
python --version

# If python3:
python3 create_adafruit_feeds.py USERNAME KEY
```

**Node.js:**
```bash
# Check Node version
node --version

# Run script
node create_adafruit_feeds.js USERNAME KEY
```

**Bash:**
```bash
# Make executable
chmod +x check_feeds.sh

# Run
./check_feeds.sh USERNAME KEY
```

---

## 📊 Feed Data Flow

### Control Flow (Dashboard → ESP32):
```
Dashboard
  ↓ POST value=1
pump-control feed
  ↓ MQTT subscribe
ESP32
  ↓ GPIO HIGH
Relay → Pump ON
```

### Status Flow (ESP32 → Dashboard):
```
ESP32
  ↓ MQTT publish value=1
pump-status feed
  ↓ REST API GET
Dashboard
  ↓ Display
"ACTIVE" status
```

### Sensor Flow (ESP32 → Dashboard):
```
Sensors
  ↓ Read every 4s
ESP32
  ↓ MQTT publish
soil-moisture, temperature, humidity, tds, flow-rate feeds
  ↓ REST API GET
Dashboard
  ↓ Display
Real-time charts
```

---

## ✅ Verification Steps

After creating feeds, verify everything works:

1. **Check feeds exist:**
   ```bash
   ./check_feeds.sh YOUR_USERNAME YOUR_AIO_KEY
   ```
   Should show: ✅ Exists: 10, ❌ Missing: 0

2. **Check dashboard:**
   - Open dashboard
   - Should show "LIVE" status (green)
   - No 404 errors in console

3. **Check ESP32:**
   - Open Serial Monitor
   - Should see: "✓ Data published to Adafruit IO"
   - No publish errors

4. **Test pump control:**
   - Click pump button in dashboard
   - ESP32 Serial Monitor should show: "PUMP COMMAND RECEIVED"
   - Relay should click

---

## 🎯 Quick Commands Reference

```bash
# Check which feeds exist
./check_feeds.sh Abhijith2002 aio_xxxxxxxxxxxx

# Create all feeds (Python)
python create_adafruit_feeds.py Abhijith2002 aio_xxxxxxxxxxxx

# Create all feeds (Node.js)
node create_adafruit_feeds.js Abhijith2002 aio_xxxxxxxxxxxx

# Test a specific feed
curl -H "X-AIO-Key: aio_xxxxxxxxxxxx" \
     https://io.adafruit.com/api/v2/Abhijith2002/feeds/soil-warning

# List all your feeds
curl -H "X-AIO-Key: aio_xxxxxxxxxxxx" \
     https://io.adafruit.com/api/v2/Abhijith2002/feeds
```

---

## 📞 Still Having Issues?

1. **Verify credentials:**
   - Username is correct (case-sensitive)
   - AIO Key is correct (32 characters starting with `aio_`)

2. **Check Adafruit IO status:**
   - Visit: https://status.adafruit.com
   - Ensure service is operational

3. **Check rate limits:**
   - Free tier: 30 data points/minute
   - If exceeded, wait 1 minute

4. **Manual verification:**
   - Log into https://io.adafruit.com
   - Click "Feeds"
   - Verify all 10 feeds are listed

---

## 🎉 Success!

Once all feeds are created, you should see:

✅ Dashboard shows "LIVE" status
✅ No 404 errors in browser console
✅ Sensor data updates every 4 seconds
✅ Pump button works
✅ ESP32 publishes data successfully

**Your system is now ready to use!** 🚀💧🌱
