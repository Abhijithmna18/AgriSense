const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const User = require('./src/models/User');
require('dotenv').config();

const checkOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB\n');

        // Find the buyer user (assuming email from logs)
        const buyer = await User.findOne({ email: 'abhijithn893@gmail.com' });
        if (!buyer) {
            console.log('Buyer not found');
            return;
        }

        console.log('Buyer ID:', buyer._id.toString());
        console.log('Buyer Name:', buyer.firstName, buyer.lastName);
        console.log('Buyer Roles:', buyer.roles);
        console.log('Active Role:', buyer.activeRole);
        console.log('\n--- Checking Orders ---\n');

        // Find all orders for this buyer
        const orders = await Order.find({ buyer: buyer._id })
            .populate('seller', 'firstName lastName vendorProfile.businessName')
            .sort({ createdAt: -1 });

        console.log(`Found ${orders.length} orders for this buyer\n`);

        if (orders.length > 0) {
            orders.forEach((order, idx) => {
                console.log(`Order ${idx + 1}:`);
                console.log('  ID:', order._id.toString());
                console.log('  Order Number:', order.orderNumber);
                console.log('  Total Amount:', order.totalAmount);
                console.log('  Status:', order.deliveryStatus);
                console.log('  Payment Status:', order.paymentStatus);
                console.log('  Items:', order.items.length);
                console.log('  Created:', order.createdAt);
                console.log('  Seller:', order.seller?.firstName || 'Unknown');
                console.log('---');
            });
        } else {
            console.log('No orders found. Checking all orders in database...\n');
            const allOrders = await Order.find().limit(5);
            console.log(`Total orders in DB: ${await Order.countDocuments()}`);
            if (allOrders.length > 0) {
                console.log('\nSample order structure:');
                console.log(JSON.stringify(allOrders[0], null, 2));
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkOrders();
