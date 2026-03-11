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
        category: 'inputs',
        name: 'Premium Saffron Bulbs',
        pricePerUnit: 12500,
        unit: 'kg',
        quantity: 50,
        description: 'High quality premium saffron bulbs for cultivation. Fresh and disease-free.',
        images: ['https://images.unsplash.com/photo-1599909533730-c1b6e3c1e9d8?w=600&q=80&fit=crop'],
        location: 'Kashmir'
    },
    {
        productType: 'input',
        category: 'inputs',
        name: 'Organic Urea Fertilizer',
        pricePerUnit: 450,
        unit: 'bag',
        quantity: 100,
        description: 'High quality organic urea for better crop yield. 50kg bag.',
        images: ['https://images.unsplash.com/photo-1627920769842-894768393af8?auto=format&fit=crop&q=80&w=600'],
        location: 'Kochi'
    },
    {
        productType: 'crop',
        category: 'inputs',
        name: 'Premium Wheat Seeds',
        pricePerUnit: 40,
        unit: 'kg',
        quantity: 500,
        description: 'Disease resistant wheat variety HD-2967, suitable for all soil types.',
        images: ['https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=600'],
        location: 'Punjab'
    },
    {
        productType: 'input',
        category: 'inputs',
        name: 'Drip Irrigation Kit',
        pricePerUnit: 15000,
        unit: 'set',
        quantity: 5,
        description: 'Complete drip irrigation kit for 1 acre land coverage with all accessories.',
        images: ['https://images.unsplash.com/photo-1615811361524-60924040a1b6?auto=format&fit=crop&q=80&w=600'],
        location: 'Kochi'
    },
    {
        productType: 'crop',
        category: 'inputs',
        name: 'Basmati Rice',
        pricePerUnit: 85,
        unit: 'kg',
        quantity: 1000,
        description: 'Export quality long grain Basmati rice Pusa 1121. Fresh harvest.',
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600'],
        location: 'Punjab'
    },
    {
        productType: 'input',
        category: 'inputs',
        name: 'Pest Control Spray',
        pricePerUnit: 550,
        unit: 'litre',
        quantity: 50,
        description: 'Organic pest control solution, safe for vegetables and fruits.',
        images: ['https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=600'],
        location: 'Kochi'
    },
    {
        productType: 'crop',
        category: 'inputs',
        name: 'Heirloom Tomatoes',
        pricePerUnit: 450,
        unit: 'kg',
        quantity: 200,
        description: 'Fresh farm picked heirloom tomatoes. Red, juicy and organic.',
        images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600'],
        location: 'Kochi'
    },
    {
        productType: 'input',
        category: 'inputs',
        name: 'Organic Wheat Seeds',
        pricePerUnit: 2800,
        unit: 'kg',
        quantity: 300,
        description: 'Certified organic wheat seeds with high germination rate.',
        images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600'],
        location: 'Haryana'
    },
    {
        productType: 'input',
        category: 'inputs',
        name: 'Potassium Nitrate Fertilizer',
        pricePerUnit: 650,
        unit: 'bag',
        quantity: 75,
        description: 'Premium potassium nitrate for enhanced crop growth and yield.',
        images: ['https://images.unsplash.com/photo-1625246333195-78d9c38ad576?auto=format&fit=crop&q=80&w=600'],
        location: 'Tamil Nadu'
    },
    {
        productType: 'crop',
        category: 'inputs',
        name: 'Hybrid Corn Seeds',
        pricePerUnit: 1200,
        unit: 'kg',
        quantity: 150,
        description: 'High yielding hybrid corn seeds with disease resistance.',
        images: ['https://images.unsplash.com/photo-1585518419759-87a89d9b2d4f?auto=format&fit=crop&q=80&w=600'],
        location: 'Madhya Pradesh'
    }
];

const seedMarketplace = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Find a Seller (use any farmer/vendor user)
        let seller = await User.findOne({ roles: { $in: ['farmer', 'vendor'] } });
        
        if (!seller) {
            console.log('⚠️  No farmer/vendor found. Creating a test seller...');
            seller = await User.create({
                firstName: 'Test',
                lastName: 'Farmer',
                email: 'testfarmer@agrisense.com',
                password: 'Test@123456',
                roles: ['farmer'],
                activeRole: 'farmer',
                isVerified: true
            });
            console.log('✅ Created test seller:', seller.email);
        }

        console.log('📦 Using seller:', seller.email);

        // 2. Clear Existing Products (optional - comment out to keep existing)
        const deletedCount = await MarketplaceListing.deleteMany({});
        console.log(`🗑️  Cleared ${deletedCount.deletedCount} existing marketplace listings`);

        // 3. Insert New Products
        const listings = products.map(p => ({
            seller: seller._id,
            productType: p.productType,
            category: p.category,
            name: p.name,
            quantity: p.quantity,
            originalQuantity: p.quantity,
            unit: p.unit,
            pricePerUnit: p.pricePerUnit,
            location: p.location,
            description: p.description,
            images: p.images,
            status: 'active',
            isDeleted: false
        }));

        const result = await MarketplaceListing.insertMany(listings);
        console.log(`✨ Successfully seeded ${result.length} products with images!`);
        console.log('🎉 Marketplace is ready to display products!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

seedMarketplace();
