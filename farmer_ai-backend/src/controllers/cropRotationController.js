const { generateJSON } = require('../utils/llmService');
const AppError = require('../utils/AppError');

// @desc    Get AI-driven crop rotation advice
// @route   POST /api/crop-intelligence/rotation
// @access  Private
exports.getRotationAdvice = async (req, res, next) => {
    try {
        const { currentCrop, soilType, season, farmSize } = req.body;

        if (!currentCrop) {
            throw new AppError('Current or last harvested crop is required', 400);
        }

        // 1. Construct AI Prompt
        const systemPrompt = `You are an expert Agronomist specializing in sustainable farming and soil health.
        Your goal is to recommend the best NEXT crops to plant after the current harvest (Crop Rotation).
        
        Principles:
        - Legumes after Cereals (Nitrogen fixation).
        - Deep-rooted after Shallow-rooted.
        - High-feeder after Low-feeder.
        
        Output strictly in JSON format:
        {
            "recommendations": [
                {
                    "crop_name": "Crop Name",
                    "reasoning": "Why this is good (e.g., 'Fixes nitrogen exhausted by wheat')",
                    "benefits": ["Benefit 1", "Benefit 2"],
                    "difficulty": "Easy" | "Medium" | "Hard",
                    "duration": "Duration in days (approx)"
                }
            ],
            "soil_health_impact": "Summary of how this rotation helps the soil."
        }`;

        const userPrompt = `
        I have just harvested (or am growing): ${currentCrop}
        Soil Type: ${soilType || 'Loamy/General'}
        Upcoming Season: ${season || 'Next Season'}
        Farm Size: ${farmSize || 'Standard'}
        
        What should I plant next for optimal rotation? Suggest 3 options.`;

        // 2. Call LLM
        const advice = await generateJSON(systemPrompt, userPrompt);

        res.status(200).json({
            success: true,
            data: advice
        });

    } catch (err) {
        next(err);
    }
};
