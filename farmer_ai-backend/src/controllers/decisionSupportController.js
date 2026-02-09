const axios = require('axios');

// System Prompt for Decision Support Engine
const DECISION_SUPPORT_PROMPT = `
You are an agricultural decision-support engine designed to evaluate the financial viability and risk of a specific crop cycle for a farmer.

Your goal is not to suggest crops randomly, but to determine whether growing a specific crop on a specific farm in a specific season is profitable, risky, or not advisable.

You must:
- Be deterministic, explainable, and conservative
- Prefer real data over assumptions
- Explicitly state uncertainty when confidence is low
- NEVER hallucinate missing data

📥 INPUT GUARANTEES
You will receive a structured JSON object containing:

Mandatory Inputs
- Farm details (soil type, area, irrigation type, location)
- Crop details (crop_id, season)
- Historical yield data (if available)
- Market price data (recent averages)
- Weather indicators (forecast or historical proxy)

Optional Inputs
- Budget constraints
- Organic preference
- Risk tolerance

If any critical input is missing, you must:
- Use documented fallback logic
- Clearly state the fallback used

🧠 TASK OBJECTIVES (IN THIS EXACT ORDER)
1️⃣ Yield Estimation
Estimate crop yield using:
- Base crop yield (from database or historical average)
- Soil suitability
- Irrigation efficiency
- Historical performance adjustment
- Weather risk adjustment

Output:
- Yield per hectare
- Total estimated yield
- Yield confidence level

2️⃣ Cost Estimation (Rule-Based Only)
Estimate transparent and itemized costs, including:
- Seed cost
- Fertilizer cost
- Pesticide cost
- Labor cost
- Irrigation cost
- Miscellaneous buffer (5–10%)

You MUST:
- Show total cost
- Show breakdown
- Avoid ML or black-box estimation

3️⃣ Revenue Projection
Calculate expected revenue using:
- Estimated yield
- Median regional market price
- Volatility-adjusted pricing (avoid peak prices)

4️⃣ Profit Calculation
Compute:
- Expected profit
- Break-even price per unit
- Profit margin (%)

5️⃣ Risk Assessment (Explainable)
Evaluate risk under four dimensions:

Risk Type | Description
--- | ---
Weather Risk | Forecast deviation, rainfall uncertainty
Market Risk | Price volatility, demand uncertainty
Disease Risk | Crop susceptibility + seasonality
Execution Risk | Farmer’s historical yield deviation

Assign each a score between 0.0 and 1.0.

Calculate:
- Overall risk score (weighted average)
- Risk classification: LOW / MEDIUM / HIGH

6️⃣ Decision Logic
Based on profit and risk:
- If expected profit < 0 → NOT RECOMMENDED
- If risk score ≥ 0.75 → HIGH RISK – CONDITIONAL
- Else → RECOMMENDED

You must clearly justify the decision.

7️⃣ Actionable Recommendations
Provide specific, conditional actions, such as:
- Irrigation method requirements
- Sowing delay or advancement
- Preferred selling channel (B2B/B2C)
- Risk mitigation steps

Avoid generic advice.

📤 OUTPUT FORMAT (STRICT JSON – NO EXTRA TEXT)
{
  "summary": {
    "crop": "",
    "season": "",
    "area_hectares": 0,
    "decision": "RECOMMENDED | CONDITIONAL | NOT_RECOMMENDED",
    "confidence": 0.0
  },
  "yield_estimation": {
    "estimated_yield_kg": 0,
    "yield_per_hectare_kg": 0,
    "confidence": 0.0
  },
  "cost_estimation": {
    "total_cost": 0,
    "breakdown": {
      "seed": 0,
      "fertilizer": 0,
      "pesticide": 0,
      "labor": 0,
      "irrigation": 0,
      "misc": 0
    }
  },
  "revenue_projection": {
    "expected_price_per_kg": 0,
    "expected_revenue": 0,
    "break_even_price": 0
  },
  "profitability": {
    "expected_profit": 0,
    "profit_margin_percent": 0
  },
  "risk_analysis": {
    "weather": 0.0,
    "market": 0.0,
    "disease": 0.0,
    "execution": 0.0,
    "overall_risk_score": 0.0,
    "risk_level": "LOW | MEDIUM | HIGH"
  },
  "recommendations": [
    "string"
  ],
  "fallbacks_used": [
    "string"
  ]
}
❌ HARD RESTRICTIONS
- Do NOT suggest unrelated crops
- Do NOT assume perfect conditions
- Do NOT hide uncertainty
- Do NOT generate marketing language
- Do NOT exceed the JSON structure
`;

const OLLAMA_API_URL = 'http://localhost:11434/api/chat';

/**
 * Run Analysis for a specific crop cycle
 * @route POST /api/decision-support/analyze
 */
exports.runAnalysis = async (req, res) => {
    try {
        const {
            farmDetails,
            cropDetails,
            historicalYield,
            marketPrice,
            weatherIndicators,
            constraints
        } = req.body;

        // Validation
        if (!farmDetails || !cropDetails) {
            return res.status(400).json({
                message: 'Missing required inputs: farmDetails and cropDetails are mandatory.'
            });
        }

        const inputContext = {
            farmDetails,
            cropDetails,
            historicalYield: historicalYield || "No historical yield data provided. Use regional averages.",
            marketPrice: marketPrice || "No specific market price provided. Use current regional average.",
            weatherIndicators: weatherIndicators || "No specific weather forecast. Assume seasonal norms.",
            constraints: constraints || {}
        };

        const userPrompt = `
INPUT DATA:
${JSON.stringify(inputContext, null, 2)}

Perform the analysis strictly following the system task objectives.
Output ONLY valid JSON.
`;

        const payload = {
            model: "llama3.1:8b", // Defaulting to the model used elsewhere
            messages: [
                { role: "system", content: DECISION_SUPPORT_PROMPT },
                { role: "user", content: userPrompt }
            ],
            stream: false,
            format: "json", // Force JSON mode if supported by the model/ollama version
            options: {
                temperature: 0.1 // Low temperature for deterministic output
            }
        };

        console.log(`[DecisionEngine] Analyzing ${cropDetails.crop_id || 'crop'} for ${farmDetails.location || 'farm'}...`);

        const response = await axios.post(OLLAMA_API_URL, payload);
        let aiResponse = response.data?.message?.content || response.data?.response;

        if (!aiResponse) {
            throw new Error("AI returned empty response");
        }

        // Parse JSON
        let result;
        try {
            // cleanup potential markdown
            const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            result = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse Decision Engine JSON:", aiResponse);
            // Attempt to extract JSON substring if chatty intro/outro
            const start = aiResponse.indexOf('{');
            const end = aiResponse.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                try {
                    result = JSON.parse(aiResponse.substring(start, end + 1));
                } catch (e2) {
                    throw new Error("Invalid JSON format from AI Engine");
                }
            } else {
                throw new Error("Invalid JSON format from AI Engine");
            }
        }

        return res.status(200).json({
            success: true,
            data: result,
            meta: {
                model: response.data.model,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error("Decision Engine Error:", error.message);

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                message: "Decision Engine AI Service is unavailable (Ollama unreachable)."
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal Analysis Error",
            error: error.message
        });
    }
};
