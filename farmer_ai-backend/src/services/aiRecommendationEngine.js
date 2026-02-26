/**
 * aiRecommendationEngine.js
 * Core logic for generating farm-specific AI recommendations.
 * Uses the Groq LLM (same infrastructure as pest prediction).
 * Imported by recommendationController.js.
 */
const { callLLM } = require('./llmService');

/**
 * Build a structured prompt from farm data.
 */
const buildFarmPrompt = (farmData) => {
    const { cropName, soilType, soilNPK, irrigationType, location, weather, recentIssues, season } = farmData;

    return `You are an expert agronomist advising Indian smallholder farmers.

Farm Profile:
- Crop: ${cropName || 'Not specified'}
- Location: ${location?.district || ''}, ${location?.state || ''}
- Soil Type: ${soilType || 'Unknown'}
- Soil NPK: N=${soilNPK?.n ?? '?'} P=${soilNPK?.p ?? '?'} K=${soilNPK?.k ?? '?'} pH=${soilNPK?.ph ?? '?'}
- Irrigation: ${irrigationType || 'Unknown'}
- Season: ${season || 'Current'}
- Current Weather: ${weather ? `${weather.temp}°C, ${weather.humidity}% humidity, rain: ${weather.rain_1h}mm/hr` : 'Unknown'}
- Recent Issues: ${recentIssues?.join(', ') || 'None reported'}

Provide actionable recommendations in JSON format with this exact structure:
{
  "priority_actions": [
    { "area": "Irrigation|Fertilization|Pest Control|Soil Health|Harvesting", "action": "...", "urgency": "Immediate|This Week|This Month", "reason": "..." }
  ],
  "nutrient_advice": {
    "nitrogen": "...",
    "phosphorus": "...",
    "potassium": "...",
    "ph_correction": "..."
  },
  "disease_risk": {
    "level": "Low|Medium|High",
    "diseases_to_watch": ["...", "..."],
    "preventive_measures": "..."
  },
  "irrigation_schedule": {
    "frequency": "...",
    "amount_per_session": "...",
    "best_time": "..."
  },
  "general_advice": "..."
}
Return ONLY valid JSON, no markdown, no explanation.`;
};

/**
 * Generate AI recommendations for a farm.
 *
 * @param {object} farmData - { cropName, soilType, soilNPK, irrigationType, location, weather, recentIssues, season }
 * @returns {Promise<object>} Structured recommendations
 */
exports.generateRecommendations = async (farmData) => {
    const prompt = buildFarmPrompt(farmData);

    const raw = await callLLM(prompt, {
        temperature: 0.4,
        max_tokens: 1000
    });

    // Parse the JSON response from the LLM
    const jsonMatch = raw.match(/\{[\s\S]+\}/);
    if (!jsonMatch) {
        throw new Error('LLM did not return valid JSON recommendations');
    }

    const recommendations = JSON.parse(jsonMatch[0]);

    return {
        ...recommendations,
        generated_at: new Date().toISOString(),
        model: 'groq-ai',
        farm_profile: {
            crop: farmData.cropName,
            location: `${farmData.location?.district || ''}, ${farmData.location?.state || ''}`
        }
    };
};

/**
 * Generate a fertilizer application plan from soil NPK values.
 *
 * @param {string} cropName
 * @param {object} npk - { n, p, k, ph }
 * @param {number} areaHectares
 * @returns {Promise<object>}
 */
exports.generateFertilizerPlan = async (cropName, npk, areaHectares = 1) => {
    const prompt = `You are a soil scientist. Given this soil test for ${cropName} farming:
N: ${npk.n} kg/ha, P: ${npk.p} kg/ha, K: ${npk.k} kg/ha, pH: ${npk.ph}
Farm area: ${areaHectares} hectares

Calculate fertilizer requirements and return JSON:
{
  "urea_kg_per_ha": number,
  "dap_kg_per_ha": number,
  "mop_kg_per_ha": number,
  "lime_kg_per_ha": number,
  "application_schedule": "...",
  "total_cost_estimate_inr": number,
  "notes": "..."
}
Return ONLY valid JSON.`;

    const raw = await callLLM(prompt, { temperature: 0.2, max_tokens: 400 });
    const jsonMatch = raw.match(/\{[\s\S]+\}/);
    if (!jsonMatch) throw new Error('LLM did not return valid JSON');

    const plan = JSON.parse(jsonMatch[0]);

    // Scale to total area
    if (areaHectares !== 1) {
        ['urea_kg_per_ha', 'dap_kg_per_ha', 'mop_kg_per_ha', 'lime_kg_per_ha'].forEach((k) => {
            if (plan[k]) plan[`${k.replace('_per_ha', '')}_total`] = parseFloat((plan[k] * areaHectares).toFixed(1));
        });
    }

    return { ...plan, area_ha: areaHectares, crop: cropName };
};

/**
 * Generate a post-harvest advisory for a completed crop cycle.
 */
exports.generatePostHarvestAdvice = async (cropName, actualYield, expectedYield, farmLocation) => {
    const prompt = `As an agricultural extension officer, provide post-harvest advice for:
Crop: ${cropName}
Location: ${farmLocation}
Expected Yield: ${expectedYield} kg, Actual Yield: ${actualYield} kg (${actualYield < expectedYield ? 'below' : 'above'} target)

Return JSON:
{
  "storage_recommendations": "...",
  "sell_timing": "...",
  "next_crop_suggestion": "...",
  "soil_restoration": "...",
  "yield_gap_analysis": "..."
}`;

    const raw = await callLLM(prompt, { temperature: 0.5, max_tokens: 500 });
    const jsonMatch = raw.match(/\{[\s\S]+\}/);
    if (!jsonMatch) throw new Error('LLM did not return valid JSON');
    return JSON.parse(jsonMatch[0]);
};
