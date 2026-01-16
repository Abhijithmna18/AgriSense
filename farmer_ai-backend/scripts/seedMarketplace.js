const mongoose = require('mongoose');
const MarketplaceListing = require('../src/models/MarketplaceListing');
const User = require('../src/models/User'); // Adjust path as needed
require('dotenv').config();

const products = [
    {
        productType: 'input',
        productRef: { name: 'DAP Fertilizer', variety: 'Standard' },
        unit: 'bags',
        pricePerUnit: 1350,
        quantity: 100,
        location: 'Punjab'
    },
    {
        productType: 'crop',
        productRef: { name: 'Basmati Rice Seeds', variety: 'Pusa 1121' },
        unit: 'kg',
        pricePerUnit: 150,
        quantity: 500,
        location: 'Haryana'
    },
    {
        productType: 'input',
        productRef: { name: 'Cotton Seeds', variety: 'Bt Cotton' },
        unit: 'packets',
        pricePerUnit: 800,
        quantity: 200,
        location: 'Maharashtra'
    },
    {
        productType: 'input',
        productRef: { name: 'Urea Fertilizer', variety: 'Neem Coated' },
        unit: 'bags',
        pricePerUnit: 450,
        quantity: 300,
        location: 'Uttar Pradesh'
    },
    {
        productType: 'input',
        productRef: { name: 'Knapsack Sprayer', variety: 'Manual' },
        unit: 'pieces',
        pricePerUnit: 3500,
        quantity: 50,
        location: 'Madhya Pradesh'
    },
    {
        productType: 'livestock',
        productRef: { name: 'Murrah Buffalo', variety: 'High Yield' },
        unit: 'animal',
        pricePerUnit: 60000,
        quantity: 5,
        location: 'Punjab'
    }
];

const seedMarketplace = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/farmer_ai_db');
        console.log('Connected.');

        const seller = await User.findOne({ role: 'admin' }) || await User.findOne();
        if (!seller) {
            console.error('No user found to assign as seller.');
            process.exit(1);
        }
        console.log(`Using seller: ${seller.firstName} ${seller.lastName} (${seller._id})`);

        // Clear existing? Maybe not, the user asked to list 24 products. I'll just append.
        // Or if I want to be clean, I could delete properties with a specific tag. 
        // For now, I'll just add 24 new ones.

        const newDetails = [];
        for (let i = 0; i < 24; i++) {
            const template = products[i % products.length];
            newDetails.push({
                seller: seller._id,
                productType: template.productType,
                productRef: template.productRef,
                quantity: template.quantity + i, // slight variation
                unit: template.unit,
                pricePerUnit: template.pricePerUnit,
                location: template.location,
                status: 'active',
                description: `High quality ${template.productRef.name} available for immediate delivery.`
            });
        }

        await MarketplaceListing.insertMany(newDetails);
        console.log('Successfully seeded 24 marketplace listings.');

        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedMarketplace();
