/**
 * Fertilizer Calculator Controller
 * Handles fertilizer calculation requests
 */

const Farm = require('../models/Farm');
const SoilTest = require('../models/SoilTest');
const { calculateFertilizerRequirement, validateSoilData } = require('../services/fertilizerCalculationService');
const { getAllCrops, getCropsByCategory, getCropRequirement } = require('../data/cropNutrientRequirements');

/**
 * @desc    Get all available crops for fertilizer calculation
 * @route   GET /api/fertilizer-calculator/crops
 * @access  Private
 */
exports.getAvailableCrops = async (req, res) => {
  try {
    const { category } = req.query;

    let crops;
    if (category) {
      crops = getCropsByCategory(category);
    } else {
      crops = getAllCrops();
    }

    // Group by category
    const groupedCrops = crops.reduce((acc, crop) => {
      if (!acc[crop.category]) {
        acc[crop.category] = [];
      }
      acc[crop.category].push(crop);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        crops,
        groupedCrops,
        totalCount: crops.length
      }
    });
  } catch (error) {
    console.error('[FertilizerCalculator] getAvailableCrops:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available crops'
    });
  }
};

/**
 * @desc    Get crop nutrient requirement details
 * @route   GET /api/fertilizer-calculator/crops/:cropName
 * @access  Private
 */
exports.getCropDetails = async (req, res) => {
  try {
    const { cropName } = req.params;
    const cropRequirement = getCropRequirement(cropName);

    if (!cropRequirement) {
      return res.status(404).json({
        success: false,
        message: `Crop '${cropName}' not found`
      });
    }

    res.json({
      success: true,
      data: cropRequirement
    });
  } catch (error) {
    console.error('[FertilizerCalculator] getCropDetails:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crop details'
    });
  }
};

/**
 * @desc    Get soil test data for a farm
 * @route   GET /api/fertilizer-calculator/soil-data/:farmId
 * @access  Private
 */
exports.getSoilData = async (req, res) => {
  try {
    const { farmId } = req.params;

    // Verify farm ownership
    const farm = await Farm.findOne({ _id: farmId, user: req.user.id });
    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found or access denied'
      });
    }

    // Get latest soil test for the farm
    const soilTest = await SoilTest.findOne({ farm: farmId })
      .sort({ testDate: -1 })
      .select('nitrogen phosphorus potassium ph organicMatter testDate');

    if (!soilTest) {
      return res.status(404).json({
        success: false,
        message: 'No soil test data found for this farm. Please conduct a soil test first.',
        requiresSoilTest: true
      });
    }

    // Validate soil data
    const validation = validateSoilData(soilTest);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    res.json({
      success: true,
      data: {
        farmId: farm._id,
        farmName: farm.name,
        soilTest: {
          nitrogen: soilTest.nitrogen,
          phosphorus: soilTest.phosphorus,
          potassium: soilTest.potassium,
          ph: soilTest.ph,
          organicMatter: soilTest.organicMatter,
          testDate: soilTest.testDate
        }
      }
    });
  } catch (error) {
    console.error('[FertilizerCalculator] getSoilData:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch soil data'
    });
  }
};

/**
 * @desc    Calculate fertilizer requirement
 * @route   POST /api/fertilizer-calculator/calculate
 * @access  Private
 */
exports.calculateFertilizer = async (req, res) => {
  try {
    const { farmId, cropName, acres } = req.body;

    // Validation
    if (!farmId || !cropName || !acres) {
      return res.status(400).json({
        success: false,
        message: 'Farm ID, crop name, and acres are required'
      });
    }

    // Validate acres
    const acresNum = parseFloat(acres);
    if (isNaN(acresNum) || acresNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Acres must be a positive number'
      });
    }

    if (acresNum > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Acres value seems unrealistic. Please verify.'
      });
    }

    // Verify farm ownership
    const farm = await Farm.findOne({ _id: farmId, user: req.user.id });
    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found or access denied'
      });
    }

    // Get latest soil test
    const soilTest = await SoilTest.findOne({ farm: farmId })
      .sort({ testDate: -1 });

    if (!soilTest) {
      return res.status(404).json({
        success: false,
        message: 'No soil test data found. Please conduct a soil test first.',
        requiresSoilTest: true
      });
    }

    // Validate soil data
    const validation = validateSoilData(soilTest);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Prepare soil data
    const soilData = {
      nitrogen: soilTest.nitrogen,
      phosphorus: soilTest.phosphorus,
      potassium: soilTest.potassium
    };

    // Calculate fertilizer requirement
    const calculation = calculateFertilizerRequirement(soilData, cropName, acresNum);

    // Add farm details to response
    calculation.farm = {
      id: farm._id,
      name: farm.name,
      location: farm.location
    };

    calculation.soilTestDate = soilTest.testDate;

    res.json({
      success: true,
      data: calculation,
      message: 'Fertilizer requirement calculated successfully'
    });

  } catch (error) {
    console.error('[FertilizerCalculator] calculateFertilizer:', error.message);
    
    if (error.message.includes('not found in database')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to calculate fertilizer requirement'
    });
  }
};

/**
 * @desc    Get user's farms with soil test status
 * @route   GET /api/fertilizer-calculator/farms
 * @access  Private
 */
exports.getFarmsWithSoilTestStatus = async (req, res) => {
  try {
    const farms = await Farm.find({ user: req.user.id })
      .select('name location size soilType')
      .sort({ createdAt: -1 });

    // Get soil test status for each farm
    const farmsWithStatus = await Promise.all(
      farms.map(async (farm) => {
        const soilTest = await SoilTest.findOne({ farm: farm._id })
          .sort({ testDate: -1 })
          .select('testDate nitrogen phosphorus potassium');

        return {
          _id: farm._id,
          name: farm.name,
          location: farm.location,
          size: farm.size,
          soilType: farm.soilType,
          hasSoilTest: !!soilTest,
          soilTestDate: soilTest?.testDate,
          soilData: soilTest ? {
            nitrogen: soilTest.nitrogen,
            phosphorus: soilTest.phosphorus,
            potassium: soilTest.potassium
          } : null
        };
      })
    );

    res.json({
      success: true,
      data: farmsWithStatus,
      totalFarms: farmsWithStatus.length,
      farmsWithSoilTest: farmsWithStatus.filter(f => f.hasSoilTest).length
    });

  } catch (error) {
    console.error('[FertilizerCalculator] getFarmsWithSoilTestStatus:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch farms'
    });
  }
};

module.exports = exports;
