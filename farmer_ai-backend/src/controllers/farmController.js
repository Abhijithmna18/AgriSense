const Farm = require('../models/Farm');

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
