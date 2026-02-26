const { generateJSON } = require('../utils/llmService');
const AppError = require('../utils/AppError');

// @desc    Generate a Smart Crop Calendar
// @route   POST /api/crop-intelligence/calendar
// @access  Private
exports.generateCalendar = async (req, res, next) => {
    try {
        const { cropName, soilType, season, farmSize } = req.body;

        if (!cropName) {
            throw new AppError('Crop name is required to generate a calendar', 400);
        }

        // 1. Construct AI Prompt
        const systemPrompt = `You are an expert Agronomist and Farm Planner. 
        Your goal is to generate a detailed, week-by-week smart crop farming calendar.
        
        The calendar must include realistic timelines for growth stages and weekly categorized tasks (Irrigation, Nutrition, Maintenance/Pest Control).
        
        Output STRICTLY in the following JSON format:
        {
            "crop_info": {
                "name": "Crop Name",
                "total_duration_days": 120,
                "estimated_yield_per_acre": "approx yield text",
                "seed_requirement_per_acre": "approx seeds/kg text"
            },
            "growth_stages": [
                {
                    "stage": "Germination",
                    "duration_weeks": 2,
                    "description": "Seed sprouting phase"
                }
            ],
            "weekly_tasks": [
                {
                    "week_number": 1,
                    "phase": "Germination",
                    "tasks": [
                        { "category": "Irrigation", "action": "Light watering to keep soil moist", "status": "pending" },
                        { "category": "Nutrition", "action": "Apply basal dose of NPK", "status": "pending" }
                    ]
                }
            ]
        }
        Do not add any text outside of the JSON object.`;

        const userPrompt = `
        Please generate a Smart Crop Calendar for:
        Crop: ${cropName}
        Soil Type: ${soilType || 'Loamy'}
        Season: ${season || 'Standard growing season'}
        Farm Size: ${farmSize || '1 acre'}
        `;

        // 2. Call LLM
        const calendarData = await generateJSON(systemPrompt, userPrompt);

        res.status(200).json({
            success: true,
            data: calendarData
        });

    } catch (err) {
        next(err);
    }
};
