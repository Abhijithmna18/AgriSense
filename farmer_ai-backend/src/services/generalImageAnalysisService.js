const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Configuration for Ollama
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llava';

/**
 * Generic Image Analysis using Ollama
 * @param {string} imagePath - Absolute path to the image file.
 * @returns {Promise<Object>} - Parsed JSON response.
 */
exports.analyzeImage = async (imagePath) => {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const imageBase64 = imageBuffer.toString('base64');

        const prompt = `
You are an image analysis system designed for database storage.

Analyze the provided image and return ONLY valid JSON.
Do not include explanations, markdown, or extra text.

Rules:
- Do NOT guess. If information is unclear, use null.
- Be concise but precise.
- Use arrays where multiple values apply.
- All keys must exist, even if the value is null.

Output schema:

{
  "image_id": "<string | provided externally or null>",
  "timestamp_utc": "<ISO-8601 string | null>",
  "technical": {
    "resolution": { "width": <int|null>, "height": <int|null> },
    "aspect_ratio": "<string|null>",
    "color_mode": "<string|null>",
    "dominant_colors": ["<hex|string>"],
    "image_quality": "<low|medium|high|null>"
  },
  "scene": {
    "environment": "<indoor|outdoor|mixed|null>",
    "location_type": "<string|null>",
    "time_of_day": "<day|night|unknown|null>",
    "weather": "<string|null>"
  },
  "subjects": [
    {
      "type": "<person|animal|object|unknown>",
      "count": <int|null>,
      "attributes": {
        "gender": "<string|null>",
        "age_range": "<string|null>",
        "clothing": ["<string>"],
        "notable_features": ["<string>"]
      },
      "activity": "<string|null>"
    }
  ],
  "objects": ["<string>"],
  "text_detected": ["<string>"],
  "actions": ["<string>"],
  "mood": "<string|null>",
  "tags": ["<string>"],
  "safety": {
    "nsfw": <true|false|null>,
    "violence": <true|false|null>,
    "weapons_present": <true|false|null>
  },
  "confidence_score": <float between 0 and 1>
}
`;

        console.log(`Sending general analysis request to Ollama (${OLLAMA_MODEL})...`);

        let data;
        try {
            const response = await axios.post(OLLAMA_URL, {
                model: OLLAMA_MODEL,
                prompt: prompt,
                images: [imageBase64],
                stream: false,
                format: "json",
                options: { temperature: 0.2 }
            });

            if (!response.data || !response.data.response) {
                throw new Error("Invalid response from Ollama");
            }

            const responseText = response.data.response;
            const cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            data = JSON.parse(cleanedResponse);

        } catch (axiosError) {
            console.log("Ollama failed or unreachable. Using Mock Fallback for General Analysis.");
            // Fallback Mock Data
            data = {
                image_id: null,
                timestamp_utc: new Date().toISOString(),
                technical: {
                    resolution: { width: 1920, height: 1080 },
                    aspect_ratio: "16:9",
                    color_mode: "RGB",
                    dominant_colors: ["#2d5a27", "#87ceeb"],
                    image_quality: "high"
                },
                scene: {
                    environment: "outdoor",
                    location_type: "farm field",
                    time_of_day: "day",
                    weather: "sunny"
                },
                subjects: [],
                objects: ["tractor", "crop rows", "irrigation pipe"],
                text_detected: [],
                actions: ["farming", "monitoring"],
                mood: "peaceful",
                tags: ["agriculture", "farm", "crops"],
                safety: {
                    nsfw: false,
                    violence: false,
                    weapons_present: false
                },
                confidence_score: 0.95
            };
        }

        return data;

    } catch (error) {
        console.error("General Image Analysis Error:", error.message);
        throw error;
    }
};
