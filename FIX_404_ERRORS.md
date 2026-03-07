# Fix 404 Errors - Missing Adafruit IO Feeds

## 🔍 Problem Identified

Your dashboard is showing repeated 404 errors for these feeds:
```
GET https://io.adafruit.com/api/v2/Abhijith2002/feeds/dry-run-alert/data/last 404 (Not Found)
GET https://io.adafruit.com/api/v2/Abhijith2002/feeds/soil-warning/data/last 404 (Not Found)
```

**Root Cause**: These two safety alert feeds haven't been created in your Adafruit IO account yet.

## ✅ Quick Fix (Choose One Method)

### Method 1: Automatic Creation (Easiest) ⭐

Run the provided script to automatically create all missing feeds:

```bash
# Install dependencies (if not already installed)
npm install dotenv

# Run the feed creator script
node create_feeds.js
```

**Expected output:**
```
╔════════════════════════════════════════════════════════╗
║   Adafruit IO Feed Creator for Smart Irrigation       ║
╚════════════════════════════════════════════════════════╝

Username: Abhijith2002
Checking 10 required feeds...

⏭️  Feed already exists: pump-control
⏭️  Feed already exists: pump-status
⏭️  Feed already exists: soil-moisture
⏭️  Feed already exists: temperature
⏭️  Feed already exists: humidity
⏭️  Feed already exists: tds
⏭️  Feed already exists: flow-rate
⏭️  Feed already exists: water-volume
📝 Creating feed: dry-run-alert
✅ Created feed: dry-run-alert
   ↳ Initialized dry-run-alert with value: 0
📝 Creating feed: soil-warning
✅ Created feed: soil-warning
   ↳ Initialized soil-warning with value: 0

╔════════════════════════════════════════════════════════╗
║                      SUMMARY                           ║
╚════════════════════════════════════════════════════════╝
✅ Existing feeds: 8
🆕 Created feeds: 2
📊 Total feeds: 10/10

🎉 New feeds created successfully!
   Refresh your dashboard to see the changes.

✅ All required feeds are now available!
   Your smart irrigation system is ready to use.
```

### Method 2: Manual Creation via Web Interface

1. Go to https://io.adafruit.com
2. Log in with username: `Abhijith2002`
3. Click "Feeds" in left sidebar
4. Click "New Feed" button

**Create Feed 1:**
- Name: `dry-run-alert`
- Description: `Dry run detection alert (1 = alert, 0 = OK)`
- Click "Create"
- Click on the feed → "Add Data" → Enter `0` → Save

**Create Feed 2:**
- Name: `soil-warning`
- Description: `Soil not responding to irrigation (1 = warning, 0 = OK)`
- Click "Create"
- Click on the feed → "Add Data" → Enter `0` → Save

### Method 3: Using cURL Commands

```bash
# Replace YOUR_AIO_KEY with your actual key from farmer_ai-frontend/.env

# Create dry-run-alert feed
curl -X POST https://io.adafruit.com/api/v2/Abhijith2002/feeds \
  -H "X-AIO-Key: YOUR_AIO_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"dry-run-alert","description":"Dry run detection alert"}'

# Initialize with 0
curl -X POST https://io.adafruit.com/api/v2/Abhijith2002/feeds/dry-run-alert/data \
  -H "X-AIO-Key: YOUR_AIO_KEY" \
  -H "Content-Type: application/json" \
  -d '{"value":"0"}'

# Create soil-warning feed
curl -X POST https://io.adafruit.com/api/v2/Abhijith2002/feeds \
  -H "X-AIO-Key: YOUR_AIO_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"soil-warning","description":"Soil not responding to irrigation"}'

# Initialize with 0
curl -X POST https://io.adafruit.com/api/v2/Abhijith2002/feeds/soil-warning/data \
  -H "X-AIO-Key: YOUR_AIO_KEY" \
  -H "Content-Type: application/json" \
  -d '{"value":"0"}'
```

## 🔍 Verify Feeds Created

After creating the feeds, verify they exist:

```bash
# List all your feeds
curl -H "X-AIO-Key: YOUR_AIO_KEY" \
  https://io.adafruit.com/api/v2/Abhijith2002/feeds | jq '.[].name'
```

**Expected output:**
```
"pump-control"
"pump-status"
"soil-moisture"
"temperature"
"humidity"
"tds"
"flow-rate"
"water-volume"
"dry-run-alert"
"soil-warning"
```

## 🎯 After Creating Feeds

1. **Refresh your dashboard** (Ctrl+R or Cmd+R)
2. **Check browser console** - 404 errors should be gone
3. **Dashboard should show "LIVE" status** without errors

## 📊 Complete Feed List

Your system requires these 10 feeds:

| Feed Name | Type | Direction | Status |
|-----------|------|-----------|--------|
| `pump-control` | Command | Dashboard → ESP32 | ✅ Exists |
| `pump-status` | Status | ESP32 → Dashboard | ✅ Exists |
| `soil-moisture` | Sensor | ESP32 → Dashboard | ✅ Exists |
| `temperature` | Sensor | ESP32 → Dashboard | ✅ Exists |
| `humidity` | Sensor | ESP32 → Dashboard | ✅ Exists |
| `tds` | Sensor | ESP32 → Dashboard | ✅ Exists |
| `flow-rate` | Sensor | ESP32 → Dashboard | ✅ Exists |
| `water-volume` | Sensor | ESP32 → Dashboard | ✅ Exists |
| `dry-run-alert` | Alert | ESP32 → Dashboard | ❌ Missing |
| `soil-warning` | Alert | ESP32 → Dashboard | ❌ Missing |

## 🛡️ What These Alert Feeds Do

### dry-run-alert
**Purpose**: Safety feature to prevent pump damage

**How it works**:
1. ESP32 monitors flow sensor while pump is ON
2. If flow rate < 0.1 L/min for 5 seconds → DRY RUN DETECTED
3. ESP32 automatically stops pump
4. Publishes `dry-run-alert = 1` to Adafruit IO
5. Dashboard shows critical alert: "🚨 DRY RUN DETECTED!"

**Why it's important**:
- Prevents pump from running dry (can damage motor)
- Detects empty water tank
- Detects clogged pipes or broken connections

### soil-warning
**Purpose**: Diagnostic feature to detect irrigation issues

**How it works**:
1. ESP32 records soil moisture when pump starts
2. After 60 seconds of irrigation, checks moisture level
3. If moisture hasn't increased by at least 2% → SOIL WARNING
4. Publishes `soil-warning = 1` to Adafruit IO
5. Dashboard shows warning: "⚠️ Soil not responding to irrigation"

**Why it's important**:
- Detects faulty soil sensor
- Detects water not reaching plants (broken drip lines)
- Detects sensor placement issues

## 🔧 Troubleshooting

### Issue: Script fails with "Cannot find module 'dotenv'"

**Solution**:
```bash
npm install dotenv
```

### Issue: Script fails with "VITE_AIO_KEY must be set"

**Solution**:
Check your `.env` file:
```bash
cat farmer_ai-frontend/.env
```

Should contain:
```
VITE_AIO_USERNAME=Abhijith2002
VITE_AIO_KEY=aio_xxxxxxxxxxxx
```

### Issue: 401 Unauthorized error

**Solution**:
- Your AIO_KEY is incorrect
- Get new key from https://io.adafruit.com → "My Key"
- Update `farmer_ai-frontend/.env`

### Issue: Still seeing 404 errors after creating feeds

**Solution**:
1. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Restart dev server:
   ```bash
   cd farmer_ai-frontend
   npm run dev
   ```

## 📈 Expected Behavior After Fix

### Before (Current State):
```
❌ Console flooded with 404 errors
❌ Errors repeat every 4 seconds
❌ Annoying but not breaking functionality
```

### After (Fixed State):
```
✅ No 404 errors in console
✅ Dashboard loads cleanly
✅ Alert feeds ready for ESP32 to publish
✅ Safety features fully operational
```

## 🎓 Understanding the Code

Your dashboard already handles missing feeds gracefully:

```javascript
const missingFeeds = new Set();

const aioFetch = (feed) => {
    // If we already know the feed is missing, don't spam the network
    if (missingFeeds.has(feed)) return Promise.resolve(0);

    return fetch(`${AIO_BASE}/${feed}/data/last`, { headers: AIO_HEADERS })
        .then(r => {
            if (!r.ok) {
                if (r.status === 404) missingFeeds.add(feed);
                return { value: 0 }; // Return 0 for missing feeds
            }
            return r.json();
        })
        .then(d => parseFloat(d.value) || 0)
        .catch(err => {
            return 0; // Final fallback
        });
};
```

**What this does**:
- First 404: Logs error, adds feed to `missingFeeds` set, returns 0
- Subsequent calls: Returns 0 immediately without network request
- **Result**: Dashboard works, but console shows initial 404 errors

**Why you still see many 404s**:
- Dashboard polls every 4 seconds
- Each poll fetches both `dry-run-alert` and `soil-warning`
- Browser logs each 404 before code can cache it
- Creates console spam

**Solution**: Create the feeds to eliminate 404s entirely

## ✅ Success Checklist

After creating the feeds, verify:

- [ ] No 404 errors in browser console
- [ ] Dashboard shows "LIVE" status
- [ ] All sensor readings display correctly
- [ ] Pump control button works
- [ ] No error messages in dashboard
- [ ] ESP32 can publish to alert feeds (when connected)

## 🚀 Next Steps

Once feeds are created:

1. **Test the system**:
   - Click pump button
   - Verify pump turns ON/OFF
   - Check sensor readings update

2. **Connect ESP32** (if not already):
   - Upload firmware with your credentials
   - Verify ESP32 publishes sensor data
   - Test pump control from dashboard

3. **Test safety features**:
   - Dry run: Turn pump ON without water
   - Wait 5 seconds → should auto-stop
   - Check dashboard for alert

4. **Monitor system**:
   - Watch for alerts
   - Verify AI decision engine works
   - Check historical data charts

## 📞 Need Help?

If you still see issues after creating feeds:

1. Check browser console for different errors
2. Verify all 10 feeds exist in Adafruit IO
3. Check `.env` file has correct credentials
4. Try hard refresh (Ctrl+Shift+R)
5. Restart dev server

---

**TL;DR**: Run `node create_feeds.js` to automatically create the missing feeds and stop the 404 errors. ✨
