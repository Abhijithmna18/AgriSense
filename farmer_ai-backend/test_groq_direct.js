const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

async function testGroqDirect() {
    try {
        const groqApiKey = process.env.GROQ_API_KEY;
        const prompt = `Soil moisture is 30%, temperature is 32°C, humidity is 40%. Should irrigation be activated? Respond in strict JSON format with exactly two keys: "recommendation" and "reason". The "recommendation" must be exactly one of "Irrigation Required", "Monitor Conditions", or "No Irrigation Needed". The "reason" should be a concise, one-sentence explanation.`;

        const requestBody = {
            model: "llama3-70b-8192",
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

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', requestBody, {
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const aiOutput = response.data.choices[0].message.content;
        console.log("Raw Output:", aiOutput);

        try {
            const jsonString = aiOutput.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedOutput = JSON.parse(jsonString);
            console.log("Parsed:", parsedOutput);
        } catch (e) {
            console.log("Failed to parse JSON");
        }
    } catch (e) {
        console.log("Error calling Groq:", e.response ? e.response.data : e.message);
    }
}
testGroqDirect();
