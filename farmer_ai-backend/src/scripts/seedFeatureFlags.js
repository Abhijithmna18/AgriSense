const mongoose = require('mongoose');
const FeatureFlag = require('../models/FeatureFlag');
require('dotenv').config();

const defaultFlags = [
    {
        name: 'AI Crop Predictions',
        key: 'ai_crop_predictions',
        description: 'Enables AI-powered crop yield predictions using machine learning models',
        isEnabled: true,
        environment: 'production',
        rolloutPercentage: 100,
        targetRoles: ['farmer']
    },
    {
        name: 'Vendor Marketplace',
        key: 'vendor_marketplace',
        description: 'Enables vendor marketplace for buying and selling agricultural products',
        isEnabled: true,
        environment: 'production',
        rolloutPercentage: 100,
        targetRoles: ['vendor', 'farmer']
    },
    {
        name: 'Warehouse Booking',
        key: 'warehouse_booking',
        description: 'Enable warehouse reservation and booking system',
        isEnabled: true,
        environment: 'production',
        rolloutPercentage: 100,
        targetRoles: []
    },
    {
        name: 'Advanced Analytics',
        key: 'advanced_analytics',
        description: 'Premium analytics dashboard with AI insights and detailed reports',
        isEnabled: true,
        environment: 'production',
        rolloutPercentage: 100,
        targetRoles: ['admin']
    },
    {
        name: 'Weather Alerts',
        key: 'weather_alerts',
        description: 'Real-time weather alerts and notifications for farmers',
        isEnabled: true,
        environment: 'production',
        rolloutPercentage: 100,
        targetRoles: ['farmer']
    },
    {
        name: 'Loan Management System',
        key: 'loan_management',
        description: 'Complete loan application and approval system',
        isEnabled: true,
        environment: 'production',
        rolloutPercentage: 100,
        targetRoles: ['farmer', 'admin']
    },
    {
        name: 'Community Forum',
        key: 'community_forum',
        description: 'Community discussion forum for farmers to share knowledge',
        isEnabled: true,
        environment: 'production',
        rolloutPercentage: 100,
        targetRoles: []
    },
    {
        name: 'Disease Detection',
        key: 'disease_detection',
        description: 'AI-powered plant disease detection from images',
        isEnabled: true,
        environment: 'production',
        rolloutPercentage: 100,
        targetRoles: ['farmer']
    },
    {
        name: 'Smart Irrigation',
        key: 'smart_irrigation',
        description: 'IoT-based smart irrigation control and monitoring',
        isEnabled: true,
        environment: 'production',
        rolloutPercentage: 50,
        targetRoles: ['farmer']
    },
    {
        name: 'New Dashboard Beta',
        key: 'new_dashboard_beta',
        description: 'New dashboard interface (beta testing)',
        isEnabled: false,
        environment: 'staging',
        rolloutPercentage: 100,
        targetRoles: []
    },
    {
        name: 'Payment Gateway',
        key: 'payment_gateway',
        description: 'Integrated payment processing system',
        isEnabled: true,
        environment: 'production',
        rolloutPercentage: 100,
        targetRoles: ['vendor', 'buyer']
    },
    {
        name: 'Crop Rotation Planner',
        key: 'crop_rotation_planner',
        description: 'AI-powered crop rotation planning and recommendations',
        isEnabled: true,
        environment: 'production',
        rolloutPercentage: 75,
        targetRoles: ['farmer']
    }
];

const seedFeatureFlags = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected...');

        // Clear existing flags (optional - comment out if you want to keep existing)
        await FeatureFlag.deleteMany({});
        console.log('Cleared existing feature flags');

        // Create flags
        const createdFlags = await FeatureFlag.insertMany(defaultFlags);
        console.log(`Created ${createdFlags.length} feature flags`);

        console.log('\nFeature Flags Created:');
        createdFlags.forEach(flag => {
            console.log(`  ✓ ${flag.name} (${flag.key}) - ${flag.isEnabled ? 'ENABLED' : 'DISABLED'}`);
        });

        console.log('\nSeeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedFeatureFlags();
