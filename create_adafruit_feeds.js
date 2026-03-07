#!/usr/bin/env node

/**
 * Adafruit IO Feed Creator
 * 
 * This script automatically creates all required feeds for the
 * ESP32 Smart Irrigation System.
 * 
 * Usage:
 *   node create_adafruit_feeds.js YOUR_USERNAME YOUR_AIO_KEY
 */

const https = require('https');

// Feed definitions
const FEEDS = [
  { key: 'pump-control', name: 'Pump Control', description: 'Command to turn pump ON/OFF (0 or 1)' },
  { key: 'pump-status', name: 'Pump Status', description: 'Actual pump state feedback (0 or 1)' },
  { key: 'soil-moisture', name: 'Soil Moisture', description: 'Soil moisture percentage (0-100%)' },
  { key: 'temperature', name: 'Temperature', description: 'Ambient temperature in Celsius' },
  { key: 'humidity', name: 'Humidity', description: 'Relative humidity percentage (0-100%)' },
  { key: 'tds', name: 'TDS', description: 'Total Dissolved Solids - fertilizer concentration (ppm)' },
  { key: 'flow-rate', name: 'Flow Rate', description: 'Water flow rate (L/min)' },
  { key: 'water-volume', name: 'Water Volume', description: 'Total water dispensed (liters)' },
  { key: 'dry-run-alert', name: 'Dry Run Alert', description: 'Dry run detection alert (0 or 1)' },
  { key: 'soil-warning', name: 'Soil Warning', description: 'Soil not responding to irrigation (0 or 1)' }
];

// Get credentials from command line
const [,, username, aioKey] = process.argv;

if (!username || !aioKey) {
  console.error('❌ Usage: node create_adafruit_feeds.js YOUR_USERNAME YOUR_AIO_KEY');
  console.error('');
  console.error('Example:');
  console.error('  node create_adafruit_feeds.js Abhijith2002 aio_xxxxxxxxxxxx');
  console.error('');
  console.error('Get your AIO Key from: https://io.adafruit.com/');
  process.exit(1);
}

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║   Adafruit IO Feed Creator                            ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log('');
console.log(`Username: ${username}`);
console.log(`Creating ${FEEDS.length} feeds...`);
console.log('');

// Function to create a feed
function createFeed(feed) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      feed: {
        key: feed.key,
        name: feed.name,
        description: feed.description
      }
    });

    const options = {
      hostname: 'io.adafruit.com',
      port: 443,
      path: `/api/v2/${username}/feeds`,
      method: 'POST',
      headers: {
        'X-AIO-Key': aioKey,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 201) {
          console.log(`✅ Created: ${feed.key}`);
          resolve({ success: true, feed: feed.key });
        } else if (res.statusCode === 422) {
          // Feed already exists
          console.log(`⚠️  Already exists: ${feed.key}`);
          resolve({ success: true, feed: feed.key, existed: true });
        } else {
          console.error(`❌ Failed: ${feed.key} (Status: ${res.statusCode})`);
          console.error(`   Response: ${body}`);
          resolve({ success: false, feed: feed.key, error: body });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Error creating ${feed.key}:`, error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Create all feeds sequentially
async function createAllFeeds() {
  const results = [];
  
  for (const feed of FEEDS) {
    const result = await createFeed(feed);
    results.push(result);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Summary                                             ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  
  const created = results.filter(r => r.success && !r.existed).length;
  const existed = results.filter(r => r.existed).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Created: ${created}`);
  console.log(`⚠️  Already existed: ${existed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('');

  if (failed === 0) {
    console.log('🎉 All feeds are ready!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update ESP32 firmware with your credentials');
    console.log('2. Update frontend .env file');
    console.log('3. Upload ESP32 firmware');
    console.log('4. Start dashboard: npm run dev');
  } else {
    console.log('⚠️  Some feeds failed to create. Check errors above.');
    console.log('You may need to create them manually at: https://io.adafruit.com/feeds');
  }
}

// Run the script
createAllFeeds().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
