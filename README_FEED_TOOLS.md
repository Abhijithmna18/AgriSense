# Adafruit IO Feed Management Tools

## 📦 What's Included

This package contains automated tools to create and manage Adafruit IO feeds for your ESP32 Smart Irrigation System.

### Files:

1. **create_adafruit_feeds.py** - Python script to auto-create all feeds
2. **create_adafruit_feeds.js** - Node.js script to auto-create all feeds
3. **check_feeds.sh** - Bash script to check which feeds exist
4. **FEED_SETUP_GUIDE.md** - Complete feed setup documentation
5. **FIX_404_ERROR.md** - Quick fix for 404 errors

---

## 🚀 Quick Start

### Fix 404 Error (2 minutes):

```bash
# Using Python (recommended)
python create_adafruit_feeds.py YOUR_USERNAME YOUR_AIO_KEY

# Using Node.js
node create_adafruit_feeds.js YOUR_USERNAME YOUR_AIO_KEY
```

**Example:**
```bash
python create_adafruit_feeds.py Abhijith2002 aio_xxxxxxxxxxxx
```

---

## 🔍 Check Existing Feeds

Before creating, check what already exists:

```bash
chmod +x check_feeds.sh
./check_feeds.sh YOUR_USERNAME YOUR_AIO_KEY
```

**Output:**
```
✅ pump-control
✅ pump-status
❌ soil-warning (missing)
❌ dry-run-alert (missing)

Summary:
✅ Exists: 8
❌ Missing: 2
```

---

## 📋 Required Feeds (10 Total)

| Feed | Purpose | Direction |
|------|---------|-----------|
| pump-control | Pump commands | Dashboard → ESP32 |
| pump-status | Pump state feedback | ESP32 → Dashboard |
| soil-moisture | Soil moisture % | ESP32 → Dashboard |
| temperature | Temperature °C | ESP32 → Dashboard |
| humidity | Humidity % | ESP32 → Dashboard |
| tds | Fertilizer ppm | ESP32 → Dashboard |
| flow-rate | Water flow L/min | ESP32 → Dashboard |
| water-volume | Total water L | ESP32 → Dashboard |
| dry-run-alert | Dry run detection | ESP32 → Dashboard |
| soil-warning | Soil not responding | ESP32 → Dashboard |

---

## 🔐 Getting Your Credentials

### Username:
- Go to https://io.adafruit.com
- Your username is in the top-right corner
- Example: `Abhijith2002`

### AIO Key:
- Click "My Key" (yellow key icon)
- Copy your Active Key
- Format: `aio_xxxxxxxxxxxxxxxxxxxx`

---

## 🛠️ Tool Usage

### Python Script

**Requirements:** Python 3.x (built-in, no packages needed)

**Usage:**
```bash
python create_adafruit_feeds.py USERNAME AIO_KEY
```

**Features:**
- ✅ Creates all 10 feeds automatically
- ✅ Skips feeds that already exist
- ✅ Shows detailed progress
- ✅ Provides summary report

### Node.js Script

**Requirements:** Node.js (no packages needed)

**Usage:**
```bash
node create_adafruit_feeds.js USERNAME AIO_KEY
```

**Features:**
- ✅ Same as Python script
- ✅ Uses native HTTPS module
- ✅ No npm install required

### Bash Check Script

**Requirements:** curl, bash

**Usage:**
```bash
chmod +x check_feeds.sh
./check_feeds.sh USERNAME AIO_KEY
```

**Features:**
- ✅ Checks each feed individually
- ✅ Shows which exist and which are missing
- ✅ Provides summary count
- ✅ Suggests next steps

---

## 📊 Example Output

### Successful Creation:

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

╔════════════════════════════════════════════════════════╗
║   Summary                                             ║
╚════════════════════════════════════════════════════════╝

✅ Created: 10
⚠️  Already existed: 0
❌ Failed: 0

🎉 All feeds are ready!
```

### Some Feeds Already Exist:

```
✅ Created: pump-control
⚠️  Already exists: pump-status
✅ Created: soil-moisture
⚠️  Already exists: temperature
...

Summary:
✅ Created: 6
⚠️  Already existed: 4
❌ Failed: 0

🎉 All feeds are ready!
```

---

## 🐛 Troubleshooting

### Script won't run

**Python:**
```bash
# Check version
python --version

# Try python3
python3 create_adafruit_feeds.py USERNAME KEY
```

**Node.js:**
```bash
# Check version
node --version

# Install if needed
# Windows: Download from nodejs.org
# Mac: brew install node
# Linux: sudo apt install nodejs
```

**Bash:**
```bash
# Make executable
chmod +x check_feeds.sh

# Run
./check_feeds.sh USERNAME KEY
```

### 401 Unauthorized

- Wrong AIO Key
- Get correct key from https://io.adafruit.com → "My Key"

### 422 Unprocessable Entity

- Feed already exists (this is OK!)
- Script will skip and continue

### 429 Too Many Requests

- Rate limit exceeded
- Wait 1 minute and try again

---

## ✅ Verification

After running the script:

1. **Check Adafruit IO:**
   - Go to https://io.adafruit.com/YOUR_USERNAME/feeds
   - Should see all 10 feeds listed

2. **Check Dashboard:**
   - Refresh browser (Ctrl+R)
   - Open console (F12)
   - Should see no 404 errors
   - Status should show "LIVE"

3. **Test API:**
   ```bash
   curl -H "X-AIO-Key: YOUR_KEY" \
        https://io.adafruit.com/api/v2/YOUR_USERNAME/feeds/soil-warning
   
   # Should return JSON (not 404)
   ```

---

## 🎯 Next Steps

After creating feeds:

1. ✅ Update ESP32 firmware with credentials
2. ✅ Update frontend `.env` file
3. ✅ Upload ESP32 firmware
4. ✅ Start dashboard: `npm run dev`
5. ✅ Test pump control

---

## 📚 Documentation

- **Quick fix:** `FIX_404_ERROR.md`
- **Complete setup:** `FEED_SETUP_GUIDE.md`
- **Full integration:** `ESP32_PUMP_CONTROL_INTEGRATION_GUIDE.md`
- **Troubleshooting:** `DEBUGGING_CHECKLIST.md`
- **Architecture:** `SYSTEM_ARCHITECTURE_DIAGRAM.md`

---

## 🔒 Security Notes

- ⚠️ Never commit AIO Key to Git
- ⚠️ Store in `.env` files only
- ⚠️ Add `.env` to `.gitignore`
- ⚠️ Rotate keys every 6 months

---

## 📞 Support

If you encounter issues:

1. Check `FEED_SETUP_GUIDE.md` for detailed help
2. Run `check_feeds.sh` to diagnose
3. Verify credentials at https://io.adafruit.com
4. Check Adafruit IO status: https://status.adafruit.com

---

## 🎉 Success Indicators

Your system is ready when:

✅ All 10 feeds exist in Adafruit IO
✅ Dashboard shows "LIVE" status
✅ No 404 errors in browser console
✅ Pump button works
✅ Sensor data updates every 4 seconds

**Happy irrigating!** 🚀💧🌱
