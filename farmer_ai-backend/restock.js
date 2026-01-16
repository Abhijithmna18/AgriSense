const mongoose = require('mongoose');
const MarketplaceListing = require('./src/models/MarketplaceListing');
require('dotenv').config();

const restock = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const productId = '696522c14c497e860c5cbc03';
        const res = await MarketplaceListing.updateOne(
            { _id: productId },
            { $set: { quantity: 100, status: 'active' } }
        );

        console.log('Restock Result:', res);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

restock();
