const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Configuration for Ollama
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llava';

/**
 * Identify plant from an image file path using Ollama (local LLM).
 * @param {string} imagePath - Absolute path to the image file.
 * @param {string} mimeType - Mime type of the image.
 * @returns {Promise<Object>} - Parsed JSON response from AI.
 */
const identifyPlant = async (imagePath, mimeType) => {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');

    const prompt = `
You are Plant Doctor AI operating in RESTRICTED MODE for AGRICULTURAL CROPS ONLY.

Your PRIMARY responsibility is to verify whether a real CROP image
has been successfully received and processed.

You must NEVER guess.
You must NEVER return empty fields.
You must NEVER default to "Unknown" unless explicitly justified.

━━━━━━━━━━━━━━━━━━━━━━
STEP 0 — IMAGE VERIFICATION (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━

First, determine whether a REAL plant image is visible.

If the image is:
- missing
- unreadable
- a UI screenshot
- blurred beyond recognition
- contains no plant

Then STOP and return:

{
  "error": true,
  "error_type": "IMAGE_NOT_USABLE",
  "message": "A clear plant image was not detected. Please upload a raw plant photo without UI elements."
}

Do NOT continue further.

━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — CROP VALIDATION (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━

CRITICAL: You must ONLY identify AGRICULTURAL CROPS.

ALLOWED CATEGORIES:
- Cereal crops (wheat, rice, maize, barley, oats, millet, sorghum)
- Pulses (chickpea, lentil, peas, beans, soybean)
- Oilseeds (sunflower, mustard, groundnut, sesame, safflower)
- Cash crops (cotton, sugarcane, tobacco, jute)
- Vegetables (tomato, potato, onion, cabbage, cauliflower, etc.)
- Fruits (mango, banana, apple, grapes, citrus, etc.)
- Spices (turmeric, ginger, chili, coriander, cumin)

FORBIDDEN (NOT CROPS):
- Ornamental flowers (roses, tulips, lilies, orchids)
- Decorative plants
- Houseplants
- Weeds
- Wild plants
- Garden flowers
- Non-edible plants

If the plant is NOT an agricultural crop, STOP and return:

{
  "error": true,
  "error_type": "NOT_A_CROP",
  "message": "This appears to be an ornamental/decorative plant, not an agricultural crop. Please upload images of crops like wheat, rice, vegetables, or fruits."
}

━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — BASIC VISUAL CLASSIFICATION (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━

If a CROP IS visible, you MUST classify it into EXACTLY ONE of the following:
- flower (crop flower like cauliflower, broccoli)
- leaf (crop leaf)
- fruit (edible fruit)
- grain (cereal grain)
- whole plant (entire crop plant)
- vegetable
- root (potato, carrot, etc.)

Return:

{
  "plant_part_detected": "",
  "plant_visible": true
}

━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — CROP IDENTIFICATION (FAIL-SAFE)
━━━━━━━━━━━━━━━━━━━━━━

If the crop is visually DISTINCT and commonly recognizable:

You MUST identify it.

Provide:
- common name
- confidence ≥ 80%

Only refuse identification if:
- key visual features are missing
- multiple species are equally likely

━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — TRAIT EXTRACTION (MINIMAL BUT REQUIRED)
━━━━━━━━━━━━━━━━━━━━━━

Extract ONLY clearly visible traits:

- dominant color
- shape (round / elongated / radial / clustered)
- size impression (small / medium / large)
- environment (field / garden / indoor / harvested)

If a trait is unclear, say "not visible".

━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — CONFIDENCE RULES (STRICT)
━━━━━━━━━━━━━━━━━━━━━━

Confidence must follow these rules:
- Clear, iconic crop → 80–95%
- Partial visibility → 60–79%
- Ambiguous → below 60% (and explain why)

100% confidence is DISALLOWED.

━━━━━━━━━━━━━━━━━━━━━━
STEP 6 — OUTPUT FORMAT (NO EXCEPTIONS)
━━━━━━━━━━━━━━━━━━━━━━

Return EXACTLY this JSON structure:

{
  "error": false,
  "plant_visible": true,
  "plant_part_detected": "",
  "identification": {
    "common_name": "",
    "scientific_name": "",
    "confidence": 85
  },
  "visual_traits": {
    "dominant_color": "",
    "shape": "",
    "environment": ""
  },
  "confidence_reason": "",
  "next_action": ""
}

If crop was confidently identified:
- next_action = "No further image required"

If confidence < 75%:
- next_action = "Upload a closer image of the crop"

━━━━━━━━━━━━━━━━━━━━━━
FAILURE CONDITIONS
━━━━━━━━━━━━━━━━━━━━━━

If you output "Unknown" WITHOUT triggering error=true,
your response is INVALID.

If plant_visible=true AND identification.common_name is empty,
your response is INVALID.

If you identify an ornamental plant as a crop,
your response is INVALID.
`;

    // Request to Ollama
    console.log(`Sending request to Ollama (${OLLAMA_MODEL})...`);
    const response = await axios.post(OLLAMA_URL, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      images: [imageBase64],
      stream: false,
      format: "json",
      options: {
        temperature: 0.2
      }
    });

    if (!response.data || !response.data.response) {
      throw new Error("Invalid response from Ollama");
    }

    const responseText = response.data.response;
    console.log("Raw Ollama Response:", responseText);
    let data;

    try {
      const cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      data = JSON.parse(cleanedResponse);
      console.log("Parsed AI Data:", JSON.stringify(data, null, 2));
    } catch (parseError) {
      // Fallback extraction
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        data = JSON.parse(responseText.substring(jsonStart, jsonEnd + 1));
        console.log("Fallback Parsed Data:", JSON.stringify(data, null, 2));
      } else {
        console.error("Failed to parse AI response:", responseText);
        throw new Error("AI response was not valid JSON.");
      }
    }


    // --- SCHEMA MAPPING (Restricted Mode -> Frontend Contract) ---
    // Handle error responses first
    if (data.error === true) {
      return {
        identification_status: 'ambiguous',
        common_name: 'Image Not Usable',
        scientific_name: 'N/A',
        confidence: 0,
        plant_category: 'unknown',
        health_analysis: {
          severity: 'none',
          visible_issues: []
        },
        agricultural_relevance: {
          economic_importance: 'Unknown',
          primary_uses: []
        },
        cultivation_hints: {
          climate_preference: 'Unknown',
          soil_preference: 'Unknown',
          water_needs: 'Unknown'
        },
        notes: data.message || 'Unable to process image',
        alternative_matches: []
      };
    }

    // BACKEND VALIDATION: Check if the identified item is actually a plant/crop
    const commonName = (data.identification?.common_name || '').toLowerCase();
    const scientificName = (data.identification?.scientific_name || '').toLowerCase();

    // List of non-plant keywords that should trigger rejection
    const nonPlantKeywords = [
      'tractor', 'vehicle', 'car', 'truck', 'machine', 'equipment',
      'tool', 'building', 'house', 'person', 'human', 'animal',
      'dog', 'cat', 'bird', 'insect', 'furniture', 'chair', 'table',
      'phone', 'computer', 'screen', 'camera', 'device'
    ];

    const isNonPlant = nonPlantKeywords.some(keyword =>
      commonName.includes(keyword) || scientificName.includes(keyword)
    );

    if (isNonPlant) {
      console.log(`REJECTED: AI incorrectly identified "${data.identification?.common_name}" as a plant`);
      return {
        identification_status: 'ambiguous',
        common_name: 'Not a Plant',
        scientific_name: 'N/A',
        confidence: 0,
        plant_category: 'unknown',
        health_analysis: {
          severity: 'none',
          visible_issues: []
        },
        agricultural_relevance: {
          economic_importance: 'Unknown',
          primary_uses: []
        },
        cultivation_hints: {
          climate_preference: 'Unknown',
          soil_preference: 'Unknown',
          water_needs: 'Unknown'
        },
        notes: 'This image does not appear to contain a plant or crop. Please upload a clear photo of an agricultural crop (wheat, rice, vegetables, fruits, etc.).',
        alternative_matches: []
      };
    }

    // Parse confidence safely (handle both number and string with %)
    const confidenceValue = parseFloat(String(data.identification?.confidence || '0').replace('%', '')) || 0;
    const normalizedConfidence = confidenceValue > 1 ? confidenceValue / 100 : confidenceValue;

    const mappedValidData = {
      identification_status: normalizedConfidence >= 0.60 ? 'confirmed' : 'ambiguous',
      common_name: data.identification?.common_name || 'Unidentified Plant',
      scientific_name: data.identification?.scientific_name || 'Unknown',
      confidence: normalizedConfidence,
      plant_category: data.plant_part_detected || 'unknown',
      health_analysis: {
        severity: 'none', // Restricted mode focuses on ID only
        visible_issues: []
      },
      agricultural_relevance: {
        economic_importance: 'Unknown',
        primary_uses: []
      },
      cultivation_hints: {
        climate_preference: data.visual_traits?.environment || 'Unknown',
        soil_preference: 'Unknown',
        water_needs: 'Unknown'
      },
      notes: data.confidence_reason || data.next_action || '',
      alternative_matches: []
    };

    return mappedValidData;


  } catch (error) {
    console.error("Error identifying plant with Ollama:", error.message);

    // Mock Fallback for MVP Stability (preserves old fallback logic)
    console.log("Falling back to Mock AI Response...");
    return {
      identification_status: 'confirmed',
      common_name: 'MOCK Tomato',
      scientific_name: 'Solanum lycopersicum',
      confidence: 0.95,
      plant_category: 'crop',
      health_analysis: {
        severity: 'medium',
        visible_issues: ['Yellowing leaves', 'Dark spots']
      },
      agricultural_relevance: {
        economic_importance: 'high',
        primary_uses: ['food']
      },
      cultivation_hints: {
        climate_preference: 'Warm',
        soil_preference: 'Loamy',
        water_needs: 'Moderate'
      },
      notes: '[MOCK] Early blight detected. Ensure proper spacing and airflow.',
      alternative_matches: []
    };
  }
};

module.exports = { identifyPlant };
