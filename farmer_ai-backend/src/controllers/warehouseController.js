const Warehouse = require('../models/Warehouse');
const BookingRequest = require('../models/BookingRequest');

// @desc    Create a new warehouse
// @route   POST /api/admin/warehouses
// @access  Admin only
exports.createWarehouse = async (req, res) => {
    try {
        console.log('Create Warehouse Body:', req.body);
        const warehouse = await Warehouse.create({
            ...req.body,
            manager: req.user.id
        });
        res.status(201).json({ success: true, data: warehouse });
    } catch (error) {
        console.error('Create Warehouse Error:', error);
        // Fallback or specific message
        res.status(400).json({ success: false, message: error.message || 'Validation Error' });
    }
};

// @desc    Get all warehouses with filters
// @route   GET /api/warehouses
// @access  Public (some fields), Admin (all fields)
exports.getWarehouses = async (req, res) => {
    try {
        const { crop, minCapacity, storageType, location } = req.query;
        let query = { status: 'ACTIVE' }; // Default only active

        if (req.user && req.user.role === 'admin') {
            delete query.status; // Admin sees all
        }

        if (crop) {
            query['specifications.supportedCrops'] = { $regex: crop, $options: 'i' };
        }
        if (minCapacity) {
            query['capacity.available'] = { $gte: Number(minCapacity) };
        }
        if (storageType) {
            query['specifications.type'] = storageType;
        }
        if (location) {
            query.$or = [
                { 'location.city': { $regex: location, $options: 'i' } },
                { 'location.state': { $regex: location, $options: 'i' } }
            ];
        }

        const warehouses = await Warehouse.find(query).sort('-createdAt');
        res.status(200).json({ success: true, count: warehouses.length, data: warehouses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single warehouse
// @route   GET /api/warehouses/:id
// @access  Public
exports.getWarehouseById = async (req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);
        if (!warehouse) {
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        }
        res.status(200).json({ success: true, data: warehouse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update warehouse
// @route   PUT /api/admin/warehouses/:id
// @access  Admin only
exports.updateWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!warehouse) {
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        }
        res.status(200).json({ success: true, data: warehouse });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete warehouse (soft delete/deactivate)
// @route   DELETE /api/admin/warehouses/:id
// @access  Admin only
exports.deleteWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, { status: 'INACTIVE' }, { new: true });
        if (!warehouse) {
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        }
        res.status(200).json({ success: true, message: 'Warehouse deactivated', data: warehouse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
