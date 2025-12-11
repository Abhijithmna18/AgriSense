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
        const pendingModeration = 0; // Placeholder until moderation logic is explicit
        // const marketplaceListings = await MarketplaceItem.countDocuments(); 

        res.json({
            users: usersCount,
            farms: farmsCount,
            pendingModeration,
            recommendationsPending: 0,
            systemHealth: 'Healthy' // detailed check can be added later
        });
    } catch (error) {
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
            // Continue even if logging fails
        }

        res.json({ message: `User ${suspend ? 'suspended' : 'activated'}`, user });
    } catch (error) {
        console.error('Suspend user error:', error);
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
            .populate('adminId', 'name email')
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));
        res.json(logs);
    } catch (error) {
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

module.exports = router;
