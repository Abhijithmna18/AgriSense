const OperationRecord = require('../models/OperationRecord');
const axios = require('axios'); // For weather simulation/fetching 

/**
 * Summarizes operations metrics for a given farm
 */
exports.getOperationsSummary = async (farmId, userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const ops = await OperationRecord.find({
        farmId,
        userId,
        scheduledDate: { $gte: startOfWeek }
    });

    const totalOps = ops.length;
    const completedOps = ops.filter(op => op.status === 'Completed').length;
    const pendingOps = ops.filter(op => op.status === 'Pending' || op.status === 'In Progress').length;

    const efficiencyScore = totalOps === 0 ? 100 : Math.round((completedOps / totalOps) * 100);

    // Resource aggregation
    let totalCost = 0;
    let totalWater = 0;
    let totalFertilizer = 0;
    let totalLabor = 0;

    ops.forEach(op => {
        totalCost += (op.costEstimate || 0);
        totalWater += (op.resourcesRequired?.waterLiters || 0);
        totalFertilizer += (op.resourcesRequired?.fertilizerKg || 0);
        totalLabor += (op.resourcesRequired?.laborHours || 0);
    });

    return {
        totalOps,
        completedOps,
        pendingOps,
        efficiencyScore,
        resources: {
            totalCost,
            totalWater,
            totalFertilizer,
            totalLabor
        }
    };
};

/**
 * Analyzes weather risks for upcoming operations.
 * If Irrigation -> warn if raining.
 * If Spraying -> warn if high wind or rain.
 */
exports.analyzeWeatherRisks = async (farmId, upcomingOps) => {
    // In a real scenario, fetch farm coordinates from DB, then query a weather API
    // For demonstration, we simulate weather data mimicking a random API response
    const mockWindSpeed = Math.random() * 30; // 0 to 30 km/h
    const mockRainMM = Math.random() * 20;     // 0 to 20 mm

    const warnings = [];

    upcomingOps.forEach(op => {
        if (op.type === 'Spraying' && mockWindSpeed > 15) {
            warnings.push({
                operationId: op._id,
                title: 'High Wind Warning',
                message: `Wind speed is high (${mockWindSpeed.toFixed(1)} km/h). Spraying is not recommended due to drift.`,
                suggestion: 'Reschedule to early morning or late evening.'
            });
        }

        if (op.type === 'Spraying' && mockRainMM > 1) {
            warnings.push({
                operationId: op._id,
                title: 'Rain Warning',
                message: `Rain expected (${mockRainMM.toFixed(1)} mm). Spraying chemicals may wash off and be ineffective.`,
                suggestion: 'Reschedule to a dry day.'
            });
        }

        if (op.type === 'Irrigation' && mockRainMM > 10) {
            warnings.push({
                operationId: op._id,
                title: 'Heavy Rain Alert',
                message: `Heavy rain expected (${mockRainMM.toFixed(1)} mm). Scheduled irrigation may lead to waterlogging.`,
                suggestion: 'Consider skipping this irrigation cycle.'
            });
        }
    });

    return warnings;
};
