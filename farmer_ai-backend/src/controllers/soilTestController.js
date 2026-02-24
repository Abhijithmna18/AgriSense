const SoilTest = require('../models/SoilTest');
const Farm = require('../models/Farm');
const { calculateSoilActions } = require('../utils/soilRules'); // Import correction rules

/**
 * @desc    Add a new Soil Test Report
 * @route   POST /api/soil-tests
 * @access  Private
 */
exports.addSoilTest = async (req, res, next) => {
    try {
        const { farmId, testDate, labName, ph, nitrogen, phosphorus, potassium, organicCarbon, sulfur, zinc, boron, iron, manganese, copper } = req.body;

        const farm = await Farm.findById(farmId);
        if (!farm) throw new AppError('Farm not found', 404);

        if (farm.user.toString() !== req.user.id) {
            throw new AppError('User not authorized to update this farm', 401);
        }

        // Apply rules
        const recommendations = calculateSoilActions({ ph, n: nitrogen, p: phosphorus, k: potassium, organic_c: organicCarbon });

        const newTest = await SoilTest.create({
            user: req.user.id,
            farm: farmId,
            testDate,
            labName,
            ph,
            nitrogen,
            phosphorus,
            potassium,
            organicCarbon,
            sulfur, zinc, boron, iron, manganese, copper,
            recommendations
        });

        res.status(201).json({
            success: true,
            data: newTest
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Soil Test History for a Farm
 * @route   GET /api/soil-tests/:farmId
 * @access  Private
 */
exports.getSoilTests = async (req, res, next) => {
    try {
        const tests = await SoilTest.find({ farm: req.params.farmId }).sort({ testDate: -1 });

        res.status(200).json({
            success: true,
            count: tests.length,
            data: tests
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Latest Soil Test for quick overview
 * @route   GET /api/soil-tests/:farmId/latest
 * @access  Private
 */
exports.getLatestSoilTest = async (req, res, next) => {
    try {
        const test = await SoilTest.findOne({ farm: req.params.farmId }).sort({ testDate: -1 });

        if (!test) {
            return res.status(200).json({ success: true, data: null });
        }

        res.status(200).json({
            success: true,
            data: test
        });
    } catch (error) {
        next(error);
    }
};
