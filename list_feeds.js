#!/usr/bin/env node

const https = require('https');

const [,, username, aioKey] = process.argv;

if (!username || !aioKey) {
  console.error('❌ Usage: node list_feeds.js YOUR_USERNAME YOUR_AIO_KEY');
  process.exit(1);
}

function listFeeds() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'io.adafruit.com',
      port: 443,
      path: `/api/v2/${username}/feeds`,
      method: 'GET',
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
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  try {
    const feeds = await listFeeds();
    console.log('Your Adafruit IO Feeds:\n');
    feeds.forEach(f => {
      console.log(`  ${f.key}`);
    });
    console.log(`\nTotal: ${feeds.length} feeds`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
