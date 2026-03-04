/**
 * createWeatherMonitoringIndexes.js
 * 
 * Creates optimized database indexes for farm weather monitoring system
 * 
 * Run this script once to set up indexes:
 * node src/scripts/createWeatherMonitoringIndexes.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Farm = require('../models/Farm');
const WeatherAlert = require('../models/WeatherAlert');
const User = require('../models/User');
const Notification = require('../models/Notifications');

/**
 * Create indexes for optimal query performance
 */
const createIndexes = async () => {
    try {
        console.log('🔧 Creating database indexes for weather monitoring...\n');
        
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');
        
        // Farm indexes
        console.log('📍 Creating Farm indexes...');
        await Farm.collection.createIndex(
            { 'location.coordinates': '2dsphere' },
            { name: 'location_coordinates_2dsphere' }
        );
        console.log('  ✓ Geospatial index on location.coordinates');
        
        await Farm.collection.createIndex(
            { user: 1, 'location.coordinates': 1 },
            { name: 'user_location_compound' }
        );
        console.log('  ✓ Compound index on user + location.coordinates');
        
        await Farm.collection.createIndex(
            { user: 1 },
            { name: 'user_index' }
        );
        console.log('  ✓ Index on user field\n');
        
        // WeatherAlert indexes
        console.log('🌦️  Creating WeatherAlert indexes...');
        await WeatherAlert.collection.createIndex(
            { user: 1, alertType: 1, sentAt: -1 },
            { name: 'user_alertType_sentAt_compound' }
        );
        console.log('  ✓ Compound index on user + alertType + sentAt (for cooldown checks)');
        
        await WeatherAlert.collection.createIndex(
            { farm: 1, sentAt: -1 },
            { name: 'farm_sentAt_compound' }
        );
        console.log('  ✓ Compound index on farm + sentAt');
        
        await WeatherAlert.collection.createIndex(
            { alertType: 1, sentAt: -1 },
            { name: 'alertType_sentAt_compound' }
        );
        console.log('  ✓ Compound index on alertType + sentAt (for statistics)');
        
        await WeatherAlert.collection.createIndex(
            { sentAt: 1 },
            { name: 'sentAt_ttl', expireAfterSeconds: 2592000 } // 30 days
        );
        console.log('  ✓ TTL index on sentAt (auto-delete after 30 days)');
        
        await WeatherAlert.collection.createIndex(
            { expiresAt: 1 },
            { name: 'expiresAt_index' }
        );
        console.log('  ✓ Index on expiresAt\n');
        
        // User indexes
        console.log('👤 Creating User indexes...');
        await User.collection.createIndex(
            { isActive: 1, roles: 1 },
            { name: 'isActive_roles_compound' }
        );
        console.log('  ✓ Compound index on isActive + roles\n');
        
        // Notification indexes
        console.log('🔔 Creating Notification indexes...');
        await Notification.collection.createIndex(
            { recipient: 1, type: 1, createdAt: -1 },
            { name: 'recipient_type_createdAt_compound' }
        );
        console.log('  ✓ Compound index on recipient + type + createdAt');
        
        await Notification.collection.createIndex(
            { recipient: 1, isRead: 1, createdAt: -1 },
            { name: 'recipient_isRead_createdAt_compound' }
        );
        console.log('  ✓ Compound index on recipient + isRead + createdAt\n');
        
        // Verify indexes
        console.log('🔍 Verifying indexes...\n');
        
        const farmIndexes = await Farm.collection.indexes();
        console.log(`Farm indexes (${farmIndexes.length}):`);
        farmIndexes.forEach(idx => console.log(`  - ${idx.name}`));
        
        const alertIndexes = await WeatherAlert.collection.indexes();
        console.log(`\nWeatherAlert indexes (${alertIndexes.length}):`);
        alertIndexes.forEach(idx => console.log(`  - ${idx.name}`));
        
        const userIndexes = await User.collection.indexes();
        console.log(`\nUser indexes (${userIndexes.length}):`);
        userIndexes.forEach(idx => console.log(`  - ${idx.name}`));
        
        const notificationIndexes = await Notification.collection.indexes();
        console.log(`\nNotification indexes (${notificationIndexes.length}):`);
        notificationIndexes.forEach(idx => console.log(`  - ${idx.name}`));
        
        console.log('\n✅ All indexes created successfully!');
        
    } catch (error) {
        console.error('❌ Error creating indexes:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
};

// Run the script
createIndexes();
