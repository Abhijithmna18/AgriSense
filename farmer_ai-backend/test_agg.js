require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const fs = require('fs');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const order = await Order.findOne({ state: { $in: ['DELIVERED', 'PAID', 'CONFIRMED'] } });
        if (!order) {
            fs.writeFileSync('output.json', JSON.stringify({ error: 'No orders found' }));
            process.exit(0);
        }

        const userId = order.seller;

        const profitData = await Order.aggregate([
            { $match: { seller: userId, state: { $in: ['DELIVERED', 'PAID', 'CONFIRMED'] } } },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'marketplacelistings',
                    localField: 'items.listing',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: { path: '$productInfo', preserveNullAndEmpty: true } },
            {
                $group: {
                    _id: {
                        listingId: '$items.listing',
                        productName: { $ifNull: ['$productInfo.name', { $ifNull: ['$items.productName', 'Unknown Product'] }] },
                        productType: { $ifNull: ['$productInfo.productType', 'Other'] }
                    },
                    totalRevenue: { $sum: '$items.subtotal' },
                    totalQuantitySold: { $sum: '$items.quantity' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    productId: '$_id.listingId',
                    productName: '$_id.productName',
                    productType: '$_id.productType',
                    totalRevenue: { $round: ['$totalRevenue', 2] },
                    totalQuantitySold: 1,
                    orderCount: 1,
                    estimatedCost: { $round: [{ $multiply: ['$totalRevenue', 0.60] }, 2] },
                    estimatedProfit: { $round: [{ $multiply: ['$totalRevenue', 0.40] }, 2] },
                    profitMarginPct: { $literal: 40 }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 20 }
        ]);

        fs.writeFileSync('output.json', JSON.stringify({ success: true, data: profitData }, null, 2));

    } catch (e) {
        fs.writeFileSync('output.json', JSON.stringify({ success: false, error: e.message, stack: e.stack }, null, 2));
    } finally {
        mongoose.disconnect();
    }
}

run();
