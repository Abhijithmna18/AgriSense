const mongoose = require('mongoose');

const warehouseIncomeSnapshotSchema = new mongoose.Schema({
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    period: {
        month: { type: Number, required: true }, // 1-12
        year: { type: Number, required: true }
    },
    metrics: {
        totalBookings: { type: Number, default: 0 },
        totalIncome: { type: Number, default: 0 },
        averageUtilizationPct: { type: Number, default: 0 }, // Avg % capacity used
        rejectedRequests: { type: Number, default: 0 }
    },
    cropBreakdown: [
        {
            cropName: String,
            totalQuantity: Number,
            incomeShare: Number
        }
    ],
    generatedAt: { type: Date, default: Date.now }
});

// Compound index to ensure one snapshot per warehouse per month
warehouseIncomeSnapshotSchema.index({ warehouse: 1, 'period.year': 1, 'period.month': 1 }, { unique: true });

module.exports = mongoose.model('WarehouseIncomeSnapshot', warehouseIncomeSnapshotSchema);
