const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../src/models/User');
const MarketplaceListing = require('../src/models/MarketplaceListing');

const products = [
    {
        productType: 'input',
        productRef: 'Organic Urea Fertilizer',
        pricePerUnit: 450,
        unit: 'bag',
        quantity: 100,
        description: 'High quality organic urea for better crop yield. 50kg bag.',
        imageUrl: 'https://images.unsplash.com/photo-1627920769842-894768393af8?auto=format&fit=crop&q=80&w=600',
        location: 'Kochi'
    },
    {
        productType: 'crop',
        productRef: { name: 'Premium Wheat Seeds', variety: 'HD-2967' },
        pricePerUnit: 40,
        unit: 'kg',
        quantity: 500,
        description: 'Disease resistant wheat variety, suitable for all soil types.',
        imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=600',
        location: 'Punjab'
    },
    {
        productType: 'rent',
        productRef: { name: 'John Deere Tractor', brand: 'John Deere 5310' },
        pricePerUnit: 1200, // Daily rent
        unit: 'day',
        quantity: 1,
        description: '55HP Tractor with Rotavator. Available for daily rental.',
        imageUrl: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?auto=format&fit=crop&q=80&w=600',
        location: 'Kochi',
        rentPrice: { daily: 1200 },
        deposit: 5000
    },
    {
        productType: 'livestock',
        productRef: { breed: 'Jersey Cow', age: '3 years' },
        pricePerUnit: 45000,
        unit: 'unit',
        quantity: 2,
        description: 'Healthy Jersey cow, 12L daily milk capacity.',
        imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=600',
        location: 'Thrissur'
    },
    {
        productType: 'input',
        productRef: 'Drip Irrigation Kit',
        pricePerUnit: 15000,
        unit: 'set',
        quantity: 5,
        description: 'Complete drip irrigation kit for 1 acre land coverage.',
        imageUrl: 'https://images.unsplash.com/photo-1615811361524-60924040a1b6?auto=format&fit=crop&q=80&w=600',
        location: 'Kochi'
    },
    {
        productType: 'crop',
        productRef: { name: 'Basmati Rice', variety: 'Pusa 1121' },
        pricePerUnit: 85,
        unit: 'kg',
        quantity: 1000,
        description: 'Export quality long grain Basmati rice. Fresh harvest.',
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600',
        location: 'Punjab'
    },
    {
        productType: 'rent',
        productRef: { name: 'Combine Harvester', brand: 'Claas' },
        pricePerUnit: 2500,
        unit: 'hour',
        quantity: 1,
        description: 'Heavy duty harvester for efficient crop harvesting.',
        imageUrl: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&q=80&w=600',
        location: 'Haryana',
        rentPrice: { daily: 20000 },
        deposit: 10000
    },
    {
        productType: 'input',
        productRef: 'Pest Control Spray',
        pricePerUnit: 550,
        unit: 'litre',
        quantity: 50,
        description: 'Organic pest control solution, safe for vegetables.',
        imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=600',
        location: 'Kochi'
    },
    {
        productType: 'livestock',
        productRef: { breed: 'Goat', age: '1 year' },
        pricePerUnit: 8000,
        unit: 'unit',
        quantity: 10,
        description: 'Malabari goat breed, healthy and vaccinated.',
        imageUrl: 'https://images.unsplash.com/photo-1586410972828-091a92df4488?auto=format&fit=crop&q=80&w=600',
        location: 'Kozhikode'
    },
    {
        productType: 'crop',
        productRef: { name: 'Tomato', variety: 'Hybrid' },
        pricePerUnit: 25,
        unit: 'kg',
        quantity: 200,
        description: 'Fresh farm picked tomatoes. Red and juicy.',
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600',
        location: 'Kochi'
    }
];

const seedMarketplace = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Find a Seller
        const seller = await User.findOne({ email: 'abhijithmnair2002@gmail.com' });
        if (!seller) {
            console.error('❌ Vendor user not found! Please run seedSpecificVendor.js first.');
            process.exit(1);
        }

        // 2. Clear Existing Products
        await MarketplaceListing.deleteMany({});
        console.log('🗑️  Cleared existing marketplace listings');

        // 3. Insert New Products
        const listings = products.map(p => ({
            seller: seller._id,
            productType: p.productType,
            productRef: p.productRef,
            quantity: p.quantity,
            unit: p.unit,
            pricePerUnit: p.pricePerUnit,
            location: p.location,
            description: p.description,
            images: [p.imageUrl], // Format as array
            status: 'active',
            isDeleted: false,
            // Add rental specific fields if type is rent (schema might need adjustment or mixed type handling)
            ...(p.productType === 'rent' ? { rentPrice: p.rentPrice, deposit: p.deposit } : {})
        }));

        await MarketplaceListing.insertMany(listings);
        console.log(`✨ Successfully seeded ${listings.length} products with images!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedMarketplace();
