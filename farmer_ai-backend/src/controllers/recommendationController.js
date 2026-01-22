const Recommendation = require('../models/Recommendation');
const Farm = require('../models/Farm');
const CropCycle = require('../models/CropCycle');
const { calculateSoilActions } = require('../utils/soilRules');
const { recommendCrops } = require('../services/ruleEngine');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Gemini Configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

// Mock Data / "Logic Model" (Enhanced)
const LOGIC_MODEL_CROPS = [
    { name: 'Rice', idealPh: [5.5, 7.0], idealN: [60, 150], rainfall: 'high', seasons: ['Monsoon (Rainy Season)', 'Summer (Pre-Monsoon)'], baseYield: 4000, baseProfit: 60000, marketMomentum: 'Stable' },
    { name: 'Wheat', idealPh: [6.0, 7.5], idealN: [80, 180], rainfall: 'medium', seasons: ['Winter'], baseYield: 3500, baseProfit: 50000, marketMomentum: 'Medium' },
    { name: 'Maize', idealPh: [5.8, 7.2], idealN: [100, 200], rainfall: 'medium', seasons: ['Monsoon (Rainy Season)', 'Summer (Pre-Monsoon)', 'Winter'], baseYield: 6000, baseProfit: 45000, marketMomentum: 'High' },
    { name: 'Cotton', idealPh: [6.0, 8.0], idealN: [120, 250], rainfall: 'low', seasons: ['Monsoon (Rainy Season)'], baseYield: 2000, baseProfit: 80000, marketMomentum: 'Volatile' },
    { name: 'Sugarcane', idealPh: [6.5, 7.5], idealN: [150, 300], rainfall: 'high', seasons: ['Summer (Pre-Monsoon)', 'Monsoon (Rainy Season)', 'Post-Monsoon (Autumn)', 'Winter'], baseYield: 80000, baseProfit: 120000, marketMomentum: 'High' },
    { name: 'Turmeric', idealPh: [5.0, 6.5], idealN: [40, 100], rainfall: 'medium', seasons: ['Monsoon (Rainy Season)', 'Post-Monsoon (Autumn)'], baseYield: 25000, baseProfit: 150000, marketMomentum: 'Very High' },
    { name: 'Groundnut', idealPh: [6.0, 7.0], idealN: [20, 50], rainfall: 'low', seasons: ['Summer (Pre-Monsoon)', 'Winter'], baseYield: 1800, baseProfit: 55000, marketMomentum: 'Stable' },
    { name: 'Mustard', idealPh: [6.0, 7.5], idealN: [60, 100], rainfall: 'low', seasons: ['Winter', 'Post-Monsoon (Autumn)'], baseYield: 1500, baseProfit: 40000, marketMomentum: 'Medium' }
];

/**
 * Predicts crop suitability using enhanced scoring and explanation logic.
 */
const predictCropsFallback = (soil, location, season, constraints) => {
    return LOGIC_MODEL_CROPS.map(crop => {
        let score = 0;
        const reasons = [];
        const riskFactors = [];

        // 1. pH Score (Max 30 points)
        if (soil.ph >= crop.idealPh[0] && soil.ph <= crop.idealPh[1]) {
            score += 30;
            reasons.push(`Soil pH ${soil.ph} is optimal (${crop.idealPh[0]}-${crop.idealPh[1]}).`);
        } else {
            const diff = Math.min(Math.abs(soil.ph - crop.idealPh[0]), Math.abs(soil.ph - crop.idealPh[1]));
            score += Math.max(0, 30 - (diff * 15)); // Penalty
            reasons.push(`Soil pH ${soil.ph} is outside optimal range (${crop.idealPh[0]}-${crop.idealPh[1]}).`);
        }

        // 2. Nitrogen Score (Max 30 points)
        if (soil.n >= crop.idealN[0] && soil.n <= crop.idealN[1]) {
            score += 30;
            reasons.push(`Nitrogen levels are adequate.`);
        } else {
            if (soil.n < crop.idealN[0]) {
                const diff = crop.idealN[0] - soil.n;
                score += Math.max(0, 30 - (diff * 0.5));
                reasons.push(`Nitrogen deficiency detected.`);
            } else {
                score += 25;
                reasons.push(`Nitrogen levels are sufficient.`);
            }
        }

        // 3. Texture (10 points)
        if (soil.texture && soil.texture.toLowerCase().includes('loam')) {
            score += 10;
        }

        // 4. Season Suitability (Max 30 points) -- CRITICAL UPDATE
        if (crop.seasons.includes(season)) {
            score += 30;
            reasons.push(`Excellent match for ${season}.`);
        } else {
            score -= 20; // Heavy penalty for wrong season
            reasons.push(`Not typically grown in ${season}.`);
            riskFactors.push(`Seasonal Mismatch (${season})`);
        }

        // 4. Season Suitability (Max 20 points)
        const currentSeason = constraints?.season || 'Summer (Pre-Monsoon)';
        // Note: constraints is passed as the third arg, but in the caller it might be packed differently.
        // Actually, the caller passes (soil, location, constraints) where constraints object *might* not have season.
        // But checking the runRecommendation function, it passes: (soil, location, constraints). 
        // Wait, runRecommendation extracts season separately: { location, soil, season, constraints } = req.body.
        // So predictCropsFallback needs the 'season' argument explicitly.

        // Let's rely on the fact that I will update the function signature in the next step.
        // For now, assuming 'location' might have season or I'll handle it below.


        // Risk Analysis
        if (crop.marketMomentum === 'Volatile') riskFactors.push('Market Price Volatility');
        if (crop.rainfall === 'high' && constraints?.maxWaterUse === 'Low') riskFactors.push('High Water Requirement');

        // Finalize 0-100 Score
        const finalScore = Math.min(100, Math.max(0, Math.round(score)));

        return {
            cropId: `crop_${crop.name.toLowerCase()}`,
            cropName: crop.name,
            suitability: finalScore,
            estimatedYieldKgHa: crop.baseYield,
            expectedProfitPerHa: crop.baseProfit,
            marketMomentum: crop.marketMomentum,
            risk: riskFactors.length > 0 ? 'High' : (finalScore > 75 ? 'Low' : 'Medium'),
            riskFactors: riskFactors.length > 0 ? riskFactors : ['None'],
            soilActions: {
                addNkgHa: soil.n < crop.idealN[0] ? (crop.idealN[0] - soil.n) : 0,
                addPkgHa: 0,
                addKkgHa: 0,
                limeKgHa: 0,
                note: soil.ph < crop.idealPh[0] ? 'Consider liming to increase pH.' : ''
            },
            explanation: {
                featureContributions: [
                    { feature: 'pH Compatibility', contribution: (score > 60 ? 0.6 : 0.3) },
                    { feature: 'Nitrogen Availability', contribution: (score > 60 ? 0.4 : 0.2) }
                ],
                ruleMatches: reasons
            }
        };
    }).sort((a, b) => b.suitability - a.suitability).slice(0, 5);
};

// 1. Run Recommendation
exports.runRecommendation = async (req, res) => {
    try {
        const { location, soil, season, constraints } = req.body;
        const userId = req.user._id;

        if (!soil || !soil.n || !soil.ph) {
            return res.status(400).json({ message: 'Missing required soil parameters (N, pH)' });
        }

        // Logic for base soil actions (Fallback or Logic Enhancement)
        const baseSoilActions = calculateSoilActions(soil);

        // Try Gemini AI First
        let recommendations = [];
        let modelVersion = 'gemini-pro-latest';

        if (process.env.GEMINI_API_KEY) {
            try {
                const prompt = `
                    Act as an expert agronomist and agricultural economist. 
                    Given the following inputs:
                    Location: ${location.name} (Lat: ${location.lat}, Lng: ${location.lng})
                    Soil: N=${soil.n} kg/ha, P=${soil.p} kg/ha, K=${soil.k} kg/ha, pH=${soil.ph}, Texture=${soil.texture}
                    Season: ${season || 'Current Season'}
                    Constraints: Max Water Use ${constraints?.maxWaterUse || 'N/A'}, Min Profit ${constraints?.minProfitPerHa || 'N/A'}
                    
                    Task: Recommend the TOP 3 most suitable crops.
                    Criteria for ranking: 
                    1. Soil Suitability
                    2. Market Momentum (High demand/price trends)
                    3. Risk Factors (Price volatility, weather risks)

                    Return ONLY a JSON array with this structure for each crop:
                    {
                        "cropName": "String",
                        "suitability": Number (0-100 score),
                        "estimatedYieldKgHa": Number,
                        "expectedProfitPerHa": Number (in INR),
                        "marketMomentum": "String (e.g., 'High Demand', 'Stable', 'Volatile')",
                        "riskFactors": ["String"],
                        "soilActions": { "addNkgHa": Number, "addPkgHa": Number, "addKkgHa": Number, "limeKgHa": Number, "note": "String" },
                        "explanation": { 
                            "featureContributions": [ { "feature": "String", "contribution": Number (0-1) } ],
                            "marketReasoning": "String"
                        }
                    }
                    Ensure suggestions are realistic for the location and season.
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Clean markdown JSON if present
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                recommendations = JSON.parse(jsonStr).map((rec, i) => ({
                    ...rec,
                    rank: i + 1,
                    cropId: `ai_crop_${i}_${Date.now()}`,
                    score: rec.suitability // map suitability to score
                }));

            } catch (aiError) {
                console.error("Gemini AI failed, falling back to logic:", aiError.message);
                modelVersion = 'logic-fallback-v2';
                const logicResults = predictCropsFallback(soil, location, season, constraints);
                recommendations = logicResults.slice(0, 3).map((crop, idx) => ({ // Slice to Top 3
                    rank: idx + 1,
                    ...crop,
                    marketMomentum: 'Stable',
                    riskFactors: ['General Market Volatility'],
                    suitability: crop.suitability * 100, // Convert 0-1 to 0-100 for consistency
                    soilActions: { ...baseSoilActions, note: baseSoilActions.note },
                    explanation: {
                        featureContributions: [
                            { feature: 'Soil pH', contribution: 0.3 },
                            { feature: 'Nitrogen', contribution: 0.2 }
                        ],
                        marketReasoning: "Standard market stability assumed in fallback mode."
                    }
                }));
            }
        } else {
            // No API Key -> Logic Model (Deterministic Rule Engine)
            modelVersion = 'rule-engine-v1.0';
            const logicResults = recommendCrops({
                soilType: soil.texture || 'Loamy', // Default
                waterAvailability: constraints?.maxWaterUse === 'Low' ? 'Low' : 'Medium', // Map inputs
                month: season, // If season passed as month name
                soilTest: soil
            });

            recommendations = logicResults.slice(0, 3).map((crop, idx) => ({
                rank: idx + 1,
                cropName: crop.cropName,
                cropId: `rule_${crop.cropName.toLowerCase()}`,
                marketingMomentum: 'Stable', // Placeholder
                riskFactors: ['Weather dependency'],
                suitability: crop.score,
                estimatedYieldKgHa: 0, // Rule engine doesn't predict yield yet, handled by frontend or separate logic
                expectedProfitPerHa: 0,
                soilActions: { ...baseSoilActions, note: baseSoilActions.note },
                explanation: {
                    featureContributions: [],
                    marketReasoning: "Based on agronomic rules.",
                    ruleMatches: crop.reasons
                }
            }));
        }

        const rec = new Recommendation({
            userId,
            inputs: { location, soil, season, constraints },
            results: recommendations,
            metadata: {
                modelVersion,
                datasetUsed: 'gemini-knowledge-base',
                inferenceTimeMs: 0
            }
        });

        await rec.save();

        res.json({
            id: rec._id,
            requestedAt: rec.requestedAt,
            modelVersion: rec.metadata.modelVersion,
            recommendations,
            meta: rec.metadata
        });

    } catch (error) {
        console.error('Recommendation Run Error:', error);
        res.status(500).json({ message: 'Server error during inference', error: error.message });
    }
};

// 2. Get Recommendation by ID
exports.getRecommendation = async (req, res) => {
    try {
        const rec = await Recommendation.findById(req.params.id);
        if (!rec) return res.status(404).json({ message: 'Recommendation not found' });

        // Security check
        if (rec.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        res.json(rec);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// 3. Get History
exports.getHistory = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const history = await Recommendation.find({ userId: req.user._id })
            .select('requestedAt inputs.location status results.0.cropName') // Minimal fields
            .sort({ requestedAt: -1 })
            .limit(limit);

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// 5. Generate Farm-Specific Recommendations (Rule-Based + Farm Data)
exports.generateFarmRecommendations = async (req, res) => {
    try {
        const { farmId } = req.params;
        const userId = req.user._id;

        // 1. Fetch Farm
        const farm = await Farm.findOne({ _id: farmId, user: userId });
        if (!farm) {
            return res.status(404).json({ message: 'Farm not found or unauthorized' });
        }

        // 2. Fetch History (Last 3 cycles)
        const history = await CropCycle.find({ farm: farmId })
            .sort({ sowingDate: -1 })
            .limit(3);

        const recommendations = [];
        const riskWarnings = [];

        // --- RULE ENGINE ---

        // Rule 1: Monoculture Check
        if (history.length >= 2) {
            if (history[0].cropName === history[1].cropName) {
                recommendations.push({
                    rank: 1,
                    cropName: 'Crop Diversification (Pulses/Oilseeds)',
                    suitability: 95,
                    estimatedYieldKgHa: 1200,
                    expectedProfitPerHa: 45000,
                    marketMomentum: 'High',
                    riskFactors: ['Price Volatility'],
                    explanation: {
                        marketReasoning: 'Breaking pest cycles and improving soil health.',
                        ruleMatches: [`Monoculture detected: ${history[0].cropName} planted consecutively.`]
                    }
                });
                riskWarnings.push(`Repeated planting of ${history[0].cropName} increases pest risk.`);
            }
        }

        // Rule 2: Water Availability vs Crop
        // If Irrigation is Drip/Sprinkler -> Recommend High Value
        if (['Drip', 'Sprinkler'].includes(farm.irrigationType) && ['Red', 'Loamy'].includes(farm.soilType)) {
            recommendations.push({
                rank: 2,
                cropName: 'Bell Peppers (Capsicum)',
                suitability: 90,
                estimatedYieldKgHa: 25000,
                expectedProfitPerHa: 150000,
                marketMomentum: 'High',
                riskFactors: ['High Input Cost'],
                explanation: {
                    marketReasoning: 'High value crop suitable for precise irrigation.',
                    ruleMatches: ['Optimization for Drip Irrigation and Red Soil.']
                }
            });
        }

        // Rule 3: Post-Harvest Waste Check
        if (history.length > 0 && history[0].wastageQuantity > 0) {
            const wasteRatio = history[0].wastageQuantity / (history[0].realHarvestQuantity || history[0].harvestedQuantity || 1);
            if (wasteRatio > 0.1) {
                // Not a crop recommendation, but an advisory
                recommendations.push({
                    rank: 3,
                    cropName: 'Improve Post-Harvest Handling',
                    suitability: 100,
                    // Special type for advisory
                    isAdvisory: true,
                    explanation: {
                        marketReasoning: 'Reduce losses to increase net profit.',
                        ruleMatches: [`High wastage (${(wasteRatio * 100).toFixed(1)}%) detected in previous ${history[0].cropName} cycle.`]
                    }
                });
            }
        }

        // Rule 4: Rotation (Rice -> Pulses)
        if (history.length > 0 && history[0].cropName.toLowerCase().includes('rice') && farm.waterAvailability === 'Low') {
            recommendations.push({
                rank: 1,
                cropName: 'Green Gram (Moong)',
                suitability: 98,
                estimatedYieldKgHa: 1500,
                expectedProfitPerHa: 35000,
                marketMomentum: 'Stable',
                explanation: {
                    marketReasoning: 'Short duration, nitrogen fixing, low water requirement.',
                    ruleMatches: ['Rotation strategy: Follow Rice with Pulses in low water conditions.']
                }
            });
        }

        // Default Logic if no specific rules trigger (Fallback)
        if (recommendations.length === 0) {
            recommendations.push({
                rank: 1,
                cropName: 'Groundnut',
                suitability: 85,
                estimatedYieldKgHa: 2000,
                expectedProfitPerHa: 60000,
                explanation: {
                    marketReasoning: 'Consistent demand and good for soil health.',
                    ruleMatches: ['General suitability for current season and soil.']
                }
            });
        }

        // --- SAVE RECOMMENDATION ---
        const rec = new Recommendation({
            userId,
            farmId: farm._id,
            inputs: {
                location: {
                    name: `${farm.location.village}, ${farm.location.district}`,
                    lat: farm.location.coordinates[1],
                    lng: farm.location.coordinates[0]
                },
                soil: {
                    type: farm.soilType,
                    n: farm.soilTest?.n,
                    ph: farm.soilTest?.ph,
                    texture: farm.soilType
                },
                irrigation: {
                    type: farm.irrigationType,
                    source: farm.waterReliability
                },
                season: 'Current', // Dynamic season logic can be added here
                cropHistory: history.map(h => ({ cropName: h.cropName, date: h.sowingDate })),
                constraints: {
                    maxWaterUse: farm.waterAvailability
                }
            },
            results: recommendations, // We might need to map to exact schema if strict validation is on
            confidenceScore: 0.85,
            status: 'generated',
            metadata: {
                modelVersion: 'rule-engine-v2-farm-aware',
                datasetUsed: 'farm-history',
                inferenceTimeMs: 10
            }
        });

        await rec.save();

        res.json({
            success: true,
            data: rec
        });

    } catch (error) {
        console.error('Error generating farm recommendations:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// 6. Update Status (Save/Adopt)
exports.saveRecommendation = async (req, res) => {
    try {
        const { status, note } = req.body; // status: 'adopted' | 'archived'

        const rec = await Recommendation.findById(req.params.id);
        if (!rec) return res.status(404).json({ message: 'Recommendation not found' });

        if (rec.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (status) rec.status = status;
        if (note) rec.userFeedback = { ...rec.userFeedback, comments: note };

        await rec.save();
        res.json(rec);
    } catch (error) {
        console.error("Error saving recommendation:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
