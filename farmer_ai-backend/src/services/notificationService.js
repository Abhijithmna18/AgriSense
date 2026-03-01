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
 * Send a weather-based farming alert to a user with cooldown check.
 * @param {string} userId - User ID
 * @param {string} message - Alert message
 * @param {string} type - Alert severity (danger, warning, info, success)
 * @param {string} alertType - Specific alert type (frost, heavy_rain, etc.)
 * @param {Object} weatherData - Weather data snapshot
 * @param {Object} location - Location data
 * @param {string} farmId - Optional farm ID
 * @returns {Object} - { sent: boolean, notification: Object, reason: string }
 */
exports.sendWeatherAlert = async (userId, message, type = 'warning', alertType = null, weatherData = {}, location = {}, farmId = null) => {
    const WeatherAlert = require('../models/WeatherAlert');
    
    // Default cooldown periods (in hours) for each alert type
    const COOLDOWN_PERIODS = {
        frost: 12,              // 12 hours
        heavy_rain: 6,          // 6 hours
        drought_risk: 24,       // 24 hours
        extreme_heat: 12,       // 12 hours
        strong_wind: 6,         // 6 hours
        high_humidity: 24,      // 24 hours
        high_uv: 24,            // 24 hours
        favorable: 24           // 24 hours
    };
    
    const cooldownHours = COOLDOWN_PERIODS[alertType] || 12;
    const cooldownMs = cooldownHours * 60 * 60 * 1000;
    
    // Check if similar alert was sent recently (cooldown check)
    if (alertType) {
        const recentAlert = await WeatherAlert.findOne({
            user: userId,
            alertType,
            sentAt: { $gte: new Date(Date.now() - cooldownMs) }
        }).sort({ sentAt: -1 });
        
        if (recentAlert) {
            const minutesAgo = Math.floor((Date.now() - recentAlert.sentAt.getTime()) / 60000);
            console.log(`[NotificationService] Skipping ${alertType} alert for user ${userId} - sent ${minutesAgo} minutes ago (cooldown: ${cooldownHours}h)`);
            return { 
                sent: false, 
                notification: null, 
                reason: `Alert sent ${minutesAgo} minutes ago. Cooldown: ${cooldownHours} hours.` 
            };
        }
    }
    
    // Create notification
    const iconMap = {
        danger: '🔴 Critical Weather Alert',
        warning: '🟠 Weather Warning',
        info: 'ℹ️ Weather Update',
        success: '✅ Farm Conditions Good'
    };
    
    const notification = await exports.createNotification(
        userId,
        'weather_alert',
        iconMap[type] || 'Weather Alert',
        message
    );
    
    // Track alert in WeatherAlert model
    if (notification && alertType) {
        try {
            await WeatherAlert.create({
                user: userId,
                farm: farmId || null,
                alertType,
                severity: type,
                message,
                weatherData: {
                    temperature: weatherData.temp,
                    rainfall: weatherData.rain_1h || weatherData.rain_mm,
                    humidity: weatherData.humidity,
                    windSpeed: weatherData.wind_speed,
                    uvIndex: weatherData.uv_index
                },
                location: {
                    city: location.city,
                    coordinates: location.coordinates
                },
                expiresAt: new Date(Date.now() + cooldownMs)
            });
        } catch (error) {
            console.error('[NotificationService] Failed to track weather alert:', error.message);
        }
    }
    
    return { sent: true, notification, reason: 'Alert sent successfully' };
};

/**
 * Bulk-send alerts to multiple users.
 */
exports.broadcastAlert = async (userIds, title, message) => {
    const results = await Promise.allSettled(
        userIds.map((uid) => exports.sendSystemAlert(uid, title, message))
    );
    return results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
};
