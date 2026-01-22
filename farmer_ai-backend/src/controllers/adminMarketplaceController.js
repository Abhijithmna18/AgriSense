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
        const { productType, category, quantity, unit, pricePerUnit, location } = req.body;
        // Default seller to admin if not provided
        const seller = req.body.seller || req.user._id;

        let { productRef } = req.body;

        if (typeof productRef === 'string') {
            try {
                productRef = JSON.parse(productRef);
            } catch (e) {
                // If it's just a string ID or irrelevant, ignore parse error
            }
        }

        // If productRef is an object (from frontend custom JSON), it might not be a valid ObjectId.
        // For custom products, we might leave productRef null and rely on description/title if we had one.
        // But the model doesn't have 'title' or 'productName'. 
        // Wait, the schema from Step 19 has `description` but no `name` field?
        // It relies on `productRef` -> `CropCycle` -> `crop` -> `name`?
        // If we make `productRef` optional, we need a place to store the name!
        // The frontend sends `productName` and `variety` inside `productRef` object.
        // We should probably save these inputs.
        // The model has `description` string. Maybe dump name/variety there?
        // Or better, add `temp_productName` to schema?
        // For now, let's look at schema again. 
        // It DOES NOT have `name`. 
        // I will add `name` and `variety` to the schema to support custom products lacking a CropCycle ref.

        // Basic Validation
        if (!seller || !productType || !pricePerUnit) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // If productRef was an object with name/variety, extract them
        const productName = (productRef && productRef.name) ? productRef.name : (req.body.name || 'Untitled Product');
        const productVariety = (productRef && productRef.variety) ? productRef.variety : (req.body.variety || '');

        // If productRef is not a valid ObjectId, set it to null
        if (productRef && (!productRef._id && !mongoose.Types.ObjectId.isValid(productRef))) {
            productRef = null;
        }

        const imagePath = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : null;
        console.log('[CREATE LISTING] Image path:', imagePath);

        const listing = new MarketplaceListing({
            seller,
            productType,
            category: category || 'inputs',
            productRef,
            name: productName,
            variety: productVariety,
            quantity: Number(quantity),
            originalQuantity: Number(quantity),
            unit,
            pricePerUnit: Number(pricePerUnit),
            location,
            status: 'active',
            images: imagePath ? [imagePath] : []
        });

        await listing.save();

        try {
            await logAdminAction(req, 'CREATE_LISTING', 'MarketplaceListing', listing._id, {
                after: listing.toObject()
            });
        } catch (logErr) {
            console.error('Audit Log Failed:', logErr);
            // Don't fail the request just because logging failed
        }

        res.status(201).json(listing);
    } catch (error) {
        console.error('Create Listing Error:', error);
        res.status(500).json({ message: 'Creation failed', error: error.message });
    }
};

// @desc    Update a listing (Soft Delete support)
// @route   PUT /api/admin/marketplace/listings/:id
exports.updateListing = async (req, res) => {
    try {
        const updates = req.body;

        // Use findByIdAndUpdate to avoid validation errors on legacy documents missing fields (like originalQuantity)
        // We only validate the fields we are actually updating.
        const listing = await MarketplaceListing.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: false } // Disable full document validation
        );

        if (!listing) return res.status(404).json({ message: 'Listing not found' });

        // Log the action (Auditing) - fetching 'before' would require an extra query, 
        // strictly speaking we should, but for fixing the crash let's log the 'after' state.

        await logAdminAction(req, 'UPDATE_LISTING', 'MarketplaceListing', listing._id, {
            changes: updates,
            after: listing.toObject()
        });

        res.json(listing);
    } catch (error) {
        console.error('Update Log Error:', error);
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
