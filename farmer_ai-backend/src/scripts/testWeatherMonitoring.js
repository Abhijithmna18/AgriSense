/**
 * testWeatherMonitoring.js
 * 
 * Test script for farm weather monitoring system
 * 
 * Usage:
 * node src/scripts/testWeatherMonitoring.js [command] [options]
 * 
 * Commands:
 * - single <farmId>     : Test monitoring for a single farm
 * - user <userId>       : Test monitoring for all farms of a user
 * - batch [limit]       : Test batch monitoring (optional limit)
 * - stats [hours]       : Get monitoring statistics
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const farmWeatherMonitoringService = require('../services/farmWeatherMonitoringService');
const Farm = require('../models/Farm');
const User = require('../models/User');

// Load environment variables
dotenv.config();

/**
 * Connect to database
 */
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};

/**
 * Test single farm monitoring
 */
const testSingleFarm = async (farmId) => {
    console.log(`🧪 Testing single farm monitoring: ${farmId}\n`);
    
    const farm = await Farm.findById(farmId).populate('user', '_id firstName lastName email isActive');
    
    if (!farm) {
        console.error('❌ Farm not found');
        return;
    }
    
    console.log('Farm Details:');
    console.log(`  Name: ${farm.name}`);
    console.log(`  Owner: ${farm.user.firstName} ${farm.user.lastName}`);
    console.log(`  Location: ${farm.location.district}, ${farm.location.state}`);
    console.log(`  Coordinates: [${farm.location.coordinates.join(', ')}]\n`);
    
    const result = await farmWeatherMonitoringService.monitorSingleFarm(farm);
    
    console.log('Monitoring Result:');
    console.log(JSON.stringify(result, null, 2));
};

/**
 * Test user farms monitoring
 */
const testUserFarms = async (userId) => {
    console.log(`🧪 Testing user farms monitoring: ${userId}\n`);
    
    const user = await User.findById(userId);
    
    if (!user) {
        console.error('❌ User not found');
        return;
    }
    
    console.log('User Details:');
    console.log(`  Name: ${user.firstName} ${user.lastName}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Active: ${user.isActive}\n`);
    
    const result = await farmWeatherMonitoringService.monitorUserFarms(userId);
    
    console.log('Monitoring Result:');
    console.log(JSON.stringify(result, null, 2));
};

/**
 * Test batch monitoring
 */
const testBatchMonitoring = async (limit = null) => {
    console.log(`🧪 Testing batch monitoring${limit ? ` (limit: ${limit})` : ''}\n`);
    
    const result = await farmWeatherMonitoringService.monitorAllFarms({
        limit,
        batchSize: 5,
        delayBetweenBatches: 500
    });
    
    console.log('Batch Monitoring Result:');
    console.log(JSON.stringify(result, null, 2));
};

/**
 * Get monitoring statistics
 */
const getStats = async (hours = 24) => {
    console.log(`📊 Getting monitoring statistics (last ${hours} hours)\n`);
    
    const stats = await farmWeatherMonitoringService.getMonitoringStats({ hours });
    
    console.log('Statistics:');
    console.log(JSON.stringify(stats, null, 2));
};

/**
 * List available farms for testing
 */
const listFarms = async (limit = 10) => {
    console.log(`📋 Listing farms (limit: ${limit})\n`);
    
    const farms = await Farm.find()
        .populate('user', 'firstName lastName email')
        .limit(limit)
        .lean();
    
    if (farms.length === 0) {
        console.log('No farms found in database');
        return;
    }
    
    console.log(`Found ${farms.length} farms:\n`);
    farms.forEach((farm, index) => {
        console.log(`${index + 1}. ${farm.name}`);
        console.log(`   ID: ${farm._id}`);
        console.log(`   Owner: ${farm.user.firstName} ${farm.user.lastName} (${farm.user._id})`);
        console.log(`   Location: ${farm.location.district}, ${farm.location.state}`);
        console.log(`   Coordinates: ${farm.location.coordinates ? `[${farm.location.coordinates.join(', ')}]` : 'Not set'}\n`);
    });
};

/**
 * Main test runner
 */
const runTests = async () => {
    await connectDB();
    
    const command = process.argv[2];
    const arg1 = process.argv[3];
    
    try {
        switch (command) {
            case 'single':
                if (!arg1) {
                    console.error('❌ Farm ID required');
                    console.log('Usage: node testWeatherMonitoring.js single <farmId>');
                    break;
                }
                await testSingleFarm(arg1);
                break;
                
            case 'user':
                if (!arg1) {
                    console.error('❌ User ID required');
                    console.log('Usage: node testWeatherMonitoring.js user <userId>');
                    break;
                }
                await testUserFarms(arg1);
                break;
                
            case 'batch':
                const limit = arg1 ? parseInt(arg1) : null;
                await testBatchMonitoring(limit);
                break;
                
            case 'stats':
                const hours = arg1 ? parseInt(arg1) : 24;
                await getStats(hours);
                break;
                
            case 'list':
                const listLimit = arg1 ? parseInt(arg1) : 10;
                await listFarms(listLimit);
                break;
                
            default:
                console.log('Farm Weather Monitoring Test Script\n');
                console.log('Usage: node testWeatherMonitoring.js [command] [options]\n');
                console.log('Commands:');
                console.log('  list [limit]          - List available farms (default: 10)');
                console.log('  single <farmId>       - Test monitoring for a single farm');
                console.log('  user <userId>         - Test monitoring for all farms of a user');
                console.log('  batch [limit]         - Test batch monitoring (optional limit)');
                console.log('  stats [hours]         - Get monitoring statistics (default: 24 hours)\n');
                console.log('Examples:');
                console.log('  node testWeatherMonitoring.js list');
                console.log('  node testWeatherMonitoring.js single 507f1f77bcf86cd799439011');
                console.log('  node testWeatherMonitoring.js batch 5');
                console.log('  node testWeatherMonitoring.js stats 6');
        }
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
};

// Run tests
runTests();
