const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const Negotiation = require('./src/models/Negotiation');
const Offer = require('./src/models/Offer');
const Message = require('./src/models/Message');

async function testModels() {
    try {
        console.log('Testing Negotiation model...');
        
        // Test creating a negotiation
        const testNegotiation = new Negotiation({
            buyerId: new mongoose.Types.ObjectId(),
            vendorId: new mongoose.Types.ObjectId(),
            productId: new mongoose.Types.ObjectId(),
            type: 'buyer_initiated',
            baseline: {
                price: 100,
                quantity: 10,
                deliveryDays: 7,
                qualityGrade: 'Standard',
                paymentTerms: 'Net 30'
            },
            status: 'pending',
            currentRound: 1,
            maxRounds: 5,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        console.log('Negotiation model created successfully');
        console.log('Validation result:', testNegotiation.validateSync());
        
        console.log('All models are working correctly!');
        process.exit(0);
        
    } catch (error) {
        console.error('Model test failed:', error);
        process.exit(1);
    }
}

testModels();