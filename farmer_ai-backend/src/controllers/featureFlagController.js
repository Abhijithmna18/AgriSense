const FeatureFlag = require('../models/FeatureFlag');
const AdminAudit = require('../models/AdminAudit');

// @desc    Get all feature flags
// @route   GET /api/admin/feature-flags
// @access  Private/Admin
exports.getFeatureFlags = async (req, res) => {
    try {
        const { search, environment, status, page = 1, limit = 10 } = req.query;
        
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { key: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (environment && environment !== 'all') {
            query.environment = environment;
        }

        if (status) {
            query.isEnabled = status === 'enabled';
        }

        const flags = await FeatureFlag.find(query)
            .populate('createdBy', 'firstName lastName email')
            .populate('updatedBy', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await FeatureFlag.countDocuments(query);

        res.json({
            flags,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error('Get feature flags error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single feature flag
// @route   GET /api/admin/feature-flags/:id
// @access  Private/Admin
exports.getFeatureFlag = async (req, res) => {
    try {
        const flag = await FeatureFlag.findById(req.params.id)
            .populate('createdBy', 'firstName lastName email')
            .populate('updatedBy', 'firstName lastName email')
            .populate('targetUsers', 'firstName lastName email');
        
        if (!flag) {
            return res.status(404).json({ message: 'Feature flag not found' });
        }

        res.json(flag);
    } catch (error) {
        console.error('Get feature flag error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create feature flag
// @route   POST /api/admin/feature-flags
// @access  Private/Admin
exports.createFeatureFlag = async (req, res) => {
    try {
        const { name, key, description, isEnabled, environment, rolloutPercentage, targetRoles, targetUsers } = req.body;

        // Check if key already exists
        const existingFlag = await FeatureFlag.findOne({ key: key.toLowerCase() });
        if (existingFlag) {
            return res.status(400).json({ message: 'Feature flag with this key already exists' });
        }

        const flag = await FeatureFlag.create({
            name,
            key: key.toLowerCase(),
            description,
            isEnabled: isEnabled || false,
            environment: environment || 'production',
            rolloutPercentage: rolloutPercentage || 100,
            targetRoles: targetRoles || [],
            targetUsers: targetUsers || [],
            createdBy: req.user._id,
            updatedBy: req.user._id
        });

        // Log audit
        await AdminAudit.create({
            action: 'feature_flag_created',
            performedBy: req.user._id,
            targetModel: 'FeatureFlag',
            targetId: flag._id,
            details: { flagKey: key, isEnabled }
        });

        const populatedFlag = await FeatureFlag.findById(flag._id)
            .populate('createdBy', 'firstName lastName email')
            .populate('updatedBy', 'firstName lastName email');

        res.status(201).json(populatedFlag);
    } catch (error) {
        console.error('Create feature flag error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update feature flag
// @route   PUT /api/admin/feature-flags/:id
// @access  Private/Admin
exports.updateFeatureFlag = async (req, res) => {
    try {
        const { name, description, isEnabled, environment, rolloutPercentage, targetRoles, targetUsers } = req.body;

        const flag = await FeatureFlag.findById(req.params.id);
        if (!flag) {
            return res.status(404).json({ message: 'Feature flag not found' });
        }

        const before = { ...flag.toObject() };

        flag.name = name || flag.name;
        flag.description = description || flag.description;
        flag.isEnabled = isEnabled !== undefined ? isEnabled : flag.isEnabled;
        flag.environment = environment || flag.environment;
        flag.rolloutPercentage = rolloutPercentage !== undefined ? rolloutPercentage : flag.rolloutPercentage;
        flag.targetRoles = targetRoles !== undefined ? targetRoles : flag.targetRoles;
        flag.targetUsers = targetUsers !== undefined ? targetUsers : flag.targetUsers;
        flag.updatedBy = req.user._id;

        await flag.save();

        // Log audit
        await AdminAudit.create({
            action: 'feature_flag_updated',
            performedBy: req.user._id,
            targetModel: 'FeatureFlag',
            targetId: flag._id,
            details: { 
                flagKey: flag.key,
                before: { isEnabled: before.isEnabled, rolloutPercentage: before.rolloutPercentage },
                after: { isEnabled: flag.isEnabled, rolloutPercentage: flag.rolloutPercentage }
            }
        });

        const updatedFlag = await FeatureFlag.findById(flag._id)
            .populate('createdBy', 'firstName lastName email')
            .populate('updatedBy', 'firstName lastName email');

        res.json(updatedFlag);
    } catch (error) {
        console.error('Update feature flag error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Toggle feature flag
// @route   PATCH /api/admin/feature-flags/:id/toggle
// @access  Private/Admin
exports.toggleFeatureFlag = async (req, res) => {
    try {
        const flag = await FeatureFlag.findById(req.params.id);
        
        if (!flag) {
            return res.status(404).json({ message: 'Feature flag not found' });
        }

        const before = flag.isEnabled;
        flag.isEnabled = !flag.isEnabled;
        flag.updatedBy = req.user._id;

        await flag.save();

        // Log audit
        await AdminAudit.create({
            action: 'feature_flag_toggled',
            performedBy: req.user._id,
            targetModel: 'FeatureFlag',
            targetId: flag._id,
            details: { 
                flagKey: flag.key,
                before: before,
                after: flag.isEnabled
            }
        });

        const updatedFlag = await FeatureFlag.findById(flag._id)
            .populate('createdBy', 'firstName lastName email')
            .populate('updatedBy', 'firstName lastName email');

        res.json(updatedFlag);
    } catch (error) {
        console.error('Toggle feature flag error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete feature flag
// @route   DELETE /api/admin/feature-flags/:id
// @access  Private/Admin
exports.deleteFeatureFlag = async (req, res) => {
    try {
        const flag = await FeatureFlag.findById(req.params.id);
        
        if (!flag) {
            return res.status(404).json({ message: 'Feature flag not found' });
        }

        await flag.deleteOne();

        // Log audit
        await AdminAudit.create({
            action: 'feature_flag_deleted',
            performedBy: req.user._id,
            targetModel: 'FeatureFlag',
            targetId: flag._id,
            details: { flagKey: flag.key }
        });

        res.json({ message: 'Feature flag deleted successfully' });
    } catch (error) {
        console.error('Delete feature flag error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Check if feature is enabled for user
// @route   GET /api/feature-flags/check/:key
// @access  Public
exports.checkFeatureFlag = async (req, res) => {
    try {
        const { key } = req.params;
        const userId = req.user?._id;
        const userRole = req.user?.activeRole;

        const flag = await FeatureFlag.findOne({ key: key.toLowerCase() });

        if (!flag) {
            return res.json({ enabled: false, reason: 'Flag not found' });
        }

        if (!flag.isEnabled) {
            return res.json({ enabled: false, reason: 'Flag disabled' });
        }

        // Check role targeting
        if (flag.targetRoles && flag.targetRoles.length > 0) {
            if (!userRole || !flag.targetRoles.includes(userRole)) {
                return res.json({ enabled: false, reason: 'Role not targeted' });
            }
        }

        // Check user targeting
        if (flag.targetUsers && flag.targetUsers.length > 0) {
            if (!userId || !flag.targetUsers.some(id => id.toString() === userId.toString())) {
                return res.json({ enabled: false, reason: 'User not targeted' });
            }
        }

        // Check rollout percentage
        if (flag.rolloutPercentage < 100) {
            // Simple hash-based rollout
            const hash = userId ? userId.toString().charCodeAt(0) % 100 : Math.random() * 100;
            if (hash >= flag.rolloutPercentage) {
                return res.json({ enabled: false, reason: 'Not in rollout percentage' });
            }
        }

        res.json({ enabled: true, flag });
    } catch (error) {
        console.error('Check feature flag error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
