#!/usr/bin/env node

const https = require('https');

const [,, username, aioKey] = process.argv;

if (!username || !aioKey) {
  console.error('❌ Usage: node diagnose_feeds.js YOUR_USERNAME YOUR_AIO_KEY');
  process.exit(1);
}

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'io.adafruit.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'X-AIO-Key': aioKey,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        resolve({ status: res.statusCode, body: body });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Adafruit IO Feed Diagnostics                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Get all feeds
    const feedsRes = await makeRequest(`/api/v2/${username}/feeds`);
    const feeds = JSON.parse(feedsRes.body);

    console.log(`Found ${feeds.length} feeds:\n`);
    
    for (const feed of feeds) {
      console.log(`Feed: ${feed.key}`);
      console.log(`  ID: ${feed.id}`);
      console.log(`  Group: ${feed.group_id || 'default'}`);
      
      // Try to fetch last data point
      const dataRes = await makeRequest(`/api/v2/${username}/feeds/${feed.key}/data/last`);
      if (dataRes.status === 200) {
        const data = JSON.parse(dataRes.body);
        console.log(`  Last Value: ${data.value}`);
        console.log(`  Status: ✅ Accessible`);
      } else {
        console.log(`  Status: ❌ NOT Accessible (${dataRes.status})`);
      }
      console.log('');
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
