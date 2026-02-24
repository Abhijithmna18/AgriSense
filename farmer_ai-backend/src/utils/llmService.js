const OpenAI = require('openai');

/**
 * Initialize OpenAI client for Groq
 */
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

/**
 * Generate JSON response from LLM
 * @param {string} systemPrompt - The system instructions
 * @param {string} userPrompt - The user query/context
 * @param {string} model - The model to use (default: llama3-70b-8192)
 * @returns {Promise<Object>} Parsed JSON response
 */
const generateJSON = async (systemPrompt, userPrompt, model = 'llama-3.3-70b-versatile') => {
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt + "\n\nIMPORTANT: Output strictly in JSON format."
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            model: model,
            response_format: { type: "json_object" },
            temperature: 0.1, // Low temperature for deterministic output
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error('LLM returned empty response');
        }

        try {
            return JSON.parse(content);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Raw Content:', content);
            throw new Error('Failed to parse LLM response as JSON');
        }

    } catch (error) {
        console.error('LLM Generation Error:', error);
        throw error;
    }
};

/**
 * Generate text response from LLM
 * @param {string} systemPrompt 
 * @param {string} userPrompt 
 * @param {string} model 
 * @returns {Promise<string>}
 */
const generateText = async (systemPrompt, userPrompt, model = 'llama-3.3-70b-versatile') => {
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            model: model,
            temperature: 0.7,
        });

        return completion.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('LLM Text Generation Error:', error);
        throw error;
    }
};

/**
 * Analyze an image and return JSON response from LLM
 * @param {string} systemPrompt - The system instructions
 * @param {string} base64Image - Base64 encoded image string (must include data URI scheme)
 * @param {string} model - The vision model to use
 * @returns {Promise<Object>} Parsed JSON response
 */
const analyzeImageJSON = async (systemPrompt, base64Image, model = 'llama-3.2-11b-vision-preview') => {
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: "text", text: systemPrompt + "\n\nIMPORTANT: Output strictly in JSON format." },
                        { type: "image_url", image_url: { url: base64Image } }
                    ]
                }
            ],
            model: model,
            response_format: { type: "json_object" },
            temperature: 0.1, // Low temperature for deterministic output
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error('LLM Vision returned empty response');
        }

        try {
            return JSON.parse(content);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Raw Content:', content);
            throw new Error('Failed to parse LLM Vision response as JSON');
        }

    } catch (error) {
        console.error('LLM Vision Generation Error:', error);
        throw error;
    }
};

module.exports = {
    openai,
    generateJSON,
    generateText,
    analyzeImageJSON
};
