const Farm = require('../models/Farm');
const CropCycle = require('../models/CropCycle');
const FarmObservation = require('../models/FarmObservation');
const ActionLog = require('../models/ActionLog');
const Loan = require('../models/Loan'); // For financial aggregation
const AppError = require('../utils/AppError');

// ... existing code ...

// @desc    Get Farm Intelligence (Aggregated Data)
// @route   GET /api/farms/:id/intelligence
// @access  Private
exports.getFarmIntelligence = async (req, res, next) => {
    try {
        const farm = await Farm.findById(req.params.id);

        if (!farm) {
            throw new AppError('Farm not found', 404);
        }

        if (farm.user.toString() !== req.user.id) {
            throw new AppError('Not authorized', 403);
        }

        // Parallel Fetch for Performance
        const [activeCycles, pastCycles, observations, loans] = await Promise.all([
            CropCycle.find({ farm: farm._id, status: 'Active' }).sort({ sowingDate: -1 }),
            CropCycle.find({ farm: farm._id, status: { $ne: 'Active' } }).sort({ expectedHarvestDate: -1 }).limit(5),
            FarmObservation.find({ farm: farm._id }).sort({ date: -1 }).limit(10),
            Loan.find({ farmer: req.user.id }).sort({ createdAt: -1 }) // Loans are user-centric generally
        ]);

        // Construct Intelligence Object
        const intelligence = {
            farmProfile: farm,
            cropCycles: {
                active: activeCycles,
                history: pastCycles
            },
            observations: observations,
            financials: {
                activeLoans: loans.filter(l => l.status === 'active' || l.status === 'approved'),
                loanHistory: loans.filter(l => l.status === 'closed')
            }
        };

        res.status(200).json({
            success: true,
            data: intelligence
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Add Crop Cycle
// @route   POST /api/farms/:id/crop-cycles
// @access  Private
exports.addCropCycle = async (req, res, next) => {
    try {
        const farm = await Farm.findById(req.params.id);
        if (!farm) throw new AppError('Farm not found', 404);
        if (farm.user.toString() !== req.user.id) throw new AppError('Not authorized', 403);

        const cycle = await CropCycle.create({
            farm: req.params.id,
            ...req.body
        });

        res.status(201).json({ success: true, data: cycle });
    } catch (err) {
        next(err);
    }
};

// @desc    Update Crop Cycle
// @route   PUT /api/farms/crop-cycles/:id
// @access  Private
exports.updateCropCycle = async (req, res, next) => {
    try {
        let cycle = await CropCycle.findById(req.params.id).populate('farm');
        if (!cycle) throw new AppError('Crop Cycle not found', 404);
        if (cycle.farm.user.toString() !== req.user.id) throw new AppError('Not authorized', 403);

        cycle = await CropCycle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: cycle });
    } catch (err) {
        next(err);
    }
};

// @desc    Add Observation
// @route   POST /api/farms/:id/observations
// @access  Private
exports.addObservation = async (req, res, next) => {
    try {
        const farm = await Farm.findById(req.params.id);
        if (!farm) throw new AppError('Farm not found', 404);
        if (farm.user.toString() !== req.user.id) throw new AppError('Not authorized', 403);

        const observation = await FarmObservation.create({
            farm: req.params.id,
            ...req.body
        });

        res.status(201).json({ success: true, data: observation });
    } catch (err) {
        next(err);
    }
};

// @desc    Log User Action
// @route   POST /api/farms/:id/actions
// @access  Private
exports.logAction = async (req, res, next) => {
    try {
        const { entityId, entityType, action, notes } = req.body;

        await ActionLog.create({
            farm: req.params.id,
            user: req.user.id,
            entityId,
            entityType,
            action,
            notes
        });

        res.status(201).json({ success: true, message: 'Action logged' });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all farms for logged-in user
// @route   GET /api/farms
// @access  Private
exports.getFarms = async (req, res, next) => {
    try {
        const farms = await Farm.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: farms.length,
            data: farms
        });
    } catch (err) {
        console.error('Error fetching farms:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching farms',
            error: err.message
        });
    }
};

// @desc    Get all farms (Admin)
// @route   GET /api/farms/admin/all
// @access  Private (Admin)
exports.getAllFarms = async (req, res, next) => {
    try {
        const farms = await Farm.find()
            .populate('user', 'firstName lastName email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: farms.length,
            data: farms
        });
    } catch (err) {
        console.error('Error fetching all farms:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching farms',
            error: err.message
        });
    }
};

// @desc    Get single farm by ID
// @route   GET /api/farms/:id
// @access  Private
exports.getFarm = async (req, res, next) => {
    try {
        const farm = await Farm.findById(req.params.id);

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found'
            });
        }

        // Check ownership
        if (farm.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this farm'
            });
        }

        res.status(200).json({
            success: true,
            data: farm
        });
    } catch (err) {
        console.error('Error fetching farm:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching farm',
            error: err.message
        });
    }
};

// Helper to calculate readiness score
const calculateReadiness = (data) => {
    let score = 0;
    const weights = {
        identity: 20, // Name, Area, Type
        location: 20, // Coordinates, District
        soil: 30,     // Type + Test Data
        water: 20,    // Availability + Power
        history: 10   // Past crops
    };

    // 1. Identity (Basic fields are required, so this is usually safe)
    if (data.name && data.totalArea > 0 && data.irrigationType) score += weights.identity;

    // 2. Location
    if (data.location?.coordinates && data.location?.district) score += weights.location;

    // 3. Soil
    if (data.soilType) {
        score += 10; // Base for type
        // Bonus for test data
        if (data.soilDataSource === 'Lab Tested' && data.soilTest?.n && data.soilTest?.p) {
            score += 20;
        } else if (data.soilDataSource === 'Estimated') {
            score += 10;
        }
    }

    // 4. Water
    if (data.waterAvailability && data.waterReliability) score += weights.water;

    // 5. History
    if (data.cropHistory && data.cropHistory.length > 0) score += weights.history;

    return Math.min(100, score);
};

// @desc    Create new farm
// @route   POST /api/farms
// @access  Private
exports.createFarm = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.user = req.user.id;

        // Calculate readiness
        req.body.dataReadinessScore = calculateReadiness(req.body);

        const farm = await Farm.create(req.body);

        res.status(201).json({
            success: true,
            data: farm
        });
    } catch (err) {
        console.error('Error creating farm:', err);
        console.error('Validation Errors:', err.errors); // Log specific validation errors
        res.status(400).json({
            success: false,
            message: err.message || 'Error creating farm', // Send back useful message
            error: err.message
        });
    }
};

// @desc    Update farm
// @route   PUT /api/farms/:id
// @access  Private
exports.updateFarm = async (req, res, next) => {
    try {
        let farm = await Farm.findById(req.params.id);

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found'
            });
        }

        // Check ownership
        if (farm.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this farm'
            });
        }

        // Merge existing data with updates to calculate new score
        const mergedData = { ...farm.toObject(), ...req.body };
        req.body.dataReadinessScore = calculateReadiness(mergedData);

        farm = await Farm.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: farm
        });
    } catch (err) {
        console.error('Error updating farm:', err);
        res.status(400).json({
            success: false,
            message: 'Error updating farm',
            error: err.message
        });
    }
};

// @desc    Delete farm
// @route   DELETE /api/farms/:id
// @access  Private
exports.deleteFarm = async (req, res, next) => {
    try {
        const farm = await Farm.findById(req.params.id);

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found'
            });
        }

        // Check ownership
        if (farm.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this farm'
            });
        }

        await farm.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error('Error deleting farm:', err);
        res.status(500).json({
            success: false,
            message: 'Error deleting farm',
            error: err.message
        });
    }
};

// @desc    Record Harvest Data
// @route   PUT /api/farms/crop-cycles/:id/harvest
// @access  Private
exports.recordHarvest = async (req, res, next) => {
    try {
        const { harvestedQty, marketableQty, wastageQty, date, yieldActual } = req.body;
        let cycle = await CropCycle.findById(req.params.id).populate('farm');

        if (!cycle) throw new AppError('Crop Cycle not found', 404);
        if (cycle.farm.user.toString() !== req.user.id) throw new AppError('Not authorized', 403);

        if (cycle.status === 'Completed') throw new AppError('Harvest already recorded and cycle closed', 400);

        // Update fields
        cycle.harvestedQuantity = harvestedQty || 0;
        cycle.marketableQuantity = marketableQty || 0;
        cycle.wastageQuantity = wastageQty || 0;
        cycle.yieldActual = yieldActual || harvestedQty || 0;
        cycle.actualHarvestDate = date || new Date();
        cycle.status = 'Completed'; // Close the cycle

        await cycle.save();

        res.status(200).json({ success: true, message: 'Harvest recorded successfully', data: cycle });
    } catch (err) {
        next(err);
    }
};
