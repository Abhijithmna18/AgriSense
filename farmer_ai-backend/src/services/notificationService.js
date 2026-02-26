/**
 * notificationService.js
 * Central service for creating and sending notifications to users.
 * Imported by controllers that generate events (orders, disease alerts, etc.)
 */
const Notification = require('../models/Notifications');

/**
 * Create an in-app notification for a user.
 * @param {string} recipientId - MongoDB User ObjectId
 * @param {string} type - Enum from Notification model
 * @param {string} title
 * @param {string} message
 * @param {object} [data] - Optional: { orderId, reviewId, productId }
 */
exports.createNotification = async (recipientId, type, title, message, data = {}) => {
    try {
        const notif = await Notification.create({
            recipient: recipientId,
            type,
            title,
            message,
            data
        });
        return notif;
    } catch (error) {
        console.error('[NotificationService] Failed to create notification:', error.message);
        return null;
    }
};

/**
 * Notify a user that an order was received (vendor side).
 */
exports.notifyOrderReceived = (vendorId, orderId, productName) =>
    exports.createNotification(
        vendorId,
        'order_received',
        'New Order Received',
        `You have a new order for "${productName}". Review it now.`,
        { orderId }
    );

/**
 * Notify a buyer that their order has been shipped.
 */
exports.notifyOrderShipped = (buyerId, orderId, eta) =>
    exports.createNotification(
        buyerId,
        'order_shipped',
        'Order Shipped',
        `Your order has been dispatched. Estimated delivery: ${eta || 'within 3–5 days'}.`,
        { orderId }
    );

/**
 * Notify a buyer that their order was delivered.
 */
exports.notifyOrderDelivered = (buyerId, orderId) =>
    exports.createNotification(
        buyerId,
        'order_delivered',
        'Order Delivered',
        'Your order has been delivered. Please leave a review for the seller.',
        { orderId }
    );

/**
 * Notify a vendor about a new review.
 */
exports.notifyReviewPosted = (vendorId, reviewId, productName, rating) =>
    exports.createNotification(
        vendorId,
        'review_posted',
        `New ${rating}★ Review`,
        `A customer left a ${rating}-star review for "${productName}".`,
        { reviewId }
    );

/**
 * Notify a vendor about a payment received.
 */
exports.notifyPaymentReceived = (vendorId, orderId, amount) =>
    exports.createNotification(
        vendorId,
        'payment_received',
        'Payment Received',
        `Payment of ₹${amount.toFixed(2)} has been credited for your order.`,
        { orderId }
    );

/**
 * Send a system alert to any user.
 */
exports.sendSystemAlert = (userId, title, message) =>
    exports.createNotification(userId, 'system_alert', title, message);

/**
 * Send a disease outbreak alert to a farmer.
 */
exports.sendOutbreakAlert = (userId, disease, region) =>
    exports.createNotification(
        userId,
        'outbreak_alert',
        `⚠️ Disease Outbreak Alert: ${disease}`,
        `A ${disease} outbreak has been reported in ${region}. Monitor your crops closely and apply preventive treatments.`
    );

/**
 * Bulk-send alerts to multiple users.
 */
exports.broadcastAlert = async (userIds, title, message) => {
    const results = await Promise.allSettled(
        userIds.map((uid) => exports.sendSystemAlert(uid, title, message))
    );
    return results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
};
