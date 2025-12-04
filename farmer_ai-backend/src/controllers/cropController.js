const Crop = require('../models/Crop');

// @desc    Create a new crop
// @route   POST /api/crops
// @access  Private/Admin
const createCrop = async (req, res) => {
    try {
        const crop = await Crop.create(req.body);
        res.status(201).json(crop);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all crops with pagination
// @route   GET /api/crops
// @access  Public
const getCrops = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        const total = await Crop.countDocuments();
        const crops = await Crop.find().skip(startIndex).limit(limit);

        res.status(200).json({
            success: true,
            count: crops.length,
            total,
            pagination: {
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: crops
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single crop
// @route   GET /api/crops/:id
// @access  Public
const getCropById = async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id);

        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        res.status(200).json(crop);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update crop
// @route   PUT /api/crops/:id
// @access  Private/Admin
const updateCrop = async (req, res) => {
    try {
        let crop = await Crop.findById(req.params.id);

        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        crop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json(crop);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete crop
// @route   DELETE /api/crops/:id
// @access  Private/Admin
const deleteCrop = async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id);

        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        await crop.deleteOne();

        res.status(200).json({ message: 'Crop removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCrop,
    getCrops,
    getCropById,
    updateCrop,
    deleteCrop
};
