const MarketplaceListing = require('../models/MarketplaceListing'); // Updated Model
const Order = require('../models/Order');
const Review = require('../models/Review');
const Notification = require('../models/Notifications');
const Razorpay = require('razorpay');

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
exports.createOrder = async (req, res) => {
    try {
        const { items, deliveryAddress } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }


        // 0. Stock Verification
        for (const item of items) {
            const product = await MarketplaceListing.findById(item.itemId);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.itemId}` });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${typeof product.productRef === 'object' ? (product.productRef.name || 'Product') : product.productRef}. Available: ${product.quantity}`
                });
            }
        }

        // 1. Fetch all products and Group items by Seller
        const sellerGroups = {};
        let totalAmount = 0;
        let subtotal = 0;
        const taxRate = 0.05;

        for (const item of items) {
            const product = await MarketplaceListing.findById(item.itemId);
            if (!product) continue;

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
                productName: product.productType + ' - ' + JSON.stringify(product.productRef),
                quantity: item.quantity,
                priceAtTime: product.pricePerUnit,
                subtotal: price
            });
        }

        // 2. Calculate Final Payable
        const finalTax = subtotal * taxRate;
        const finalPayable = Math.round(totalAmount + finalTax);

        // 3. Create Razorpay Order (Single Payment for User)
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
                console.error("Razorpay Error:", rzpError);
                return res.status(500).json({ message: 'Payment gateway initialization failed', error: rzpError.description || rzpError.message });
            }
        }

        // 4. Create Individual Orders per Seller
        const orderIds = [];
        const sellerIds = Object.keys(sellerGroups);

        for (const sellerId of sellerIds) {
            const group = sellerGroups[sellerId];
            const groupTax = group.subtotal * taxRate;
            const groupTotal = Math.round(group.subtotal + groupTax);

            // Generate unique order number explicitly
            const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

            const order = new Order({
                orderNumber,
                buyer: req.user._id,
                seller: group.sellerId, // Separate Order per Seller
                items: group.items,
                totalAmount: groupTotal,
                razorpayOrderId: razorpayOrder.id, // Shared Payment ID
                deliveryAddress,
                deliveryStatus: 'pending',
                paymentStatus: 'pending'
            });

            await order.save();
            orderIds.push(order._id);
        }


        // 5. Deduct Stock
        for (const item of items) {
            const product = await MarketplaceListing.findById(item.itemId);
            if (product) {
                product.quantity -= item.quantity;
                if (product.quantity <= 0) {
                    product.quantity = 0;
                    product.status = 'sold';
                }
                await product.save();
            }
        }

        res.status(201).json({
            success: true,
            orderIds: orderIds, // Return array of IDs
            razorpayOrderId: razorpayOrder.id,
            amount: finalPayable,
            currency: "INR",
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ message: 'Order creation failed', error: error.message });
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
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Dev Mode Bypass
        if (razorpay_order_id && razorpay_order_id.startsWith('order_mock_')) {
            console.log("Dev Mode: Verifying Mock Payment");
            const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
            if (order) {
                order.paymentStatus = 'paid'; // 'Completed' -> 'paid' to match enum
                order.deliveryStatus = 'pending'; // Ensure delivery status is set
                order.razorpayPaymentId = razorpay_payment_id || `pay_mock_${Date.now()}`;

                order.statusHistory.push({
                    status: 'Payment Verified (Mock)',
                    updatedBy: req.user._id,
                    comment: 'Dev mode bypass'
                });

                await order.save();
                return res.json({ success: true, message: 'Mock Payment verified' });
            } else {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }
        }

        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder');

        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if (generated_signature === razorpay_signature) {
            // Payment Success
            const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
            if (order) {
                order.paymentStatus = 'paid'; // Updated to match enum 'paid'
                // order.orderStatus = 'Confirmed'; // removed as we use deliveryStatus
                order.razorpayPaymentId = razorpay_payment_id;

                order.statusHistory.push({
                    status: 'Payment Verified',
                    updatedBy: req.user._id,
                    comment: 'Razorpay signature valid'
                });

                await order.save();
            }
            res.json({ success: true, message: 'Payment verified' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Verification failed' });
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

// @desc    Create new marketplace product
// @route   POST /api/marketplace/products
// @access  Private (Farmer/Vendor)
exports.createProduct = async (req, res) => {
    try {
        const { productType, productRef, quantity, unit, pricePerUnit, location, description, images } = req.body;

        // Role Validation
        const isVendor = req.user.roles.includes('vendor') || req.user.activeRole === 'vendor';
        const isFarmer = req.user.roles.includes('farmer') || req.user.activeRole === 'farmer';

        if (!isVendor && !isFarmer) {
            return res.status(403).json({ message: 'Only Farmers and Vendors can list products' });
        }

        if (isVendor && req.user.vendorProfile?.status !== 'approved') {
            return res.status(403).json({ message: 'Vendor account pending approval' });
        }

        const newProduct = new MarketplaceListing({
            seller: req.user._id,
            productType,
            productRef, // { name: '...', category: '...' }
            quantity,
            unit,
            pricePerUnit,
            location: location || (req.user.vendorProfile?.pickupAddress ?
                `${req.user.vendorProfile.pickupAddress.city}, ${req.user.vendorProfile.pickupAddress.state}` : 'Unknown Interest Point'),
            description,
            images,
            status: 'active'
        });

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
        const { quantity, pricePerUnit, description, status, images } = req.body;

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
        if (images) product.images = images;

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
