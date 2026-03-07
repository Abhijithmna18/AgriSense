const axios = require('axios');

exports.getIrrigationRecommendation = async (req, res) => {
    try {
        const { soilMoisture, temperature, humidity, waterFlow } = req.body;

        if (soilMoisture === undefined || temperature === undefined || humidity === undefined || waterFlow === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required telemetry data (soilMoisture, temperature, humidity, waterFlow).' });
        }

        const prompt = `You are an agricultural irrigation assistant. Based on the following sensor data, determine whether irrigation is needed.

Temperature: ${temperature}°C
Humidity: ${humidity}%
Soil Moisture: ${soilMoisture}%
Water Flow: ${waterFlow} L/min

Provide a short irrigation recommendation and explain the reason. You must output perfectly formatted JSON matching this structure: { "recommendation": "..." }`;

        const requestBody = {
            model: "llama3.1:latest",
            prompt: prompt,
            stream: false,
            format: "json"
        };

        // Fast timeout for local development
        const response = await axios.post('http://localhost:11434/api/generate', requestBody, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 60000 // 60 second timeout for local inference
        });

        const aiOutput = response.data.response;
        console.log("Ollama AI Output:", aiOutput);

        // Parse the JSON output from the model (with fallback for markdown wrappers)
        let parsedOutput;
        try {
            const jsonString = aiOutput.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedOutput = JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse Ollama output:", aiOutput);
            return res.status(500).json({ success: false, message: 'AI returned invalid format.' });
        }

        res.status(200).json({
            success: true,
            recommendation: parsedOutput.recommendation
        });

    } catch (error) {
        console.error('Error generating AI irrigation recommendation:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to generate AI recommendation',
            error: error.message
        });
    }
};
