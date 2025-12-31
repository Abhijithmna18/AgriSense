const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createWarehouse,
    getWarehouses,
    getWarehouseById,
    updateWarehouse,
    deleteWarehouse
} = require('../controllers/warehouseController');
const { generateAiReport } = require('../controllers/warehouseReportController');

// Public route to view warehouses
router.get('/', getWarehouses);
router.get('/:id', getWarehouseById);

// Admin routes for Management
router.post('/', protect, authorize('admin'), createWarehouse);
router.put('/:id', protect, authorize('admin'), updateWarehouse);
router.delete('/:id', protect, authorize('admin'), deleteWarehouse);

// Admin route for AI Reports
router.get('/reports/ai', protect, authorize('admin'), generateAiReport);

module.exports = router;
