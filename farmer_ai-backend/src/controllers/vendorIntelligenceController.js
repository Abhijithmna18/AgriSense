const axios = require('axios');
const MarketplaceListing = require('../models/MarketplaceListing');
const Order = require('../models/Order');
const Review = require('../models/Review');

const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:8000';

const callAI = async (endpoint, payload) => {
    const res = await axios.post(`${PYTHON_AI_URL}${endpoint}`, payload, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
};

// @desc   Get Inventory Stockout Predictions for all vendor listings
// @route  GET /api/vendor-intelligence/inventory
// @access Private (vendor)
exports.getInventoryInsights = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch vendor's active listings
        const listings = await MarketplaceListing.find({ seller: userId, status: 'active', isDeleted: { $ne: true } }).lean();

        if (!listings || listings.length === 0) {
            return res.status(200).json({ success: true, data: [], message: 'No active listings found.' });
        }

        // For each listing call Python stockout prediction
        const predictions = await Promise.all(
            listings.map(async (listing) => {
                try {
                    // Estimate average daily sales from order history (last 30 days)
                    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                    const recentOrders = await Order.aggregate([
                        {
                            $match: {
                                seller: userId,
                                createdAt: { $gte: thirtyDaysAgo },
                                state: { $in: ['DELIVERED', 'PAID', 'CONFIRMED'] }
                            }
                        },
                        { $unwind: '$items' },
                        { $match: { 'items.listing': listing._id } },
                        { $group: { _id: null, totalSold: { $sum: '$items.quantity' } } }
                    ]);

                    const totalSold = recentOrders[0]?.totalSold || 0;
                    const avgDailySales = totalSold > 0 ? totalSold / 30 : Math.max(1, listing.quantity * 0.05);

                    const payload = {
                        product_name: listing.name || listing.productType || 'Product',
                        current_stock: listing.quantity || 0,
                        unit: listing.unit || 'kg',
                        avg_daily_sales: avgDailySales,
                        price_per_unit: listing.pricePerUnit || 0
                    };

                    const aiResult = await callAI('/predict/inventory-stockout', payload);
                    return { listingId: listing._id, ...aiResult };
                } catch {
                    return {
                        listingId: listing._id,
                        product: listing.name || listing.productType || 'Unknown',
                        current_stock: listing.quantity,
                        unit: listing.unit,
                        status: 'Unknown',
                        urgency: 'Unable to predict',
                        days_until_stockout: null,
                        weekly_revenue_at_risk: 0,
                        recommendation: 'Check stock manually.'
                    };
                }
            })
        );

        res.status(200).json({ success: true, data: predictions });
    } catch (error) {
        console.error('Inventory insights error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to get inventory insights', error: error.message });
    }
};

// @desc   Get 7-day Demand Forecast for a product type
// @route  GET /api/vendor-intelligence/demand/:productType
// @access Private (vendor)
exports.getDemandForecast = async (req, res) => {
    try {
        const { productType } = req.params;
        const userId = req.user._id;
        const currentMonth = new Date().getMonth() + 1;

        // Get this vendor's listing matching productType
        const listing = await MarketplaceListing.findOne({
            seller: userId,
            productType: new RegExp(productType, 'i'),
            isDeleted: { $ne: true }
        }).lean();

        const currentPrice = listing?.pricePerUnit || 50;

        // Build daily sales history from last 14 days
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        let historyValues = [40, 45, 38, 50, 42, 47, 44]; // fallback demo values

        if (listing) {
            const salesHistory = await Order.aggregate([
                {
                    $match: {
                        seller: userId,
                        createdAt: { $gte: fourteenDaysAgo },
                        state: { $in: ['DELIVERED', 'PAID', 'CONFIRMED'] }
                    }
                },
                { $unwind: '$items' },
                { $match: { 'items.listing': listing._id } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        totalQty: { $sum: '$items.quantity' }
                    }
                },
                { $sort: { '_id': 1 } }
            ]);

            if (salesHistory.length > 0) {
                historyValues = salesHistory.map(s => s.totalQty);
            }
        }

        const aiResult = await callAI('/predict/demand-forecast', {
            product_type: productType,
            sales_history: historyValues,
            current_price: currentPrice,
            month: currentMonth
        });

        res.status(200).json({ success: true, data: aiResult });
    } catch (error) {
        console.error('Demand forecast error:', error.message);
        res.status(500).json({ success: false, message: 'Demand forecast failed', error: error.message });
    }
};

// @desc   Get Price Recommendations for all vendor listings
// @route  GET /api/vendor-intelligence/price-recommendations
// @access Private (vendor)
exports.getPriceRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;
        const listings = await MarketplaceListing.find({ seller: userId, status: 'active', isDeleted: { $ne: true } }).lean();

        if (!listings.length) {
            return res.status(200).json({ success: true, data: [], message: 'No active listings.' });
        }

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const recommendations = await Promise.all(
            listings.map(async (listing) => {
                try {
                    // Get competitor prices for same product type
                    const competitors = await MarketplaceListing.find({
                        productType: new RegExp(listing.productType, 'i'),
                        seller: { $ne: userId },
                        status: 'active',
                        isDeleted: { $ne: true }
                    }).select('pricePerUnit').lean();

                    const competitorPrices = competitors.map(c => c.pricePerUnit).filter(p => p > 0);
                    const marketAvg = competitorPrices.length > 0
                        ? competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length
                        : listing.pricePerUnit;

                    // Estimate demand score from recent order velocity
                    const recentOrderCount = await Order.countDocuments({
                        seller: userId,
                        'items.listing': listing._id,
                        createdAt: { $gte: sevenDaysAgo }
                    });
                    const demandScore = Math.min(1, recentOrderCount / 10);
                    const stockPct = Math.min(100, (listing.quantity / Math.max(listing.originalQuantity || 1, 1)) * 100);

                    const aiResult = await callAI('/predict/optimal-price', {
                        product_type: listing.productType || listing.name,
                        current_price: listing.pricePerUnit,
                        market_avg_price: marketAvg,
                        current_stock: stockPct,
                        demand_score: demandScore,
                        competitor_prices: competitorPrices.slice(0, 10)
                    });

                    return {
                        listingId: listing._id,
                        product_name: listing.name || listing.productType,
                        ...aiResult
                    };
                } catch {
                    return { listingId: listing._id, product_name: listing.name || listing.productType, error: 'AI unavailable' };
                }
            })
        );

        res.status(200).json({ success: true, data: recommendations });
    } catch (error) {
        console.error('Price recommendation error:', error.message);
        res.status(500).json({ success: false, message: 'Price recommendation failed', error: error.message });
    }
};

// @desc   Get Vendor Performance Score
// @route  GET /api/vendor-intelligence/performance-score
// @access Private (vendor)
exports.getVendorPerformanceScore = async (req, res) => {
    try {
        const userId = req.user._id;

        // Aggregate order stats using correct 'state' and 'seller' fields
        const orderStats = await Order.aggregate([
            { $match: { seller: userId } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $in: ['$state', ['DELIVERED']] }, 1, 0] }
                    },
                    cancelled: {
                        $sum: { $cond: [{ $eq: ['$state', 'CANCELLED'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Aggregate review stats using 'seller' field
        const reviewStats = await Review.aggregate([
            { $match: { seller: userId } },
            { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);

        const stats = orderStats[0] || { total: 0, completed: 0, cancelled: 0 };
        const avgRating = reviewStats[0]?.avgRating || 4.2;

        const aiResult = await callAI('/analyze/vendor-performance', {
            avg_rating: parseFloat(avgRating.toFixed(2)),
            total_orders: stats.total,
            completed_orders: stats.completed,
            cancelled_orders: stats.cancelled,
            avg_response_hours: 4  // placeholder — real tracking would require message timestamps
        });

        res.status(200).json({
            success: true,
            data: {
                ...aiResult,
                raw_stats: { ...stats, avgRating, reviewCount: reviewStats[0]?.count || 0 }
            }
        });
    } catch (error) {
        console.error('Vendor performance error:', error.message);
        res.status(500).json({ success: false, message: 'Performance score failed', error: error.message });
    }
};

// @desc   Get AI Negotiation Counter-Offer Suggestion
// @route  POST /api/vendor-intelligence/negotiate
// @access Private (vendor)
exports.getNegotiationSuggestion = async (req, res) => {
    try {
        const { productId, buyerOfferPrice } = req.body;
        const userId = req.user._id;

        if (!productId || !buyerOfferPrice) {
            return res.status(400).json({ success: false, message: 'productId and buyerOfferPrice are required.' });
        }

        const listing = await MarketplaceListing.findOne({ _id: productId, seller: userId, isDeleted: { $ne: true } }).lean();
        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found.' });
        }

        // Get market average from competitor listings
        const competitors = await MarketplaceListing.find({
            productType: new RegExp(listing.productType, 'i'),
            seller: { $ne: userId },
            status: 'active',
            isDeleted: { $ne: true }
        }).select('pricePerUnit').lean();

        const competitorPrices = competitors.map(c => c.pricePerUnit).filter(p => p > 0);
        const marketAvg = competitorPrices.length > 0
            ? competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length
            : listing.pricePerUnit;

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentOrders = await Order.countDocuments({
            seller: userId,
            'items.listing': listing._id,
            createdAt: { $gte: sevenDaysAgo }
        });
        const demandScore = Math.min(1, recentOrders / 10);
        const stockPct = Math.min(100, (listing.quantity / Math.max(listing.originalQuantity || 1, 1)) * 100);

        const aiResult = await callAI('/suggest/negotiation', {
            product_name: listing.name || listing.productType || 'Product',
            your_listed_price: listing.pricePerUnit,
            buyer_offer_price: parseFloat(buyerOfferPrice),
            market_avg_price: marketAvg,
            current_stock: stockPct,
            demand_score: demandScore
        });

        res.status(200).json({ success: true, data: aiResult });
    } catch (error) {
        console.error('Negotiation suggestion error:', error.message);
        res.status(500).json({ success: false, message: 'Negotiation suggestion failed', error: error.message });
    }
};

// @desc   Get Profit Analysis per product
// @route  GET /api/vendor-intelligence/profit-analysis
// @access Private (vendor)
exports.getProfitAnalysis = async (req, res) => {
    try {
        const userId = req.user._id;

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
            { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
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

        const totalRevenue = profitData.reduce((s, p) => s + (p.totalRevenue || 0), 0);
        const totalProfit = profitData.reduce((s, p) => s + (p.estimatedProfit || 0), 0);

        res.status(200).json({
            success: true,
            data: {
                products: profitData,
                summary: {
                    totalRevenue: Math.round(totalRevenue),
                    totalEstimatedProfit: Math.round(totalProfit),
                    overallMarginPct: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0,
                    topProduct: profitData[0]?.productName || null
                }
            }
        });
    } catch (error) {
        console.error('Profit analysis error:', error.message);
        res.status(500).json({ success: false, message: 'Profit analysis failed', error: error.message });
    }
};
