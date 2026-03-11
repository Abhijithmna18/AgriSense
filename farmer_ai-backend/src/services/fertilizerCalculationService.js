/**
 * Fertilizer Calculation Service
 * Calculates fertilizer requirements based on soil test data and crop requirements
 */

const { getCropRequirement, fertilizerComposition } = require('../data/cropNutrientRequirements');

/**
 * Calculate fertilizer requirements
 * @param {Object} soilData - Soil test NPK values
 * @param {String} cropName - Name of the crop
 * @param {Number} acres - Farm area in acres
 * @returns {Object} Fertilizer calculation results
 */
const calculateFertilizerRequirement = (soilData, cropName, acres) => {
  // Validate inputs
  if (!soilData || !cropName || !acres) {
    throw new Error('Missing required parameters');
  }

  if (acres <= 0) {
    throw new Error('Acres must be greater than 0');
  }

  // Get crop nutrient requirements
  const cropRequirement = getCropRequirement(cropName);
  if (!cropRequirement) {
    throw new Error(`Crop '${cropName}' not found in database`);
  }

  // Extract soil NPK values and convert from mg/kg (ppm) to kg/acre
  // Conversion: mg/kg × 0.002 × bulk density (1.3) × depth (0.5 ft) × 43560 sq ft/acre ÷ 1000
  // Simplified: mg/kg × 0.056 ≈ kg/acre for 6-inch depth
  // For more accurate: mg/kg ÷ 10 ≈ kg/acre available nutrient
  const conversionFactor = 0.1; // Conservative conversion from mg/kg to kg/acre available
  
  const soilN = parseFloat(soilData.nitrogen || soilData.n || 0) * conversionFactor;
  const soilP = parseFloat(soilData.phosphorus || soilData.p || 0) * conversionFactor;
  const soilK = parseFloat(soilData.potassium || soilData.k || 0) * conversionFactor;

  // Calculate nutrient deficit per acre
  const deficitN = Math.max(0, cropRequirement.nitrogen - soilN);
  const deficitP = Math.max(0, cropRequirement.phosphorus - soilP);
  const deficitK = Math.max(0, cropRequirement.potassium - soilK);

  // Calculate fertilizer quantities per acre
  // Strategy: Use DAP for P and partial N, MOP for K, Urea for remaining N
  
  // 1. Calculate DAP requirement (based on P deficit)
  const dapPerAcre = (deficitP / fertilizerComposition.dap.phosphorus) * 100;
  const nFromDAP = (dapPerAcre * fertilizerComposition.dap.nitrogen) / 100;
  
  // 2. Calculate MOP requirement (based on K deficit)
  const mopPerAcre = (deficitK / fertilizerComposition.mop.potassium) * 100;
  
  // 3. Calculate Urea requirement (remaining N after DAP)
  const remainingN = Math.max(0, deficitN - nFromDAP);
  const ureaPerAcre = (remainingN / fertilizerComposition.urea.nitrogen) * 100;

  // Calculate total quantities
  const totalUrea = ureaPerAcre * acres;
  const totalDAP = dapPerAcre * acres;
  const totalMOP = mopPerAcre * acres;

  // Calculate nutrient supplied
  const nSupplied = (totalUrea * fertilizerComposition.urea.nitrogen / 100) + 
                    (totalDAP * fertilizerComposition.dap.nitrogen / 100);
  const pSupplied = totalDAP * fertilizerComposition.dap.phosphorus / 100;
  const kSupplied = totalMOP * fertilizerComposition.mop.potassium / 100;

  // Calculate cost estimates (approximate prices in INR per kg)
  const prices = {
    urea: 6,    // ₹6 per kg
    dap: 27,    // ₹27 per kg
    mop: 17     // ₹17 per kg
  };

  const costUrea = totalUrea * prices.urea;
  const costDAP = totalDAP * prices.dap;
  const costMOP = totalMOP * prices.mop;
  const totalCost = costUrea + costDAP + costMOP;

  return {
    crop: {
      name: cropRequirement.name,
      category: cropRequirement.category,
      duration: cropRequirement.duration
    },
    farmArea: acres,
    soilStatus: {
      nitrogen: soilN,
      phosphorus: soilP,
      potassium: soilK
    },
    cropRequirement: {
      nitrogen: cropRequirement.nitrogen,
      phosphorus: cropRequirement.phosphorus,
      potassium: cropRequirement.potassium
    },
    nutrientDeficit: {
      nitrogen: deficitN,
      phosphorus: deficitP,
      potassium: deficitK
    },
    fertilizerPerAcre: {
      urea: Math.round(ureaPerAcre * 10) / 10,
      dap: Math.round(dapPerAcre * 10) / 10,
      mop: Math.round(mopPerAcre * 10) / 10
    },
    fertilizerTotal: {
      urea: Math.round(totalUrea * 10) / 10,
      dap: Math.round(totalDAP * 10) / 10,
      mop: Math.round(totalMOP * 10) / 10
    },
    nutrientSupplied: {
      nitrogen: Math.round(nSupplied * 10) / 10,
      phosphorus: Math.round(pSupplied * 10) / 10,
      potassium: Math.round(kSupplied * 10) / 10
    },
    costEstimate: {
      urea: Math.round(costUrea),
      dap: Math.round(costDAP),
      mop: Math.round(costMOP),
      total: Math.round(totalCost),
      currency: 'INR'
    },
    recommendations: generateRecommendations(cropRequirement, deficitN, deficitP, deficitK),
    applicationSchedule: generateApplicationSchedule(cropRequirement, ureaPerAcre, dapPerAcre, mopPerAcre)
  };
};

/**
 * Generate fertilizer application recommendations
 */
const generateRecommendations = (cropRequirement, deficitN, deficitP, deficitK) => {
  const recommendations = [];

  // Add crop-specific notes
  if (cropRequirement.notes) {
    recommendations.push(cropRequirement.notes);
  }

  // Nitrogen recommendations
  if (deficitN > 50) {
    recommendations.push('High nitrogen deficit detected. Apply nitrogen in multiple splits to reduce losses.');
  } else if (deficitN < 10) {
    recommendations.push('Soil nitrogen levels are adequate. Minimal nitrogen fertilizer needed.');
  }

  // Phosphorus recommendations
  if (deficitP > 30) {
    recommendations.push('Significant phosphorus deficit. Apply full phosphorus dose as basal.');
  }

  // Potassium recommendations
  if (deficitK > 40) {
    recommendations.push('High potassium requirement. Consider split application for better efficiency.');
  }

  // General recommendations
  recommendations.push('Apply fertilizers based on soil moisture conditions.');
  recommendations.push('Conduct soil test annually for accurate recommendations.');

  return recommendations;
};

/**
 * Generate fertilizer application schedule
 */
const generateApplicationSchedule = (cropRequirement, urea, dap, mop) => {
  const schedule = [];

  // Basal application (at sowing/planting)
  schedule.push({
    stage: 'Basal (At Sowing)',
    timing: 'Day 0',
    fertilizers: {
      urea: Math.round(urea * 0.33 * 10) / 10,  // 33% of urea
      dap: Math.round(dap * 10) / 10,            // 100% of DAP
      mop: Math.round(mop * 10) / 10             // 100% of MOP
    },
    notes: 'Apply all phosphorus and potassium as basal dose'
  });

  // First top dressing
  schedule.push({
    stage: 'First Top Dressing',
    timing: '20-30 days after sowing',
    fertilizers: {
      urea: Math.round(urea * 0.33 * 10) / 10,  // 33% of urea
      dap: 0,
      mop: 0
    },
    notes: 'Apply during active vegetative growth'
  });

  // Second top dressing
  schedule.push({
    stage: 'Second Top Dressing',
    timing: '40-50 days after sowing',
    fertilizers: {
      urea: Math.round(urea * 0.34 * 10) / 10,  // Remaining 34% of urea
      dap: 0,
      mop: 0
    },
    notes: 'Apply before flowering/reproductive stage'
  });

  return schedule;
};

/**
 * Validate soil test data
 */
const validateSoilData = (soilData) => {
  if (!soilData) {
    return { valid: false, message: 'Soil test data is required' };
  }

  const n = parseFloat(soilData.nitrogen || soilData.n || 0);
  const p = parseFloat(soilData.phosphorus || soilData.p || 0);
  const k = parseFloat(soilData.potassium || soilData.k || 0);

  if (n < 0 || p < 0 || k < 0) {
    return { valid: false, message: 'Soil NPK values cannot be negative' };
  }

  if (n > 500 || p > 500 || k > 500) {
    return { valid: false, message: 'Soil NPK values seem unrealistic. Please verify soil test data.' };
  }

  return { valid: true };
};

module.exports = {
  calculateFertilizerRequirement,
  validateSoilData
};
