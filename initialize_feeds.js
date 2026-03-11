#!/usr/bin/env node

const https = require('https');

const [,, username, aioKey] = process.argv;

if (!username || !aioKey) {
  console.error('❌ Usage: node initialize_feeds.js YOUR_USERNAME YOUR_AIO_KEY');
  process.exit(1);
}

function publishData(feedKey, value) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ value: String(value) });
    
    const options = {
      hostname: 'io.adafruit.com',
      port: 443,
      path: `/api/v2/${username}/feeds/${feedKey}/data`,
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
        resolve({ status: res.statusCode, body: body });
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Initializing Feeds with Data                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const feedsToInit = [
    { key: 'pump', value: 0 },
    { key: 'water-flow', value: 0 }
  ];

  try {
    for (const feed of feedsToInit) {
      console.log(`Publishing to ${feed.key}...`);
      const res = await publishData(feed.key, feed.value);
      
      if (res.status === 200 || res.status === 201) {
        console.log(`✅ ${feed.key} initialized with value: ${feed.value}\n`);
      } else {
        console.log(`❌ Failed: ${res.status}`);
        console.log(`   Response: ${res.body}\n`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('✅ All feeds initialized!');
    console.log('Refresh your dashboard now.');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
