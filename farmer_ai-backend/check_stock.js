const mongoose = require('mongoose');
const MarketplaceListing = require('./src/models/MarketplaceListing');
require('dotenv').config();

const checkStock = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const productId = '696522c14c497e860c5cbc03';
        // Note: The ID in the user log '696522c14c497e860c5cbc03' might be a mock or real ID. 
        // It looks like a valid 24-char hex string, but slightly suspicious (startswith 6965..).
        // Let's check if it strictly serves as a valid ObjectID.

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            console.log('Invalid ObjectID format:', productId);
            return;
        }

        const product = await MarketplaceListing.findById(productId);
        if (product) {
            console.log('Product Found:', {
                id: product._id,
                name: product.productRef,
                quantity: product.quantity,
                type: product.productType
            });
        } else {
            console.log('Product not found with ID:', productId);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkStock();
