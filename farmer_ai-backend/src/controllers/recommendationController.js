const Recommendation = require('../models/Recommendation');
const { calculateSoilActions } = require('../utils/soilRules');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Gemini Configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

// Mock Data / "Logic Model" (Fallback)
const LOGIC_MODEL_CROPS = [
    { name: 'Rice', idealPh: [5.5, 7.0], idealN: [60, 150], rainfall: 'high', season: 'kharif', baseYield: 4000, baseProfit: 60000 },
    { name: 'Wheat', idealPh: [6.0, 7.5], idealN: [80, 180], rainfall: 'medium', season: 'rabi', baseYield: 3500, baseProfit: 50000 },
    { name: 'Maize', idealPh: [5.8, 7.2], idealN: [100, 200], rainfall: 'medium', season: 'kharif', baseYield: 6000, baseProfit: 45000 },
    { name: 'Cotton', idealPh: [6.0, 8.0], idealN: [120, 250], rainfall: 'low', season: 'kharif', baseYield: 2000, baseProfit: 80000 },
    { name: 'Sugarcane', idealPh: [6.5, 7.5], idealN: [150, 300], rainfall: 'high', season: 'annual', baseYield: 80000, baseProfit: 120000 },
    { name: 'Turmeric', idealPh: [5.0, 6.5], idealN: [40, 100], rainfall: 'medium', season: 'post-monsoon', baseYield: 25000, baseProfit: 150000 },
    { name: 'Groundnut', idealPh: [6.0, 7.0], idealN: [20, 50], rainfall: 'low', season: 'rabi', baseYield: 1800, baseProfit: 55000 },
];

/**
 * Predicts crop suitability based on logical rules (Fallback).
 */
const predictCropsFallback = (soil, location, constraints) => {
    return LOGIC_MODEL_CROPS.map(crop => {
        let score = 0.5;
        if (soil.ph >= crop.idealPh[0] && soil.ph <= crop.idealPh[1]) score += 0.2;
        else score -= 0.1;
        if (soil.n >= crop.idealN[0]) score += 0.1;
        if (soil.texture === 'loamy') score += 0.1;
        score += (Math.random() * 0.1);

        return {
            cropId: `crop_${crop.name.toLowerCase()}`,
            cropName: crop.name,
            suitability: Math.min(Math.max(score, 0), 0.99),
            estimatedYieldKgHa: crop.baseYield,
            expectedProfitPerHa: crop.baseProfit,
            risk: score > 0.7 ? 'low' : score > 0.4 ? 'medium' : 'high',
            soilActions: { addNkgHa: 0, addPkgHa: 0, addKkgHa: 0, limeKgHa: 0, note: '' },
            explanation: { featureContributions: [], ruleMatches: [] }
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
                    Act as an expert agronomist. 
                    Given the following inputs:
                    Location: ${location.name} (Lat: ${location.lat}, Lng: ${location.lng})
                    Soil: N=${soil.n} kg/ha, P=${soil.p} kg/ha, K=${soil.k} kg/ha, pH=${soil.ph}, Texture=${soil.texture}
                    Season: ${season || 'General'}
                    Season: ${season || 'General'}
                    Constraints: Max Water Use ${constraints?.maxWaterUse || 'N/A'}, Min Profit ${constraints?.minProfitPerHa || 'N/A'}
                    
                    Recommend the best 5 crops.
                    Return ONLY a JSON array with this structure for each crop:
                    {
                        "cropName": "String",
                        "suitability": Number (0.0-1.0),
                        "estimatedYieldKgHa": Number,
                        "expectedProfitPerHa": Number (in INR),
                        "risk": "low" | "medium" | "high",
                        "soilActions": { "addNkgHa": Number, "addPkgHa": Number, "addKkgHa": Number, "limeKgHa": Number, "note": "String" },
                        "explanation": { 
                            "featureContributions": [ { "feature": "String", "contribution": Number (0-1) } ],
                            "ruleMatches": ["String"]
                        }
                    }
                    Ensure suggestions are realistic for India/tropical regions if location implies.
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
                modelVersion = 'logic-fallback-v1';
                const logicResults = predictCropsFallback(soil, location, constraints);
                // Fallback: straight logic results, simplistic scoring
                recommendations = logicResults.map((crop, idx) => ({
                    rank: idx + 1,
                    ...crop,
                    soilActions: { ...baseSoilActions, note: baseSoilActions.note },
                    explanation: {
                        featureContributions: [
                            { feature: 'Soil pH', contribution: 0.3 },
                            { feature: 'Nitrogen', contribution: 0.2 }
                        ],
                        ruleMatches: baseSoilActions.note ? [baseSoilActions.note] : []
                    }
                }));
            }
        } else {
            // No API Key -> Logic Model
            modelVersion = 'logic-v1.0';
            const logicResults = predictCropsFallback(soil, location, constraints);
            recommendations = logicResults.map((crop, idx) => ({
                rank: idx + 1,
                ...crop,
                soilActions: { ...baseSoilActions, note: baseSoilActions.note },
                explanation: {
                    featureContributions: [
                        { feature: 'Soil pH', contribution: 0.3 },
                        { feature: 'Nitrogen', contribution: 0.2 }
                    ],
                    ruleMatches: baseSoilActions.note ? [baseSoilActions.note] : []
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

// 4. Update Status (Save/Adopt)
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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
