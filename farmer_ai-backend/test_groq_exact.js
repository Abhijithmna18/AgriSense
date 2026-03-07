const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

async function testGroq() {
    try {
        const groqApiKey = process.env.GROQ_API_KEY;
        const soilMoisture = 30;
        const temperature = 32;
        const humidity = 40;

        const prompt = `Soil moisture is ${soilMoisture}%, temperature is ${temperature}°C, humidity is ${humidity}%. Should irrigation be activated? Respond in strict JSON format with exactly two keys: "recommendation" and "reason". The "recommendation" must be exactly one of "Irrigation Required", "Monitor Conditions", or "No Irrigation Needed". The "reason" should be a concise, one-sentence explanation.`;

        const requestBody = {
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "You are an agricultural irrigation expert."
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        };

        console.log("Sending payload:", JSON.stringify(requestBody, null, 2));

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', requestBody, {
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Success!");
        console.log(response.data.choices[0].message.content);

    } catch (e) {
        console.log("Error!");
        if (e.response) {
            console.log(JSON.stringify(e.response.data, null, 2));
        } else {
            console.log(e.message);
        }
    }
}
testGroq();
