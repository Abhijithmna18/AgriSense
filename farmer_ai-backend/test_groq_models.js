const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

async function listModels() {
    try {
        const groqApiKey = process.env.GROQ_API_KEY;
        const response = await axios.get('https://api.groq.com/openai/v1/models', {
            headers: {
                'Authorization': `Bearer ${groqApiKey}`
            }
        });
        const activeModels = response.data.data.filter(m => !m.id.includes('decommissioned')).map(m => m.id);
        console.log("Available models:");
        console.log(activeModels.join('\n'));
    } catch (e) {
        console.log("Error:", e.response ? e.response.data : e.message);
    }
}
listModels();
