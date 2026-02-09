const { generateJSON } = require('../utils/llmService');
const PestPrediction = require('../models/PestPrediction');
const Farm = require('../models/Farm');
const CropCycle = require('../models/CropCycle');

const PEST_CROP_DATABASE = {
    'rice': ['Brown Planthopper', 'Stem Borer', 'Leaf Folder', 'Rice Blast', 'Hispa', 'Gall Midge'],
    'wheat': ['Aphids', 'Rust (Yellow/Brown/Black)', 'Termites', 'Loose Smut', 'Powdery Mildew'],
    'corn': ['Fall Armyworm', 'Stem Borer', 'Shoot Fly', 'Aphids', 'Leaf Blight'],
    'maize': ['Fall Armyworm', 'Stem Borer', 'Shoot Fly', 'Aphids', 'Leaf Blight'],
    'cotton': ['Pink Bollworm', 'Whitefly', 'Jassids', 'Aphids', 'Thrips', 'Leaf Curl Virus'],
    'potato': ['Late Blight', 'Early Blight', 'Aphids', 'Potato Tuber Moth', 'Cutworms'],
    'tomato': ['Fruit Borer', 'Leaf Miner', 'Whitefly', 'Early Blight', 'Late Blight'],
    'sugarcane': ['Top Borer', 'Early Shoot Borer', 'Pyrilla', 'Red Rot', 'Termites'],
    'soybean': ['Stem Fly', 'Girdle Beetle', 'Semilooper', 'Tobacco Caterpillar'],
    'chilli': ['Thrips', 'Mites', 'Aphids', 'Fruit Borer', 'Dieback'],
    'onion': ['Thrips', 'Purple Blotch', 'Maggots'],
    'groundnut': ['Aphids', 'Leaf Miner', 'Tikka Disease', 'White Grub'],
    'gram': ['Pod Borer', 'Wilt', 'Cutworms'],
    'mustard': ['Aphids', 'Painted Bug', 'White Rust'],
    'brinjal': ['Shoot and Fruit Borer', 'Jassids', 'Epilachna Beetle'],
    'okra': ['Shoot and Fruit Borer', 'Jassids', 'Whitefly', 'Yellow Vein Mosaic Virus'],
    'cabbage': ['Diamondback Moth', 'Aphids', 'Cabbage Butterfly'],
    'cauliflower': ['Diamondback Moth', 'Aphids', 'Cabbage Butterfly']
};

// @desc    Generate pest risk prediction using AI
// @route   POST /api/pest-prediction/analyze
// @access  Private (Farmer)
exports.generatePestPrediction = async (req, res, next) => {
    try {
        const { farmId, cropCycleId, weatherData } = req.body;

        // ... (Fetching farm/crop logic stays same)

        // Fetch farm and crop data
        const farm = await Farm.findById(farmId);
        if (!farm || farm.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to access this farm' });
        }

        let cropCycle = null;
        let crop = req.body.crop || 'rice';
        let cropStage = req.body.cropStage || 'vegetative';
        let daysSinceSowing = req.body.daysSinceSowing || 30;

        if (cropCycleId) {
            cropCycle = await CropCycle.findById(cropCycleId);
            if (cropCycle) {
                crop = cropCycle.cropType;
                const sowingDate = new Date(cropCycle.sowingDate);
                daysSinceSowing = Math.floor((Date.now() - sowingDate) / (1000 * 60 * 60 * 24));

                // Determine crop stage based on days
                if (daysSinceSowing < 30) cropStage = 'seedling';
                else if (daysSinceSowing < 60) cropStage = 'vegetative';
                else if (daysSinceSowing < 90) cropStage = 'flowering';
                else cropStage = 'maturity';
            }
        }

        // Get compatible pests for this crop
        const compatiblePests = PEST_CROP_DATABASE[crop.toLowerCase()] || [];

        // Build System Prompt (Rules & Format)
        const systemPrompt = `You are an agricultural pest risk prediction agent.

YOUR TASK:
Analyze weather conditions, crop data, and growth stage to predict potential pest emergence BEFORE infestation occurs.

CONSTRAINTS & RULES:
1. Identify pests strictly from the "Compatible Pests" list provided in the input. Do NOT hallucinate others.
2. Calculate a pest risk probability score (0-100%).
3. Calculate a confidence score (0-100%) based on data completeness.
4. Predict the likely risk window (e.g., "next_7_days").
5. Generate a short natural-language explanation of WHY the risk exists (reference weather + crop stage).
6. Recommend PREVENTIVE actions.
   - Rank by impact, cost, and urgency.
   - **CRITICAL RULE**: Do NOT recommend "chemical" (pesticides) actions unless risk_percent > 60.
   - Prefer preventive, organic, and cultural measures.
   - Allowed action types: "organic", "chemical", "cultural".
   - Allowed costs: "low", "medium", "high".
   - Allowed urgencies: "immediate", "monitor".

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "zone": "District Name",
  "crop": "Crop Name",
  "prediction_window": "next_7_days",
  "pest_risks": [
    {
      "pest_name": "Name of pest",
      "risk_percent": 0,
      "confidence": 0,
      "peak_risk_day": "YYYY-MM-DD",
      "reason": "Explanation citing weather and stage",
      "preventive_actions": [
        {
          "action": "Action description",
          "type": "organic|chemical|cultural",
          "cost": "low|medium|high",
          "urgency": "immediate|monitor"
        }
      ]
    }
  ]
}`;

        // Build User Prompt (Data)
        const userPrompt = `
INPUT DATA:
- Location: ${farm.location?.district || 'Unknown'}, ${farm.location?.state || 'India'}
- Crop: ${crop}
- Growth Stage: ${cropStage} (${daysSinceSowing} days since sowing)
- Current Weather:
  * Temperature: ${weatherData?.current?.temperature || 28}°C
  * Humidity: ${weatherData?.current?.humidity || 75}%
  * Rainfall: ${weatherData?.current?.rainfall || 0}mm
  * Wind: ${weatherData?.current?.wind || 10}km/h
- Compatible Pests: ${compatiblePests.join(', ')}
`;

        // Call Groq LLM via Service
        let predictionData;
        try {
            predictionData = await generateJSON(systemPrompt, userPrompt);
        } catch (llmError) {
            console.error('LLM Generation Error:', llmError);
            throw new Error('Failed to generate pest risk prediction');
        }

        // Post-processing validation: Enforce strict rules locally
        if (predictionData.pest_risks) {
            predictionData.pest_risks.forEach(pest => {
                // Enforce pesticide rule: No chemical if risk <= 60
                if (pest.risk_percent <= 60) {
                    pest.preventive_actions = pest.preventive_actions.filter(a => a.type !== 'chemical');
                }
            });
        }

        // Calculate overall risk level
        const maxRisk = Math.max(...(predictionData.pest_risks || []).map(p => p.risk_percent), 0);
        let overallRiskLevel = 'low';
        if (maxRisk > 75) overallRiskLevel = 'critical';
        else if (maxRisk > 50) overallRiskLevel = 'high';
        else if (maxRisk > 25) overallRiskLevel = 'medium';

        // Save to Database (Mapping snake_case JSON to camelCase Schema)
        const prediction = new PestPrediction({
            farm: farmId,
            cropCycle: cropCycleId,
            user: req.user._id,
            zone: predictionData.zone,
            crop: predictionData.crop,
            cropStage,
            daysSinceSowing,
            predictionWindow: predictionData.prediction_window,
            weatherData: weatherData || {},
            pestRisks: predictionData.pest_risks.map(risk => ({
                pestName: risk.pest_name,
                riskPercent: risk.risk_percent,
                confidence: risk.confidence,
                peakRiskDay: risk.peak_risk_day,
                reason: risk.reason,
                preventiveActions: risk.preventive_actions.map(action => ({
                    action: action.action,
                    type: action.type,
                    cost: action.cost,
                    urgency: action.urgency,
                    impact: 'High' // Defaulting to High as it's not in strict input but required by schema, or make schema optional
                }))
            })),
            overallRiskLevel,
            status: 'active',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        await prediction.save();

        // Return STRICT JSON format as requested by User
        res.status(201).json({
            zone: prediction.zone,
            crop: prediction.crop,
            prediction_window: prediction.predictionWindow,
            pest_risks: prediction.pestRisks.map(p => ({
                pest_name: p.pestName,
                risk_percent: p.riskPercent,
                confidence: p.confidence,
                peak_risk_day: p.peakRiskDay ? p.peakRiskDay.toISOString().split('T')[0] : null,
                reason: p.reason,
                preventive_actions: p.preventiveActions.map(a => ({
                    action: a.action,
                    type: a.type,
                    cost: a.cost,
                    urgency: a.urgency
                }))
            }))
        });

    } catch (error) {
        console.error('Pest Prediction Error:', error);
        next(error);
    }
};

// @desc    Get pest predictions for a farm
// @route   GET /api/pest-prediction/farm/:farmId
// @access  Private (Farmer)
exports.getFarmPredictions = async (req, res, next) => {
    try {
        const { farmId } = req.params;

        const farm = await Farm.findById(farmId);
        if (!farm || farm.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const predictions = await PestPrediction.find({
            farm: farmId,
            status: 'active'
        }).sort({ createdAt: -1 }).limit(10);

        res.json(predictions);

        res.json(formattedPredictions);

    } catch (error) {
        console.error('Get Farm Predictions Error:', error);
        next(error);
    }
};

// @desc    Get all active predictions for user
// @route   GET /api/pest-prediction/my-predictions
// @access  Private (Farmer)
exports.getMyPredictions = async (req, res, next) => {
    try {
        const predictions = await PestPrediction.find({
            user: req.user._id,
            status: 'active'
        })
            .populate('farm', 'name location')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(predictions);

    } catch (error) {
        console.error('Get My Predictions Error:', error);
        next(error);
    }
};

// @desc    Get prediction by ID
// @route   GET /api/pest-prediction/:id
// @access  Private (Farmer)
exports.getPredictionById = async (req, res, next) => {
    try {
        const prediction = await PestPrediction.findById(req.params.id);

        if (!prediction) {
            return res.status(404).json({ message: 'Prediction not found' });
        }

        if (prediction.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(prediction);

    } catch (error) {
        console.error('Get Prediction Error:', error);
        next(error);
    }
};

// @desc    Archive a prediction
// @route   PUT /api/pest-prediction/:id/archive
// @access  Private (Farmer)
exports.archivePrediction = async (req, res, next) => {
    try {
        const prediction = await PestPrediction.findById(req.params.id);

        if (!prediction) {
            return res.status(404).json({ message: 'Prediction not found' });
        }

        if (prediction.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        prediction.status = 'archived';
        await prediction.save();

        res.json({
            success: true,
            message: 'Prediction archived successfully'
        });

    } catch (error) {
        console.error('Archive Prediction Error:', error);
        next(error);
    }
};
