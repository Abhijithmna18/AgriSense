const axios = require('axios');
const { generateJSON } = require('../utils/llmService');

// Default to local python server if env var is missing
const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:8000';

/**
 * @desc    Get Yield Prediction from Python AI Service
 * @route   POST /api/ai/yield-prediction
 * @access  Private (Farmer)
 */
exports.getYieldPrediction = async (req, res) => {
    try {
        const { crop, acreage, historical_temp, soil_type } = req.body;

        // Pass payload to Python
        const response = await axios.post(`${PYTHON_AI_URL}/predict/yield`, {
            crop,
            acreage,
            historical_temp,
            soil_type
        });

        res.status(200).json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error("AI Proxy Error (Yield):", error.message);
        res.status(500).json({
            success: false,
            error: 'AI Engine unreachable or failed to process prediction.'
        });
    }
};

/**
 * @desc    Get Pest Risk Prediction from Python AI Service
 * @route   POST /api/ai/pest-risk
 * @access  Private
 */
exports.getPestRiskPrediction = async (req, res) => {
    try {
        const { forecast_humidity, forecast_temp, crop } = req.body;

        const response = await axios.post(`${PYTHON_AI_URL}/predict/pest-risk`, {
            forecast_humidity,
            forecast_temp,
            crop
        });

        res.status(200).json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error("AI Proxy Error (Pest Risk):", error.message);
        res.status(500).json({
            success: false,
            error: 'AI Engine unreachable or failed to process prediction.'
        });
    }
};

/**
 * @desc    Generate AI Agronomy Advice from Telemetry Data
 * @route   POST /api/ai/agronomy-advice
 * @access  Private
 */
exports.getAgronomyAdvice = async (req, res) => {
    try {
        const {
            soil_moisture,
            temperature,
            humidity,
            tds,
            flow_rate,
            total_water_volume,
            et_index,
            pump_state,
            dry_run_alert,
            soil_warning
        } = req.body;

        const systemPrompt = `You are an AI agronomy advisor integrated into a smart irrigation system called AgriSense AI Engine.
Your job is to analyze real-time telemetry data coming from an IoT irrigation system using an ESP32 and sensors connected to Adafruit IO.

Decision Goals:
1. Maintain optimal soil moisture between 35% and 60%.
2. Prevent irrigation when soil moisture is already sufficient.
3. Maintain fertilizer concentration between 600–900 ppm.
4. Detect system faults such as pump dry run or irrigation failure.
5. Optimize irrigation based on evapotranspiration demand.

Decision Rules:
Water Management:
* If soil_moisture < 35% and ET index > 8 → Recommend irrigation.
* If soil_moisture between 35–60% → Irrigation not required.
* If soil_moisture > 60% → Stop irrigation to avoid overwatering.

Fertilizer Management:
* If tds < 400 ppm → Fertilizer level too low, recommend nutrient injection.
* If tds between 600–900 ppm → Nutrient concentration optimal.
* If tds > 1200 ppm → Fertilizer concentration too high.

System Safety:
* If pump_state = ON and flow_rate = 0 → Pump dry run detected.
* If soil_warning = true → Soil moisture not increasing after irrigation.
* If dry_run_alert = true → Irrigation system malfunction.

Output Format:
Return a structured AI recommendation summary:
{
  "irrigation_status": "start | stop | standby",
  "fertilizer_status": "low | optimal | high",
  "system_health": "normal | warning | critical",
  "recommended_action": "clear explanation of what the farmer should do next",
  "reasoning": "explain which sensor values led to the recommendation"
}`;

        const userPrompt = `Telemetry Input:
soil_moisture: ${soil_moisture}
temperature: ${temperature}
humidity: ${humidity}
tds: ${tds}
flow_rate: ${flow_rate}
total_water_volume: ${total_water_volume}
et_index: ${et_index}
pump_state: ${pump_state}
dry_run_alert: ${dry_run_alert}
soil_warning: ${soil_warning}`;

        // Call Groq LLM (via our llmService util logic)
        const recommendation = await generateJSON(systemPrompt, userPrompt);

        return res.status(200).json({
            success: true,
            data: recommendation
        });

    } catch (error) {
        console.error("AI Proxy Error (Agronomy Advice):", error);
        return res.status(500).json({
            success: false,
            error: 'AI Engine unreachable or failed to generate advice.'
        });
    }
};
