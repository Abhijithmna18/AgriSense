/**
 * Crop Nutrient Requirements Database
 * NPK values in kg per acre for optimal yield
 * Based on standard agronomic recommendations
 */

const cropNutrientRequirements = {
  // Cereals
  rice: {
    name: 'Rice',
    category: 'Cereal',
    nitrogen: 60,      // kg/acre
    phosphorus: 30,    // kg/acre
    potassium: 30,     // kg/acre
    duration: '120-150 days',
    notes: 'Apply nitrogen in 3 splits: basal, tillering, and panicle initiation'
  },
  wheat: {
    name: 'Wheat',
    category: 'Cereal',
    nitrogen: 50,
    phosphorus: 25,
    potassium: 25,
    duration: '120-130 days',
    notes: 'Apply full P and K as basal, nitrogen in 2-3 splits'
  },
  maize: {
    name: 'Maize',
    category: 'Cereal',
    nitrogen: 55,
    phosphorus: 28,
    potassium: 28,
    duration: '90-110 days',
    notes: 'Apply nitrogen in 2 splits: at sowing and knee-high stage'
  },
  
  // Pulses
  chickpea: {
    name: 'Chickpea',
    category: 'Pulse',
    nitrogen: 20,
    phosphorus: 30,
    potassium: 20,
    duration: '100-120 days',
    notes: 'Being a legume, requires less nitrogen. Focus on phosphorus'
  },
  pigeon_pea: {
    name: 'Pigeon Pea',
    category: 'Pulse',
    nitrogen: 25,
    phosphorus: 25,
    potassium: 25,
    duration: '150-180 days',
    notes: 'Apply full dose as basal. Nitrogen fixation reduces N requirement'
  },
  lentil: {
    name: 'Lentil',
    category: 'Pulse',
    nitrogen: 20,
    phosphorus: 25,
    potassium: 20,
    duration: '110-130 days',
    notes: 'Minimal nitrogen needed due to biological nitrogen fixation'
  },
  
  // Oilseeds
  groundnut: {
    name: 'Groundnut',
    category: 'Oilseed',
    nitrogen: 25,
    phosphorus: 35,
    potassium: 40,
    duration: '100-120 days',
    notes: 'High potassium requirement for pod development'
  },
  soybean: {
    name: 'Soybean',
    category: 'Oilseed',
    nitrogen: 20,
    phosphorus: 30,
    potassium: 25,
    duration: '90-110 days',
    notes: 'Legume crop with nitrogen fixation capability'
  },
  mustard: {
    name: 'Mustard',
    category: 'Oilseed',
    nitrogen: 40,
    phosphorus: 20,
    potassium: 20,
    duration: '90-110 days',
    notes: 'Apply nitrogen in 2 splits for better efficiency'
  },
  
  // Vegetables
  tomato: {
    name: 'Tomato',
    category: 'Vegetable',
    nitrogen: 50,
    phosphorus: 40,
    potassium: 50,
    duration: '90-120 days',
    notes: 'High nutrient demanding crop. Apply in multiple splits'
  },
  potato: {
    name: 'Potato',
    category: 'Vegetable',
    nitrogen: 60,
    phosphorus: 35,
    potassium: 60,
    duration: '90-120 days',
    notes: 'High potassium requirement for tuber development'
  },
  onion: {
    name: 'Onion',
    category: 'Vegetable',
    nitrogen: 50,
    phosphorus: 30,
    potassium: 50,
    duration: '120-150 days',
    notes: 'Apply nitrogen in 3-4 splits throughout growing season'
  },
  cabbage: {
    name: 'Cabbage',
    category: 'Vegetable',
    nitrogen: 60,
    phosphorus: 30,
    potassium: 40,
    duration: '90-120 days',
    notes: 'Heavy nitrogen feeder for leafy growth'
  },
  cauliflower: {
    name: 'Cauliflower',
    category: 'Vegetable',
    nitrogen: 60,
    phosphorus: 30,
    potassium: 40,
    duration: '90-120 days',
    notes: 'Similar to cabbage, requires high nitrogen'
  },
  
  // Cash Crops
  cotton: {
    name: 'Cotton',
    category: 'Cash Crop',
    nitrogen: 60,
    phosphorus: 30,
    potassium: 30,
    duration: '150-180 days',
    notes: 'Apply nitrogen in 3 splits: basal, squaring, and flowering'
  },
  sugarcane: {
    name: 'Sugarcane',
    category: 'Cash Crop',
    nitrogen: 100,
    phosphorus: 40,
    potassium: 60,
    duration: '300-365 days',
    notes: 'Long duration crop with high nutrient requirement'
  },
  
  // Spices
  turmeric: {
    name: 'Turmeric',
    category: 'Spice',
    nitrogen: 40,
    phosphorus: 25,
    potassium: 60,
    duration: '240-300 days',
    notes: 'High potassium requirement for rhizome development'
  },
  ginger: {
    name: 'Ginger',
    category: 'Spice',
    nitrogen: 40,
    phosphorus: 25,
    potassium: 60,
    duration: '240-270 days',
    notes: 'Similar to turmeric, needs high potassium'
  },
  chilli: {
    name: 'Chilli',
    category: 'Spice',
    nitrogen: 50,
    phosphorus: 30,
    potassium: 50,
    duration: '150-180 days',
    notes: 'Apply nutrients in multiple splits'
  }
};

/**
 * Fertilizer composition constants
 */
const fertilizerComposition = {
  urea: {
    name: 'Urea',
    nitrogen: 46,      // % N
    phosphorus: 0,
    potassium: 0,
    formula: 'CO(NH2)2'
  },
  dap: {
    name: 'DAP (Di-Ammonium Phosphate)',
    nitrogen: 18,      // % N
    phosphorus: 46,    // % P2O5
    potassium: 0,
    formula: '(NH4)2HPO4'
  },
  mop: {
    name: 'MOP (Muriate of Potash)',
    nitrogen: 0,
    phosphorus: 0,
    potassium: 60,     // % K2O
    formula: 'KCl'
  },
  ssp: {
    name: 'SSP (Single Super Phosphate)',
    nitrogen: 0,
    phosphorus: 16,    // % P2O5
    potassium: 0,
    formula: 'Ca(H2PO4)2'
  }
};

/**
 * Get crop nutrient requirement by crop name
 */
const getCropRequirement = (cropName) => {
  const normalizedName = cropName.toLowerCase().replace(/\s+/g, '_');
  return cropNutrientRequirements[normalizedName] || null;
};

/**
 * Get all available crops
 */
const getAllCrops = () => {
  return Object.keys(cropNutrientRequirements).map(key => ({
    id: key,
    ...cropNutrientRequirements[key]
  }));
};

/**
 * Get crops by category
 */
const getCropsByCategory = (category) => {
  return Object.keys(cropNutrientRequirements)
    .filter(key => cropNutrientRequirements[key].category === category)
    .map(key => ({
      id: key,
      ...cropNutrientRequirements[key]
    }));
};

module.exports = {
  cropNutrientRequirements,
  fertilizerComposition,
  getCropRequirement,
  getAllCrops,
  getCropsByCategory
};
