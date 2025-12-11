const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function listModels() {
    try {
        // For now we can't easily list models via the Node SDK helpers in all versions, 
        // but we can try to get a model and catch error, or just try a standard list if available.
        // Actually, newer SDKs don't always expose listModels directly on genAI instance easily.
        // Let's try to just run a simple prompt on a few candidates.

        const candidates = ['gemini-1.5-flash', 'gemini-1.0-pro', 'gemini-pro', 'gemini-1.5-pro-latest'];

        console.log("Checking model availability...");

        for (const modelName of candidates) {
            console.log(`Trying ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Test");
                const response = await result.response;
                console.log(`✅ SUCCESS: ${modelName} is working.`);
                return; // Found one!
            } catch (e) {
                console.log(`❌ FAILED: ${modelName} - ${e.message.split('\n')[0]}`);
            }
        }
    } catch (err) {
        console.error("Fatal error:", err);
    }
}

listModels();
