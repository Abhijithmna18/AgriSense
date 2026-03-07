#!/usr/bin/env node

/**
 * Adafruit IO Feed Creator
 * 
 * This script creates the missing feeds for your smart irrigation system.
 * 
 * Usage:
 *   node create_feeds.js
 * 
 * Make sure your .env file has:
 *   VITE_AIO_USERNAME=Abhijith2002
 *   VITE_AIO_KEY=your_aio_key
 */

require('dotenv').config({ path: './farmer_ai-frontend/.env' });

const AIO_USERNAME = process.env.VITE_AIO_USERNAME;
const AIO_KEY = process.env.VITE_AIO_KEY;

if (!AIO_USERNAME || !AIO_KEY) {
    console.error('❌ Error: VITE_AIO_USERNAME and VITE_AIO_KEY must be set in farmer_ai-frontend/.env');
    process.exit(1);
}

const BASE_URL = `https://io.adafruit.com/api/v2/${AIO_USERNAME}`;
const HEADERS = {
    'X-AIO-Key': AIO_KEY,
    'Content-Type': 'application/json'
};

// All required feeds for the smart irrigation system
const REQUIRED_FEEDS = [
    { name: 'pump-control', description: 'Pump ON/OFF command (0 or 1)' },
    { name: 'pump-status', description: 'Actual pump state feedback (0 or 1)' },
    { name: 'soil-moisture', description: 'Soil moisture percentage (0-100%)' },
    { name: 'temperature', description: 'Ambient temperature (Celsius)' },
    { name: 'humidity', description: 'Relative humidity (0-100%)' },
    { name: 'tds', description: 'Total Dissolved Solids - fertilizer concentration (ppm)' },
    { name: 'flow-rate', description: 'Water flow rate (L/min)' },
    { name: 'water-volume', description: 'Total water dispensed (liters)' },
    { name: 'dry-run-alert', description: 'Dry run detection alert (1 = alert, 0 = OK)' },
    { name: 'soil-warning', description: 'Soil not responding to irrigation (1 = warning, 0 = OK)' }
];

async function checkFeedExists(feedName) {
    try {
        const response = await fetch(`${BASE_URL}/feeds/${feedName}`, {
            headers: { 'X-AIO-Key': AIO_KEY }
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

async function createFeed(feed) {
    try {
        const response = await fetch(`${BASE_URL}/feeds`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({
                name: feed.name,
                description: feed.description
            })
        });

        if (response.ok) {
            console.log(`✅ Created feed: ${feed.name}`);
            return true;
        } else {
            const error = await response.text();
            console.error(`❌ Failed to create ${feed.name}: ${error}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error creating ${feed.name}:`, error.message);
        return false;
    }
}

async function initializeFeed(feedName, initialValue = 0) {
    try {
        const response = await fetch(`${BASE_URL}/feeds/${feedName}/data`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({ value: String(initialValue) })
        });

        if (response.ok) {
            console.log(`   ↳ Initialized ${feedName} with value: ${initialValue}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`   ↳ Failed to initialize ${feedName}`);
        return false;
    }
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   Adafruit IO Feed Creator for Smart Irrigation       ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log(`Username: ${AIO_USERNAME}`);
    console.log(`Checking ${REQUIRED_FEEDS.length} required feeds...\n`);

    let created = 0;
    let existing = 0;
    let failed = 0;

    for (const feed of REQUIRED_FEEDS) {
        const exists = await checkFeedExists(feed.name);

        if (exists) {
            console.log(`⏭️  Feed already exists: ${feed.name}`);
            existing++;
        } else {
            console.log(`📝 Creating feed: ${feed.name}`);
            const success = await createFeed(feed);
            
            if (success) {
                created++;
                // Initialize alert feeds with 0
                if (feed.name === 'dry-run-alert' || feed.name === 'soil-warning') {
                    await initializeFeed(feed.name, 0);
                }
            } else {
                failed++;
            }
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                      SUMMARY                           ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`✅ Existing feeds: ${existing}`);
    console.log(`🆕 Created feeds: ${created}`);
    if (failed > 0) {
        console.log(`❌ Failed: ${failed}`);
    }
    console.log(`📊 Total feeds: ${existing + created}/${REQUIRED_FEEDS.length}`);

    if (created > 0) {
        console.log('\n🎉 New feeds created successfully!');
        console.log('   Refresh your dashboard to see the changes.');
    }

    if (existing + created === REQUIRED_FEEDS.length) {
        console.log('\n✅ All required feeds are now available!');
        console.log('   Your smart irrigation system is ready to use.');
    }
}

main().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
});
