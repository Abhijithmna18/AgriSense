/**
 * marketplaceService.js
 * Core business logic for marketplace operations.
 * Shared between marketplaceController, orderController, etc.
 */
const MarketplaceListing = require('../models/MarketplaceListing');
const Order = require('../models/Order');
const notificationService = require('./notificationService');

/**
 * Reduce stock for a listing after an order is placed.
 * Returns false if stock is insufficient.
 */
exports.deductStock = async (listingId, quantity) => {
    const listing = await MarketplaceListing.findById(listingId);
    if (!listing) throw new Error('Listing not found');
    if (listing.stock < quantity) return false;
    listing.stock -= quantity;
    await listing.save();
    return true;
};

/**
 * Restore stock if an order is cancelled.
 */
exports.restoreStock = async (listingId, quantity) => {
    await MarketplaceListing.findByIdAndUpdate(listingId, {
        $inc: { stock: quantity }
    });
};

/**
 * Get seller ID for a listing.
 */
exports.getListingSeller = async (listingId) => {
    const listing = await MarketplaceListing.findById(listingId).select('vendor');
    return listing?.vendor;
};

/**
 * Apply a negotiated price to an order item.
 */
exports.applyNegotiatedPrice = async (orderId, itemId, negotiatedPrice) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');
    const item = order.items.id(itemId);
    if (!item) throw new Error('Order item not found');
    item.unitPrice = negotiatedPrice;
    item.subtotal = negotiatedPrice * item.quantity;
    order.totalAmount = order.items.reduce((sum, i) => sum + i.subtotal, 0);
    return order.save();
};

/**
 * Calculate marketplace analytics for a vendor.
 */
exports.getVendorAnalytics = async (vendorId, startDate, endDate) => {
    const matchStage = {
        'items.vendor': vendorId,
        status: { $in: ['completed', 'shipped', 'delivered'] }
    };
    if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(matchStage).lean();
    let totalRevenue = 0;
    let totalSold = 0;
    const productSales = {};

    orders.forEach((order) => {
        order.items
            .filter((item) => item.vendor?.toString() === vendorId.toString())
            .forEach((item) => {
                totalRevenue += item.subtotal || 0;
                totalSold += item.quantity || 0;
                const name = item.productName || 'Unknown';
                productSales[name] = (productSales[name] || 0) + (item.subtotal || 0);
            });
    });

    const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, revenue]) => ({ name, revenue: parseFloat(revenue.toFixed(2)) }));

    return {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalUnitsSold: totalSold,
        totalOrders: orders.length,
        topProducts
    };
};

/**
 * Fire post-order notifications to vendor and buyer.
 */
exports.dispatchOrderNotifications = async (order) => {
    const firstItem = order.items?.[0];
    if (!firstItem) return;

    // Notify vendor
    if (firstItem.vendor) {
        await notificationService.notifyOrderReceived(
            firstItem.vendor,
            order._id,
            firstItem.productName || 'Product'
        );
    }
};
