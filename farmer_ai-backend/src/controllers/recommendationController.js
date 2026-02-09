const Recommendation = require('../models/Recommendation');
const Farm = require('../models/Farm');
const CropCycle = require('../models/CropCycle');
const { calculateSoilActions } = require('../utils/soilRules');
const { recommendCrops } = require('../services/ruleEngine');
const { generateJSON } = require('../utils/llmService');

// ... (imports remain)

// 1. Run Recommendation
exports.runRecommendation = async (req, res) => {
    try {
        const { location, soil, season, constraints } = req.body;
        const userId = req.user._id;

        // ... (validation remains)
        // 1. Strict Input Validation
        if (!location || !location.name || !location.lat || !location.lng) {
            return res.status(400).json({
                message: 'Missing required location data. Please provide name, lat, and lng.'
            });
        }

        if (!soil || !soil.n || !soil.ph) {
            return res.status(400).json({
                message: 'Missing required soil parameters (N, pH) are essential for analysis.'
            });
        }

        const baseSoilActions = calculateSoilActions(soil || {});

        // Try Groq LLM First
        let recommendations = [];
        let modelVersion = 'groq-llama3-70b';

        if (process.env.GROQ_API_KEY) {
            try {
                const locName = location.name || 'Unknown Location';
                const locLat = location.lat || 0;
                const locLng = location.lng || 0;

                const systemPrompt = `Act as an expert agronomist and agricultural economist.
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
                Output STRICT JSON.`;

                const userPrompt = `
                Location: ${locName} (Lat: ${locLat}, Lng: ${locLng})
                Soil: N=${soil.n} kg/ha, P=${soil.p || 'N/A'} kg/ha, K=${soil.k || 'N/A'} kg/ha, pH=${soil.ph}, Texture=${soil.texture || 'Uknown'}
                Season: ${season || 'Current Season'}
                Constraints: Max Water Use ${constraints?.maxWaterUse || 'N/A'}, Min Profit ${constraints?.minProfitPerHa || 'N/A'}
                `;

                const parsedResult = await generateJSON(systemPrompt, userPrompt);

                // Handle response if it's wrapped in an object key or just an array
                const recArray = Array.isArray(parsedResult) ? parsedResult : (parsedResult.crops || parsedResult.recommendations || []);

                if (recArray.length === 0 && !Array.isArray(parsedResult)) {
                    // If structure is different, try to cast or fallback
                    console.warn("Unexpected JSON structure from LLM", parsedResult);
                    throw new Error("Invalid LLM response structure");
                }

                recommendations = recArray.map((rec, i) => ({
                    ...rec,
                    rank: i + 1,
                    cropId: `ai_crop_${i}_${Date.now()}`,
                    score: rec.suitability
                }));

            } catch (aiError) {
                console.error("Groq AI failed, falling back to logic:", aiError.message);
                // Fallback logic remains ...
                modelVersion = 'logic-fallback-v2';
                const logicResults = predictCropsFallback(soil, location, season, constraints);
                recommendations = logicResults.slice(0, 3).map((crop, idx) => ({
                    rank: idx + 1,
                    ...crop,
                    marketMomentum: 'Stable',
                    riskFactors: ['General Market Volatility'],
                    suitability: crop.suitability * 100,
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
            // No API Key Logic (remains same but checking GROQ_API_KEY)
            // ...
            modelVersion = 'rule-engine-v1.0';
            const logicResults = recommendCrops({
                soilType: soil.texture || 'Loamy',
                waterAvailability: constraints?.maxWaterUse === 'Low' ? 'Low' : 'Medium',
                month: season,
                soilTest: soil
            });
            // ...
            recommendations = logicResults.slice(0, 3).map((crop, idx) => ({
                rank: idx + 1,
                cropName: crop.cropName,
                cropId: `rule_${crop.cropName.toLowerCase()}`,
                marketingMomentum: 'Stable',
                riskFactors: ['Weather dependency'],
                suitability: crop.score,
                estimatedYieldKgHa: 0,
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
            inputs: {
                location: location || {},
                soil: soil || {},
                season: season || 'Unknown',
                constraints: constraints || {}
            },
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
        // Explicitly check for data missing errors to give better feedback
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', error: error.message });
        }
        res.status(500).json({ message: 'Server error during inference', error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
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
