#!/usr/bin/env node

/**
 * Adafruit IO Old Feed Cleanup
 * 
 * This script lists all your feeds so you can identify which ones to delete.
 * 
 * Usage:
 *   node cleanup_old_feeds.js YOUR_USERNAME YOUR_AIO_KEY
 */

const https = require('https');

const [,, username, aioKey] = process.argv;

if (!username || !aioKey) {
  console.error('❌ Usage: node cleanup_old_feeds.js YOUR_USERNAME YOUR_AIO_KEY');
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
          console.error(`Error: ${res.statusCode}`);
          console.error(body);
          reject(new Error(`Failed to list feeds: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function deleteFeed(feedKey) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'io.adafruit.com',
      port: 443,
      path: `/api/v2/${username}/feeds/${feedKey}`,
      method: 'DELETE',
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
        if (res.statusCode === 200 || res.statusCode === 204) {
          console.log(`✅ Deleted: ${feedKey}`);
          resolve(true);
        } else {
          console.error(`❌ Failed to delete ${feedKey}: ${res.statusCode}`);
          reject(new Error(`Failed to delete feed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Adafruit IO Feed Cleanup                            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    console.log('Fetching your feeds...\n');
    const feeds = await listFeeds();

    console.log(`Found ${feeds.length} feeds:\n`);
    
    // Identify old feeds to delete
    const oldFeeds = ['pump-control', 'pump-status', 'flow-rate', 'soil-warning'];
    const feedsToDelete = feeds.filter(f => oldFeeds.includes(f.key));
    
    if (feedsToDelete.length === 0) {
      console.log('✅ No old feeds found to delete.');
      console.log('\nCurrent feeds:');
      feeds.forEach(f => console.log(`  - ${f.key}`));
      return;
    }

    console.log('Old feeds to delete:');
    feedsToDelete.forEach(f => console.log(`  ❌ ${f.key}`));
    
    console.log('\nDeleting old feeds...\n');
    
    for (const feed of feedsToDelete) {
      await deleteFeed(feed.key);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n✅ Cleanup complete!');
    console.log('You can now run: node create_adafruit_feeds.js Abhijith2002 YOUR_AIO_KEY');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
