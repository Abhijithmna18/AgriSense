const MarketplaceListing = require('../models/MarketplaceListing');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Notification = require('../models/Notifications');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const crypto = require('crypto');
const AppError = require('../utils/AppError');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

// @desc    Get all products with filters
// @route   GET /api/marketplace/products
// @access  Private (Farmer)
exports.getProducts = async (req, res) => {
    try {
        const { category, type, search } = req.query;
        let query = { status: 'active', isDeleted: false }; // Updated status check

        if (category) query.productType = category; // Map category to productType if needed, or adjust frontend queries
        if (type) query.productType = type === 'buy' ? 'input' : 'livestock'; // Rough mapping, need frontend adjustment likely
        // Actually, let's keep it flexible

        if (search) {
            query.productRef = { $regex: search, $options: 'i' }; // Assuming searching productRef/description
        }


        const products = await MarketplaceListing.find(query)
            .populate('seller', 'firstName lastName vendorProfile roles')
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new order & initiate Razorpay payment (Multi-Vendor Support)
// @route   POST /api/marketplace/order
// @access  Private (Farmer)
exports.createOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { items, deliveryAddress } = req.body;
        const idempotencyKey = req.headers['x-idempotency-key'] || req.headers['idempotency-key'];

        // 0. Idempotency Check
        if (idempotencyKey) {
            const existingOrder = await Order.findOne({ idempotencyKey });
            if (existingOrder) {
                await session.abortTransaction();
                return res.status(200).json({
                    success: true,
                    message: 'Order already processed (Idempotent)',
                    orderIds: [existingOrder._id], // Simplify for existing logic
                    razorpayOrderId: existingOrder.razorpayOrderId,
                    amount: existingOrder.totalAmount, // This might differ if split, but for idempotency usually fine
                    currency: existingOrder.currency
                });
            }
        }

        if (!items || items.length === 0) {
            throw new AppError('No items in order', 400);
        }

        // 1. Stock Verification & Deduction (Atomic)
        const sellerGroups = {};
        let totalAmount = 0;
        let subtotal = 0;
        const taxRate = 0.05;

        for (const item of items) {
            const product = await MarketplaceListing.findById(item.itemId).session(session);

            if (!product) {
                throw new AppError(`Product not found: ${item.itemId}`, 404);
            }
            if (product.quantity < item.quantity) {
                throw new AppError(`Insufficient stock for ${product.name || product.productRef?.name || product.productType || 'Product'}. Available: ${product.quantity}`, 400);
            }

            // Deduct Stock
            product.quantity -= item.quantity;
            if (product.quantity <= 0) {
                product.quantity = 0;
                product.status = 'sold';
            }
            await product.save({ session });

            // Group by Seller
            const sellerId = product.seller.toString();
            if (!sellerGroups[sellerId]) {
                sellerGroups[sellerId] = {
                    sellerId: product.seller,
                    items: [],
                    subtotal: 0
                };
            }

            const price = product.pricePerUnit * item.quantity;
            sellerGroups[sellerId].subtotal += price;
            subtotal += price;
            totalAmount += price;

            sellerGroups[sellerId].items.push({
                listing: product._id,
                productName: product.name || product.productRef?.name || product.productType || 'Product',
                quantity: item.quantity,
                priceAtTime: product.pricePerUnit,
                subtotal: price
            });
        }

        // 2. Calculate Final Payable
        const finalTax = subtotal * taxRate;
        const finalPayable = Math.round(totalAmount + finalTax);

        // 3. Create Razorpay Order
        let razorpayOrder;
        const isDev = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder';

        if (isDev) {
            console.log("Dev Mode: Mocking Razorpay Order");
            razorpayOrder = { id: `order_mock_${Date.now()}` };
        } else {
            try {
                razorpayOrder = await razorpay.orders.create({
                    amount: finalPayable * 100,
                    currency: "INR",
                    receipt: `order_${Date.now()}`
                });
            } catch (rzpError) {
                throw new AppError(`Payment gateway initialization failed: ${rzpError.description || rzpError.message}`, 502);
            }
        }

        // 4. Create Individual Orders
        const orderIds = [];
        const sellerIds = Object.keys(sellerGroups);
        const orderGroupId = crypto.randomUUID();

        for (const sellerId of sellerIds) {
            const group = sellerGroups[sellerId];
            const groupTax = group.subtotal * taxRate;
            const groupTotal = Math.round(group.subtotal + groupTax);

            const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

            const order = new Order({
                orderNumber,
                orderGroupId,
                idempotencyKey: idempotencyKey ? `${idempotencyKey}-${sellerId}` : undefined, // Composite key if multiple sellers
                state: 'PAYMENT_PENDING',
                buyer: req.user._id,
                seller: group.sellerId,
                items: group.items,
                totalAmount: groupTotal,
                razorpayOrderId: razorpayOrder.id,
                deliveryAddress,
                deliveryStatus: 'pending',
                paymentStatus: 'pending'
            });

            await order.save({ session });
            orderIds.push(order._id);
        }

        await session.commitTransaction();
        session.endSession();

        // Send invoice email asynchronously (don't block response)
        try {
            const emailService = require('../services/emailService');
            const invoiceService = require('../services/invoiceService');

            // Get first order for email (or send separate emails for each)
            const firstOrder = await Order.findById(orderIds[0])
                .populate('buyer', 'firstName lastName email')
                .populate('items.listing', 'productRef productType images');

            if (firstOrder && firstOrder.buyer.email) {
                const pdfBuffer = await invoiceService.generateInvoicePDF(firstOrder);
                await emailService.sendInvoiceEmail({
                    to: firstOrder.buyer.email,
                    customerName: `${firstOrder.buyer.firstName} ${firstOrder.buyer.lastName}`,
                    orderNumber: firstOrder.orderNumber || firstOrder._id.toString().slice(-8).toUpperCase(),
                    pdfBuffer
                });
            }
        } catch (emailError) {
            // Log but don't fail the order
            console.error('Failed to send invoice email:', emailError);
        }

        res.status(201).json({
            success: true,
            orderIds: orderIds,
            razorpayOrderId: razorpayOrder.id,
            amount: finalPayable,
            currency: "INR",
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};

// @desc    Get Vendor Orders (Sales)
// @route   GET /api/marketplace/vendor/orders
// @access  Private (Vendor)
exports.getVendorOrders = async (req, res) => {
    try {
        // Find orders where the current user is the seller
        const orders = await Order.find({ seller: req.user._id })
            .populate('buyer', 'firstName lastName email phone') // Show buyer info
            .populate('items.listing', 'productRef productType images')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error('Get Vendor Orders Error:', error);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};

// @desc    Update Order Status (Vendor)
// @route   PUT /api/marketplace/order/:id/status
// @access  Private (Vendor)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check ownership (Must be the seller)
        if (order.seller.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to manage this order' });
        }

        order.deliveryStatus = status; // pending, shipped, delivered, cancelled

        // Add to history
        order.statusHistory.push({
            status: status,
            updatedBy: req.user.id,
            comment: `Status updated by vendor`
        });

        await order.save();
        res.json({ success: true, order });

    } catch (error) {
        console.error('Update Order Status Error:', error);
        res.status(500).json({ message: 'Server error updating status' });
    }
};

// @desc    Verify Payment Signature
// @route   POST /api/marketplace/verify-payment
// @access  Private
exports.verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Dev Mode Bypass
        if (razorpay_order_id && razorpay_order_id.startsWith('order_mock_')) {
            console.log("Dev Mode: Verifying Mock Payment");
            const updateResult = await Order.updateMany(
                { razorpayOrderId: razorpay_order_id },
                {
                    $set: {
                        state: 'PAID',
                        paymentStatus: 'paid',
                        razorpayPaymentId: razorpay_payment_id || `pay_mock_${Date.now()}`
                    },
                    $push: {
                        statusHistory: {
                            status: 'Payment Verified (Mock)',
                            updatedBy: req.user._id,
                            comment: 'Dev mode bypass'
                        }
                    }
                }
            );

            if (updateResult.modifiedCount > 0) {
                return res.json({ success: true, message: 'Mock Payment verified' });
            } else {
                throw new AppError('Order not found', 404);
            }
        }

        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder');
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if (generated_signature === razorpay_signature) {
            // Payment Success - Update ALL split orders
            const updateResult = await Order.updateMany(
                { razorpayOrderId: razorpay_order_id },
                {
                    $set: {
                        state: 'PAID',
                        paymentStatus: 'paid',
                        razorpayPaymentId: razorpay_payment_id
                    },
                    $push: {
                        statusHistory: {
                            status: 'Payment Verified',
                            updatedBy: req.user._id,
                            comment: 'Razorpay signature valid'
                        }
                    }
                }
            );

            if (updateResult.matchedCount === 0) {
                throw new AppError('Order not found for verification', 404);
            }

            res.json({ success: true, message: 'Payment verified' });
        } else {
            throw new AppError('Invalid payment signature', 400);
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user orders
// @route   GET /api/marketplace/orders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        console.log('[GET MY ORDERS] User ID:', req.user._id);
        console.log('[GET MY ORDERS] User email:', req.user.email);

        const orders = await Order.find({ buyer: req.user._id })
            .populate('seller', 'firstName lastName email vendorProfile.businessName')
            .populate('items.listing', 'productRef productType images')
            .sort({ createdAt: -1 });

        console.log('[GET MY ORDERS] Found orders:', orders.length);
        if (orders.length > 0) {
            console.log('[GET MY ORDERS] First order ID:', orders[0]._id);
        }

        res.json(orders);
    } catch (error) {
        console.error('Get My Orders Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single order by ID
// @route   GET /api/marketplace/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('seller', 'firstName lastName email vendorProfile.businessName phone')
            .populate('items.listing', 'productRef productType images unit pricePerUnit')
            .populate('buyer', 'firstName lastName email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Authorization: User must be the buyer or the seller
        const isBuyer = order.buyer._id.toString() === req.user._id.toString();
        const isSeller = order.seller._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isBuyer && !isSeller && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        console.error('Get Order By ID Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new marketplace product
// @route   POST /api/marketplace/products
// @access  Private (Farmer/Vendor)
exports.createProduct = async (req, res) => {
    try {
        const { category, productType, productRef, quantity, unit, pricePerUnit, location, description } = req.body;

        // Robust Image Handling
        let images = [];

        // 1. Handle req.body.images (URLs or existing strings)
        if (req.body.images) {
            if (Array.isArray(req.body.images)) {
                // Filter out non-string garbage like objects that might have slipped in
                images = req.body.images.filter(img => typeof img === 'string' && img.trim() !== '' && !img.includes('[object Object]'));
            } else if (typeof req.body.images === 'string') {
                // Check if it's a stringified array (common with FormData bugs)
                if (req.body.images.trim().startsWith('[') && req.body.images.trim().endsWith(']')) {
                    try {
                        const parsed = JSON.parse(req.body.images);
                        if (Array.isArray(parsed)) {
                            // Extract paths if objects, or keep strings
                            images = parsed.map(p => typeof p === 'string' ? p : p.url || p.path || '').filter(s => s);
                        }
                    } catch (e) {
                        // Not JSON, just a plain string?
                        images = [req.body.images];
                    }
                } else {
                    images = [req.body.images];
                }
            }
        }

        // 2. Append New Files
        if (req.files && req.files.length > 0) {
            const uploadedImages = req.files.map(file => `uploads/${file.filename}`);
            images = [...images, ...uploadedImages];
        }

        console.log('Product Creation - Final Images:', images);

        // Role Validation
        const isVendor = req.user.roles.includes('vendor') || req.user.activeRole === 'vendor';
        const isFarmer = req.user.roles.includes('farmer') || req.user.activeRole === 'farmer';

        if (!isVendor && !isFarmer) {
            return res.status(403).json({ message: 'Only Farmers and Vendors can list products' });
        }

        if (isVendor && req.user.vendorProfile?.status !== 'approved') {
            return res.status(403).json({ message: 'Vendor account pending approval' });
        }

        // Determine if productRef is a CropCycle ID or a product name
        let cropCycleRef = null;
        let productName = productRef;

        // Check if productRef is a valid MongoDB ObjectId
        if (productRef && mongoose.Types.ObjectId.isValid(productRef) && productRef.length === 24) {
            // It's likely a CropCycle ID
            const sourceCycle = await require('../models/CropCycle').findById(productRef);
            if (sourceCycle) {
                cropCycleRef = productRef;

                // Check Ownership
                const farm = await require('../models/Farm').findById(sourceCycle.farm);
                if (!farm || farm.user.toString() !== req.user._id.toString()) {
                    throw new AppError('You can only list crops from your own farms', 403);
                }

                // Check Quantity
                if (sourceCycle.marketableQuantity < quantity) {
                    throw new AppError(`Insufficient marketable inventory. Available: ${sourceCycle.marketableQuantity}`, 400);
                }
            }
        }


        // Build product object - only include productRef if it's a valid CropCycle reference
        const productData = {
            seller: req.user._id,
            category: category || 'inputs',
            productType,
            name: productName,
            quantity,
            originalQuantity: quantity,
            unit,
            pricePerUnit,
            location: location || (req.user.vendorProfile?.pickupAddress ?
                `${req.user.vendorProfile.pickupAddress.city}, ${req.user.vendorProfile.pickupAddress.state}` : 'Unknown Interest Point'),
            description,
            images,
            status: 'active'
        };

        // Only add productRef if it's a valid CropCycle reference
        if (cropCycleRef) {
            productData.productRef = cropCycleRef;
        }

        const newProduct = new MarketplaceListing(productData);

        await newProduct.save();
        res.status(201).json({ success: true, product: newProduct });


    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Server error creating product' });
    }
};

// @desc    Update marketplace product
// @route   PUT /api/marketplace/products/:id
// @access  Private (Owner)
exports.updateProduct = async (req, res) => {
    try {
        const { quantity, pricePerUnit, description, status } = req.body;
        let images = req.body.images; // Can be undefined, string, or array

        let product = await MarketplaceListing.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check ownership
        if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin' && !req.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        product.quantity = quantity !== undefined ? quantity : product.quantity;
        product.pricePerUnit = pricePerUnit !== undefined ? pricePerUnit : product.pricePerUnit;
        product.description = description || product.description;
        product.status = status || product.status;

        // Handle Images
        if (req.files && req.files.length > 0) {
            const uploadedImages = req.files.map(file => `uploads/${file.filename}`);

            // Normalize existing images to array
            let existingImages = [];
            if (images) {
                if (Array.isArray(images)) existingImages = images;
                else if (typeof images === 'string') existingImages = [images];
            } else {
                // If no new image strings sent, keep old ones? 
                // Usually simpler: if images provided in body, replace. If files provided, append.
                // But typically form sends CURRENT images + NEW files. 
                // Let's assume if 'images' is in body, it represents the kept images.
                if (req.body.images !== undefined) existingImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
                else existingImages = product.images; // Keep existing if not touched
            }

            product.images = [...existingImages, ...uploadedImages];
        } else if (images !== undefined) {
            // Only text updates to images (e.g. deleting or reordering, or just URL update)
            product.images = Array.isArray(images) ? images : [images];
        }

        await product.save();
        res.json({ success: true, product });

    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error updating product' });
    }
};

// @desc    Delete (soft) marketplace product
// @route   DELETE /api/marketplace/products/:id
// @access  Private (Owner)
exports.deleteProduct = async (req, res) => {
    try {
        let product = await MarketplaceListing.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check ownership
        if (product.seller.toString() !== req.user._id.toString() && !req.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        product.isDeleted = true;
        product.status = 'cancelled';
        await product.save();

        res.json({ success: true, message: 'Product removed' });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error deleting product' });
    }
};

// @desc    Get my listings
// @route   GET /api/marketplace/my-listings
// @access  Private
exports.getMyListings = async (req, res) => {
    try {
        const products = await MarketplaceListing.find({
            seller: req.user._id,
            isDeleted: false
        }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Market Analytics Data
// @route   GET /api/marketplace/analytics
// @access  Private (Buyer/Admin)
exports.getMarketAnalytics = async (req, res) => {
    try {
        const { timeRange = '30d' } = req.query;
        // Calculate date range
        const now = new Date();
        const past = new Date();
        past.setDate(now.getDate() - (parseInt(timeRange) || 30));

        // 1. Price Trends (from Orders)
        const priceTrends = await Order.aggregate([
            { $match: { createdAt: { $gte: past }, deliveryStatus: { $ne: 'cancelled' } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        // product: "$items.productName" // Group by product if needed later
                    },
                    avgPrice: { $avg: "$items.priceAtTime" }
                }
            },
            { $sort: { "_id.date": 1 } },
            {
                $project: {
                    date: "$_id.date",
                    price: { $round: ["$avgPrice", 2] },
                    _id: 0
                }
            }
        ]);

        // 2. Supply/Demand Heatmap (from Active Listings)
        const heatmapRaw = await MarketplaceListing.aggregate([
            { $match: { status: 'active', isDeleted: false } },
            {
                $group: {
                    _id: {
                        product: "$productType", // Using type for broader categories first
                        location: "$location"
                    },
                    count: { $sum: 1 },
                    avgPrice: { $avg: "$pricePerUnit" }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Transform into convenient structure for frontend
        const heatmap = heatmapRaw.reduce((acc, curr) => {
            const product = curr._id.product || 'Other';
            if (!acc[product]) acc[product] = [];

            // Determine status based on arbitrary thresholds for demo
            // In real app, compare vs Demand (Orders count in region)
            let status = 'med';
            if (curr.count > 5) status = 'low'; // Surplus
            if (curr.count < 2) status = 'high'; // Scarcity

            acc[product].push({
                name: curr._id.location || 'Unknown',
                status: status,
                count: curr.count
            });
            return acc;
        }, {});

        // Convert to array
        const heatmapData = Object.keys(heatmap).map(key => ({
            product: key.charAt(0).toUpperCase() + key.slice(1),
            regions: heatmap[key]
        }));


        // 3. Key Metrics
        const productStats = await MarketplaceListing.aggregate([
            { $match: { status: 'active', isDeleted: false } },
            {
                $group: {
                    _id: null,
                    avgPrice: { $avg: "$pricePerUnit" },
                    totalListings: { $sum: 1 },
                    uniqueSellers: { $addToSet: "$seller" }
                }
            }
        ]);

        const orderStats = await Order.aggregate([
            { $match: { createdAt: { $gte: past } } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalVolume: { $sum: "$totalAmount" }
                }
            }
        ]);

        const stats = {
            avgPrice: productStats[0] ? Math.round(productStats[0].avgPrice) : 0,
            activeSuppliers: productStats[0] ? productStats[0].uniqueSellers.length : 0,
            demandIndex: orderStats[0] ? orderStats[0].totalOrders : 0,
            volatility: 'Low' // Placeholder logic
        };

        // 4. Top Movers (Logic: Highest sold items recently with price comparison)
        const previousPeriodStart = new Date(past);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(timeRange || 30));

        const topMoversRaw = await Order.aggregate([
            { $match: { createdAt: { $gte: past } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productName",
                    volume: { $sum: "$items.quantity" },
                    avgPrice: { $avg: "$items.priceAtTime" }
                }
            },
            { $sort: { volume: -1 } },
            { $limit: 4 }
        ]);

        // Get previous period prices for comparison
        const previousPrices = await Order.aggregate([
            { $match: { createdAt: { $gte: previousPeriodStart, $lt: past } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productName",
                    avgPrice: { $avg: "$items.priceAtTime" }
                }
            }
        ]);

        const prevPriceMap = previousPrices.reduce((acc, item) => {
            acc[item._id] = item.avgPrice;
            return acc;
        }, {});

        const topMovers = topMoversRaw.map(m => {
            const productName = m._id || 'Unknown';
            const currentPrice = m.avgPrice || 0;
            const previousPrice = prevPriceMap[productName] || currentPrice;

            const priceChange = previousPrice > 0
                ? ((currentPrice - previousPrice) / previousPrice * 100).toFixed(1)
                : 0;

            const changeSign = priceChange > 0 ? '+' : '';
            const type = priceChange > 0 ? 'up' : 'down';

            return {
                product: productName.split('-')[0].trim(),
                change: `${changeSign}${priceChange}%`,
                type: type,
                region: 'Regional', // Could be enhanced with actual location data
                reason: Math.abs(priceChange) > 5
                    ? 'Significant price movement'
                    : 'High transactional volume'
            };
        });

        res.json({
            trends: priceTrends,
            heatmap: heatmapData,
            stats,
            topMovers,
            success: true
        });

    } catch (error) {
        console.error('Get Analytics Error:', error);
        res.status(500).json({ message: 'Server error generating analytics' });
    }
};

// @desc    Get Vendor Specific Analytics
// @route   GET /api/marketplace/vendor/analytics
// @access  Private (Vendor)
exports.getVendorAnalyticsSpecific = async (req, res) => {
    try {
        const vendorId = req.user._id;
        const { timeRange = '30d' } = req.query;

        const now = new Date();
        const past = new Date();
        past.setDate(now.getDate() - (parseInt(timeRange) || 30));

        // 1. Sales Trend
        const salesTrend = await Order.aggregate([
            { $match: { seller: vendorId, createdAt: { $gte: past }, paymentStatus: 'paid' } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    dailyRevenue: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } },
            { $project: { date: "$_id", revenue: "$dailyRevenue", orders: "$orderCount", _id: 0 } }
        ]);

        // 2. Top Selling Products
        const topProducts = await Order.aggregate([
            { $match: { seller: vendorId } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.listing",
                    name: { $first: "$items.productName" },
                    totalSold: { $sum: "$items.quantity" },
                    revenue: { $sum: "$items.subtotal" }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        // 3. Summary Stats
        const totalOrders = await Order.countDocuments({ seller: vendorId });
        const totalRevenueResult = await Order.aggregate([
            { $match: { seller: vendorId, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;

        // Avg Rating (Need Review Integration)
        const avgRatingResult = await Review.aggregate([
            { $match: { vendor: vendorId } },
            { $group: { _id: null, avg: { $avg: "$rating" } } }
        ]);
        const avgRating = avgRatingResult[0]?.avg || 0;


        res.json({
            success: true,
            salesTrend,
            topProducts,
            stats: {
                totalOrders,
                totalRevenue,
                avgRating: Math.round(avgRating * 10) / 10
            }
        });
    } catch (error) {
        console.error('Vendor Analytics Error:', error);
        res.status(500).json({ message: 'Server error fetching analytics' });
    }
};

// @desc    Get Vendor Reviews
// @route   GET /api/marketplace/vendor/reviews
// @access  Private (Vendor)
exports.getVendorReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ vendor: req.user._id })
            .populate('reviewer', 'firstName lastName')
            .populate('product', 'productRef productType')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: reviews });
    } catch (error) {
        console.error('Fetch Reviews Error:', error);
        res.status(500).json({ message: 'Server error fetching reviews' });
    }
};

// @desc    Reply to Review
// @route   POST /api/marketplace/reviews/:id/reply
// @access  Private (Vendor)
exports.replyToReview = async (req, res) => {
    try {
        const { text } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.vendor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to reply to this review' });
        }

        review.vendorReply = {
            text,
            repliedAt: new Date()
        };
        await review.save();

        res.json({ success: true, data: review });
    } catch (error) {
        console.error('Reply Review Error:', error);
        res.status(500).json({ message: 'Server error replying to review' });
    }
};

// @desc    Get Vendor Payments (Transaction History)
// @route   GET /api/marketplace/vendor/payments
// @access  Private (Vendor)
exports.getVendorPayments = async (req, res) => {
    try {
        // Since we don't have a separate Ledger/Transaction model fully populated yet,
        // we derive this from Orders that are 'paid'
        const payments = await Order.find({
            seller: req.user._id,
            paymentStatus: { $in: ['paid', 'completed'] } // Support both conventions
        })
            .select('orderNumber totalAmount paymentStatus razorpayPaymentId createdAt')
            .sort({ createdAt: -1 });

        // Transform to transaction-like format
        const transactions = payments.map(p => ({
            id: p.razorpayPaymentId || `TXN-${p._id.toString().slice(-6)}`,
            orderId: p.orderNumber || p._id,
            amount: p.totalAmount,
            status: 'credited', // Assumed credited if paid by buyer for now (Platform logic would be complex)
            date: p.createdAt,
            method: 'Razorpay'
        }));

        res.json({ success: true, data: transactions });
    } catch (error) {
        console.error('Fetch Payments Error:', error);
        res.status(500).json({ message: 'Server error fetching payments' });
    }
};

// @desc    Get Order Invoice PDF
// @route   GET /api/marketplace/orders/:id/invoice
// @access  Private (Buyer/Seller/Admin)
exports.getOrderInvoice = async (req, res, next) => {
    try {
        const invoiceService = require('../services/invoiceService');

        const order = await Order.findById(req.params.id)
            .populate('buyer', 'firstName lastName email')
            .populate('seller', 'firstName lastName vendorProfile.businessName')
            .populate('items.listing', 'productRef productType images');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Authorization check
        const isBuyer = order.buyer._id.toString() === req.user._id.toString();
        const isSeller = order.seller._id.toString() === req.user._id.toString();
        const isAdmin = req.user.roles?.includes('admin');

        if (!isBuyer && !isSeller && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to view this invoice' });
        }

        // Generate PDF
        const pdfBuffer = await invoiceService.generateInvoicePDF(order);

        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber || order._id}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Generate Invoice Error:', error);
        next(error);
    }
};

// @desc    Cancel Order
// @route   POST /api/marketplace/orders/:id/cancel
// @access  Private (Buyer/Admin)
exports.cancelOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { reason } = req.body;
        const orderId = req.params.id;

        // Find order WITHOUT session first to ensure we get the full document
        const order = await Order.findById(orderId);
        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Order not found' });
        }

        // Authorization check - only buyer or admin can cancel
        const isBuyer = order.buyer.toString() === req.user._id.toString();
        const isAdmin = req.user.roles?.includes('admin');

        if (!isBuyer && !isAdmin) {
            await session.abortTransaction();
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }

        // Check if order can be cancelled (only pending or payment_pending orders)
        const cancellableStates = ['CREATED', 'PAYMENT_PENDING', 'CONFIRMED', 'PAID'];
        const legacyCancellableStates = ['pending'];

        console.log('[CANCEL ORDER] Order state:', order.state);
        console.log('[CANCEL ORDER] Order deliveryStatus:', order.deliveryStatus);
        console.log('[CANCEL ORDER] Cancellable states:', cancellableStates);

        const isStateCancellable = cancellableStates.includes(order.state);
        const isLegacyStateCancellable = legacyCancellableStates.includes(order.deliveryStatus);

        console.log('[CANCEL ORDER] isStateCancellable:', isStateCancellable);
        console.log('[CANCEL ORDER] isLegacyStateCancellable:', isLegacyStateCancellable);

        if (!isStateCancellable && !isLegacyStateCancellable) {
            await session.abortTransaction();
            console.log('[CANCEL ORDER] Order cannot be cancelled');
            return res.status(400).json({
                message: `Cannot cancel order in ${order.state || order.deliveryStatus} state. Orders can only be cancelled before they are dispatched.`
            });
        }

        // Restore stock for all items
        for (const item of order.items) {
            const product = await MarketplaceListing.findById(item.listing).session(session);
            if (product) {
                product.quantity += item.quantity;
                if (product.status === 'sold') {
                    product.status = 'active';
                }
                await product.save({ session });
            }
        }

        // Update order status using updateOne with session
        const updateResult = await Order.updateOne(
            { _id: orderId },
            {
                $set: {
                    state: 'CANCELLED',
                    deliveryStatus: 'cancelled',
                    paymentStatus: order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus
                },
                $push: {
                    statusHistory: {
                        status: 'CANCELLED',
                        updatedBy: req.user._id,
                        timestamp: new Date(),
                        comment: reason || 'Order cancelled by buyer'
                    }
                }
            },
            { session }
        );

        if (updateResult.modifiedCount === 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Failed to cancel order' });
        }

        await session.commitTransaction();

        // Send notification to seller
        try {
            await Notification.create({
                recipient: order.seller,
                type: 'order_cancelled',
                title: 'Order Cancelled',
                message: `Order ${order.orderNumber} has been cancelled by the buyer.`,
                relatedOrder: order._id,
                read: false
            });
        } catch (notifError) {
            console.error('Notification error:', notifError);
        }

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                state: 'CANCELLED',
                deliveryStatus: 'cancelled',
                paymentStatus: order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus
            }
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Cancel Order Error:', error);
        next(error);
    } finally {
        session.endSession();
    }
};

// @desc    Analyze product image using Groq Vision AI
// @route   POST /api/marketplace/analyze-image
// @access  Private (Farmer/Vendor)
exports.analyzeProductImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const fs = require('fs');
        const { analyzeImageJSON } = require('../utils/llmService');

        // Convert image to Base64
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64String = imageBuffer.toString('base64');
        const mimeType = req.file.mimetype;
        const base64Image = `data:${mimeType};base64,${base64String}`;

        const systemPrompt = `
You are an expert agricultural AI. Your task is to analyze the provided image of a product and extract categorization details for an agricultural marketplace.

Identify the following details:
1. "category": Must be either "inputs" (for seeds, fertilizers, pesticides, crops) or "rentals" (for tractors, tools, equipment).
2. "productType": A short text categorizing the item (e.g., "Seeds", "Fertilizer", "Tractor", "Harvester", "Pesticide", "Vegetable").
3. "productName": A concise, common name for the product (e.g., "Wheat Seeds", "Urea Fertilizer", "Mahindra Tractor").

Return ONLY a JSON object with these exactly three keys. Do not include any markdown formatting or extra text.
Example format:
{
  "category": "inputs",
  "productType": "Seeds",
  "productName": "Wheat Seeds"
}
`;

        const aiResponse = await analyzeImageJSON(systemPrompt, base64Image);

        // Clean up the uploaded file if we don't want to save it permanently just for analysis.
        // For now, we'll keep it as the user might just submit the same image path.
        // In the VendorDashboard, if they use the same file, they upload it again on submit, 
        // so we could technically delete this temporary analysis file. Let's delete it to save space.
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            success: true,
            data: aiResponse
        });

    } catch (error) {
        console.error('Image Analysis Error:', error);
        res.status(500).json({ message: 'Failed to analyze image. ' + (error.message || '') });
    }
};
