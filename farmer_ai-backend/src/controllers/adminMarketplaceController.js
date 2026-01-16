const MarketplaceListing = require('../models/MarketplaceListing');
const Order = require('../models/Order');
const PaymentRecord = require('../models/PaymentRecord');
const logAdminAction = require('../utils/adminAuditLog');
const mongoose = require('mongoose');

// --- LISTINGS ---

// @desc    Get all listings (paginated, filtered)
// @route   GET /api/admin/marketplace/listings
exports.getListings = async (req, res) => {
    try {
        const { page = 1, limit = 10, type, status, search, showDeleted } = req.query;
        const query = {};

        if (type) query.productType = type;
        if (status) query.status = status;
        if (search) {
            // For JSON fields like productRef, we might use strict equality or $where if needed, 
            // but for now typical search matches location or description if added.
            // Or text index search.
            query.location = { $regex: search, $options: 'i' };
        }
        if (showDeleted !== 'true') {
            query.isDeleted = false;
        }

        const listings = await MarketplaceListing.find(query)
            .populate('seller', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await MarketplaceListing.countDocuments(query);

        res.json({
            listings,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a listing
// @route   POST /api/admin/marketplace/listings
exports.createListing = async (req, res) => {
    try {
        const { seller, productType, productRef, quantity, unit, pricePerUnit, location } = req.body;

        // Basic Validation
        if (!seller || !productType || !pricePerUnit) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const listing = new MarketplaceListing({
            seller,
            productType,
            productRef,
            quantity,
            unit,
            pricePerUnit,
            location,
            status: 'active'
        });

        await listing.save();

        await logAdminAction(req, 'CREATE_LISTING', 'MarketplaceListing', listing._id, {
            after: listing.toObject()
        });

        res.status(201).json(listing);
    } catch (error) {
        res.status(500).json({ message: 'Creation failed', error: error.message });
    }
};

// @desc    Update a listing (Soft Delete support)
// @route   PUT /api/admin/marketplace/listings/:id
exports.updateListing = async (req, res) => {
    try {
        const listing = await MarketplaceListing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: 'Listing not found' });

        const before = listing.toObject();

        const updates = req.body; // { status, quantity, isDeleted, etc. }

        // Prevent accidental hard delete here? logic is in route handling usually or we check body
        // Only allow specific updates
        if (updates.status) listing.status = updates.status;
        if (updates.quantity !== undefined) listing.quantity = updates.quantity;
        if (updates.pricePerUnit !== undefined) listing.pricePerUnit = updates.pricePerUnit;
        if (updates.unit) listing.unit = updates.unit;
        if (updates.location) listing.location = updates.location;
        if (updates.productType) listing.productType = updates.productType;
        if (updates.productRef) listing.productRef = updates.productRef; // Allow updating product details (variety etc)
        if (updates.isDeleted !== undefined) listing.isDeleted = updates.isDeleted; // Soft Delete trigger

        await listing.save();

        const after = listing.toObject();

        await logAdminAction(req, 'UPDATE_LISTING', 'MarketplaceListing', listing._id, { before, after });

        res.json(listing);
    } catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
};

// --- ORDERS ---

// @desc    Get orders
// @route   GET /api/admin/marketplace/orders
exports.getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const query = {};
        if (status) query.deliveryStatus = status;

        const orders = await Order.find(query)
            .populate('buyer', 'firstName lastName email')
            .populate('items.listing', 'productType unit') // partial populate
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Order.countDocuments(query);

        res.json({
            orders,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/admin/marketplace/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { deliveryStatus, paymentStatus, comment } = req.body;
        const order = await Order.findById(req.params.id).session(session);

        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Order not found' });
        }

        const before = order.toObject();
        let changed = false;

        if (deliveryStatus && order.deliveryStatus !== deliveryStatus) {
            order.deliveryStatus = deliveryStatus;
            order.statusHistory.push({
                status: `Delivery: ${deliveryStatus}`,
                updatedBy: req.user._id,
                comment: comment || 'Admin update'
            });
            changed = true;
        }

        if (paymentStatus && order.paymentStatus !== paymentStatus) {
            order.paymentStatus = paymentStatus;
            order.statusHistory.push({
                status: `Payment: ${paymentStatus}`,
                updatedBy: req.user._id,
                comment: comment || 'Admin update'
            });
            changed = true;
        }

        if (changed) {
            await order.save({ session });
            await logAdminAction(req, 'UPDATE_ORDER_STATUS', 'Order', order._id, {
                before: { delivery: before.deliveryStatus, payment: before.paymentStatus },
                after: { delivery: order.deliveryStatus, payment: order.paymentStatus }
            });
        }

        await session.commitTransaction();
        res.json(order);
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Order update failed', error: error.message });
    } finally {
        session.endSession();
    }
};

// --- PAYMENTS ---

// @desc    Get payments
// @route   GET /api/admin/marketplace/payments
exports.getPayments = async (req, res) => {
    try {
        // Assuming we populated PaymentRecords during creation or via hooks, 
        // but strictly we should query PaymentRecord model.
        // If we don't have records yet, we might fallback to Orders.
        // But let's assume we maintain PaymentRecord.

        const { page = 1, limit = 10, status } = req.query;
        const query = {};
        if (status) query.status = status;

        const payments = await PaymentRecord.find(query)
            .populate({
                path: 'order',
                select: 'orderId totalAmount buyer',
                populate: { path: 'buyer', select: 'firstName lastName' }
            })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await PaymentRecord.countDocuments(query);

        res.json({
            payments,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Verify/Flag payment
// @route   PUT /api/admin/marketplace/payments/:id/verify
exports.verifyPayment = async (req, res) => {
    try {
        const { status, reason } = req.body; // 'verified' or 'flagged'
        if (!['verified', 'flagged'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const payment = await PaymentRecord.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment record not found' });

        const before = payment.toObject();

        payment.status = status;
        payment.verifiedBy = req.user._id;
        payment.verifiedAt = new Date();
        if (reason) payment.flaggedReason = reason;

        // Immutable Log
        payment.transactionLogs.push({
            event: status.toUpperCase(),
            details: { by: req.user._id, reason }
        });

        await payment.save();
        await logAdminAction(req, 'VERIFY_PAYMENT', 'PaymentRecord', payment._id, { before, after: payment.toObject() });

        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Verification failed', error: error.message });
    }
};
// @desc    Get Marketplace Stats (KPIs)
// @route   GET /api/admin/marketplace/stats
exports.getStats = async (req, res) => {
    try {
        const totalListings = await MarketplaceListing.countDocuments({ isDeleted: false });
        // const activeListings = await MarketplaceListing.countDocuments({ status: 'active', isDeleted: false });

        const totalOrders = await Order.countDocuments();
        const activeOrders = await Order.countDocuments({ deliveryStatus: { $ne: 'delivered' } }); // Pending or Shipped

        // Calculate GMV (Gross Merchandise Value) - Sum of paid orders
        const gmvAgg = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const gmv = gmvAgg.length > 0 ? gmvAgg[0].total : 0;

        // Pending Actions
        const pendingOrders = await Order.countDocuments({ deliveryStatus: 'pending' });
        const pendingPayments = await PaymentRecord.countDocuments({ status: 'pending_verification' });

        res.json({
            listings: { total: totalListings },
            orders: { active: activeOrders, total: totalOrders },
            gmv,
            pendingActions: pendingOrders + pendingPayments
        });
    } catch (error) {
        res.status(500).json({ message: 'Stats failed', error: error.message });
    }
};
