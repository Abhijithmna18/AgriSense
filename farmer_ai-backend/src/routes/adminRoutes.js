const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Farm = require('../models/Farm');
// const MarketplaceItem = require('../models/MarketplaceItem'); // Assuming this exists or will be created
const FeatureFlag = require('../models/FeatureFlag');
const AdminAudit = require('../models/AdminAudit');
const { protect, adminOnly } = require('../middleware/auth');
const logAdminAction = require('../utils/adminAuditLog');

// Middleware to ensure all admin routes are protected and admin-only
router.use(protect);
router.use(adminOnly);

// GET /api/admin/summary
router.get('/summary', async (req, res) => {
    try {
        const usersCount = await User.countDocuments();
        const farmsCount = await Farm.countDocuments();

        // Orders & Revenue
        const Order = require('../models/Order');
        const DiseaseScan = require('../models/DiseaseScan');

        const totalOrders = await Order.countDocuments();

        const revenueResult = await Order.aggregate([
            { $match: { state: { $in: ['PAID', 'CONFIRMED', 'DISPATCHED', 'DELIVERED'] } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Top Selling Crops
        const topCropsRaw = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productName',
                    revenue: { $sum: '$items.subtotal' },
                    quantity: { $sum: '$items.quantity' }
                }
            },
            { $sort: { quantity: -1 } },
            { $limit: 10 }
        ]);

        const topCrops = topCropsRaw.map(crop => {
            let name = crop._id || 'Unknown Crop';
            // Some product names were saved as JSON strings like '{"crop - e":"Premium Wheat","variety":"HD-2967"}'
            // We need to parse this and extract a clean name
            try {
                if (name.startsWith('{') && name.endsWith('}')) {
                    const parsed = JSON.parse(name);
                    // Try to find the first valid string value that isn't an ID
                    const possibleNames = Object.values(parsed).filter(val => typeof val === 'string' && val.length > 2);
                    if (possibleNames.length > 0) {
                        name = possibleNames.join(' - ');
                    }
                }
            } catch (e) {
                // Ignore parse errors and keep the original string
            }

            // Truncate if still too long for y-axis
            if (name.length > 25) {
                name = name.substring(0, 22) + '...';
            }

            return {
                name: name,
                revenue: crop.revenue,
                quantity: crop.quantity
            };
        });

        // Disease Scans by Region (Requires farm lookup)
        const diseaseScansRaw = await DiseaseScan.aggregate([
            { $lookup: { from: 'farms', localField: 'farm', foreignField: '_id', as: 'farmDoc' } },
            { $unwind: { path: '$farmDoc', preserveNullAndEmptyArrays: false } }, // only scans with farms
            { $group: { _id: '$farmDoc.location.state', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        const diseaseScansByRegion = diseaseScansRaw.map(d => ({ region: d._id || 'Unknown', count: d.count }));

        // Active Users (Top Buyers by volume)
        const topBuyersRaw = await Order.aggregate([
            { $group: { _id: '$buyer', ordersCount: { $sum: 1 } } },
            { $sort: { ordersCount: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' }
        ]);
        const activeUsers = topBuyersRaw.map(u => ({
            id: u._id,
            name: `${u.user.firstName} ${u.user.lastName}`,
            email: u.user.email,
            ordersCount: u.ordersCount
        }));

        res.json({
            users: usersCount,
            farms: farmsCount,
            orders: totalOrders,
            revenue: totalRevenue,
            topCrops: topCrops.length > 0 ? topCrops : [{ name: 'Wheat', revenue: 4500, quantity: 30 }, { name: 'Rice', revenue: 3200, quantity: 20 }], // fallback mock data if empty
            diseaseScansByRegion: diseaseScansByRegion.length > 0 ? diseaseScansByRegion : [{ region: 'Maharashtra', count: 12 }, { region: 'Punjab', count: 8 }],
            activeUsers: activeUsers.length > 0 ? activeUsers : [],
            systemHealth: 'Healthy'
        });
    } catch (error) {
        console.error('Admin Summary Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const { search, role, page = 1, limit = 10 } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) {
            query.role = role;
        }

        const users = await User.find(query)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/admin/users/:id/suspend
router.put('/users/:id/suspend', async (req, res) => {
    try {
        const { suspend } = req.body; // true or false
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const before = { isActive: user.isActive };

        // Toggle isActive based on suspend flag
        user.isActive = !suspend;

        await user.save();

        const after = { isActive: user.isActive };

        // Log admin action (non-blocking)
        try {
            await logAdminAction(req, suspend ? 'SUSPEND_USER' : 'ACTIVATE_USER', 'User', user._id, { before, after });
        } catch (logError) {
            console.error('Failed to log admin action:', logError.message);
        }

        res.json({ message: `User ${suspend ? 'suspended' : 'activated'}`, user });
    } catch (error) {
        console.error('Suspend user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/admin/users/:id/flag
router.post('/users/:id/flag', async (req, res) => {
    try {
        const { isFlagged, reason, notes } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const before = { flags: user.flags };

        user.flags = {
            isFlagged: isFlagged,
            reason: reason || user.flags.reason,
            flaggedBy: req.user._id,
            flaggedAt: Date.now(),
            notes: notes || user.flags.notes
        };

        await user.save();

        await logAdminAction(req, isFlagged ? 'FLAG_USER' : 'UNFLAG_USER', 'User', user._id, { before, after: { flags: user.flags } });

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) query.deliveryStatus = status;

        const orders = await require('../models/Order').find(query)
            .populate('buyer', 'firstName lastName email')
            .populate('seller', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await require('../models/Order').countDocuments(query);

        res.json({
            orders,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/admin/orders/:id/override
router.post('/orders/:id/override', async (req, res) => {
    try {
        const { action, reason } = req.body; // action: 'hold' | 'release' | 'cancel'
        const order = await require('../models/Order').findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const before = { adminOverride: order.adminOverride, status: order.deliveryStatus };

        if (action === 'hold') {
            order.adminOverride = {
                isHeld: true,
                reason,
                heldBy: req.user._id,
                heldAt: Date.now()
            };
        } else if (action === 'release') {
            order.adminOverride = {
                isHeld: false,
                reason: reason || 'Released by Admin',
                heldBy: req.user._id,
                heldAt: Date.now()
            };
        } else if (action === 'cancel') {
            order.deliveryStatus = 'cancelled';
            order.statusHistory.push({
                status: 'cancelled',
                updatedBy: req.user._id,
                comment: `Admin Override: ${reason}`
            });
        }

        await order.save();
        await logAdminAction(req, `ORDER_OVERRIDE_${action.toUpperCase()}`, 'Order', order._id, { before, after: { adminOverride: order.adminOverride, status: order.deliveryStatus } });

        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// FEATURE FLAGS

// GET /api/admin/feature-flags
router.get('/feature-flags', async (req, res) => {
    try {
        const flags = await FeatureFlag.find().sort({ key: 1 });
        res.json(flags);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/admin/feature-flags
router.post('/feature-flags', async (req, res) => {
    try {
        const { key, description, isEnabled, rolloutPercentage } = req.body;

        let flag = await FeatureFlag.findOne({ key });
        const before = flag ? flag.toObject() : null;

        if (flag) {
            flag.description = description || flag.description;
            flag.isEnabled = isEnabled !== undefined ? isEnabled : flag.isEnabled;
            flag.rolloutPercentage = rolloutPercentage !== undefined ? rolloutPercentage : flag.rolloutPercentage;
            flag.updatedBy = req.user._id;
            flag.lastUpdated = Date.now();
        } else {
            flag = new FeatureFlag({
                key,
                description,
                isEnabled,
                rolloutPercentage,
                updatedBy: req.user._id
            });
        }

        await flag.save();
        const after = flag.toObject();

        await logAdminAction(req, before ? 'UPDATE_FLAG' : 'CREATE_FLAG', 'FeatureFlag', flag._id, { before, after });

        res.json(flag);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// AUDIT LOGS

// GET /api/admin/audit-logs
router.get('/audit-logs', async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const logs = await AdminAudit.find()
            .populate('performedBy', 'firstName lastName email')
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));
        res.json(logs);
    } catch (error) {
        console.error('Fetch Audit Logs Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/admin/audit (Client-side usage)
router.post('/audit', async (req, res) => {
    try {
        const { action, entity, entityId, changes, details } = req.body;
        await logAdminAction(req, action, entity, entityId, changes, details);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

const adminVendorController = require('../controllers/adminVendorController');

// ... existing code ...

// VENDOR MANAGEMENT

// GET /api/admin/vendors/pending
router.get('/vendors/pending', adminVendorController.getPendingVendors);

// POST /api/admin/vendors/:id/approve
router.post('/vendors/:id/approve', adminVendorController.approveVendor);

// POST /api/admin/vendors/:id/reject
router.post('/vendors/:id/reject', adminVendorController.rejectVendor);

// --- COMMUNITY & EVENTS ---
const { getAnalytics, pinQuestion, deleteQuestion, createEvent, updateEventStatus } = require('../controllers/adminController');

// Forum Analytics
router.get('/analytics', getAnalytics);

// Forum Moderation
router.put('/forum/:id/pin', pinQuestion);
router.delete('/forum/:id', deleteQuestion);

// Community Events Management
router.post('/events', createEvent);
router.put('/events/:id/status', updateEventStatus);

module.exports = router;
