const OperationRecord = require('../models/OperationRecord');
const analyticsService = require('../services/operationAnalyticsService');

// @desc    Get all operations for a farmer (with optional filters)
// @route   GET /api/operations
// @access  Private (Farmer/Admin)
exports.getOperations = async (req, res, next) => {
    try {
        const { farmId, status, type, dateRange } = req.query;
        let query = { userId: req.user._id };

        if (farmId) query.farmId = farmId;
        if (status) query.status = status;
        if (type) query.type = type;

        if (dateRange) {
            const today = new Date();
            if (dateRange === 'today') {
                const start = new Date(today.setHours(0, 0, 0, 0));
                const end = new Date(today.setHours(23, 59, 59, 999));
                query.scheduledDate = { $gte: start, $lte: end };
            } else if (dateRange === 'week') {
                const start = new Date(today);
                start.setDate(today.getDate() - today.getDay());
                const end = new Date(start);
                end.setDate(start.getDate() + 6);
                query.scheduledDate = { $gte: start, $lte: end };
            } else if (dateRange === 'upcoming') {
                query.scheduledDate = { $gte: today };
            }
        }

        const operations = await OperationRecord.find(query).sort({ scheduledDate: 1 }).populate('farmId', 'name');

        res.status(200).json({
            success: true,
            count: operations.length,
            data: operations
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a new operation
// @route   POST /api/operations
// @access  Private
exports.createOperation = async (req, res, next) => {
    try {
        req.body.userId = req.user._id;

        const operation = await OperationRecord.create(req.body);

        res.status(201).json({
            success: true,
            data: operation
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update operation status
// @route   PUT /api/operations/:id
// @access  Private
exports.updateOperation = async (req, res, next) => {
    try {
        let operation = await OperationRecord.findById(req.params.id);

        if (!operation) {
            return res.status(404).json({ success: false, message: 'Operation not found' });
        }

        if (operation.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Only allow updating certain fields (status, notes)
        operation = await OperationRecord.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: operation
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Analytics & Weather Warnings
// @route   GET /api/operations/analytics/:farmId
// @access  Private
exports.getAnalytics = async (req, res, next) => {
    try {
        const { farmId } = req.params;

        // Fetch analytical summary (Efficiency, Costs, Completion Rates)
        const summary = await analyticsService.getOperationsSummary(farmId, req.user._id);

        // Fetch upcoming operations and pass to weather service
        const upcomingOps = await OperationRecord.find({
            farmId,
            userId: req.user._id,
            status: { $in: ['Pending', 'In Progress'] },
            scheduledDate: { $gte: new Date() }
        });

        const weatherAlerts = await analyticsService.analyzeWeatherRisks(farmId, upcomingOps);

        res.status(200).json({
            success: true,
            data: {
                summary,
                weatherAlerts
            }
        });

    } catch (err) {
        next(err);
    }
};
