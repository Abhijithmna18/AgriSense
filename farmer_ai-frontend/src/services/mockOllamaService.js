/**
 * Mock Ollama Service
 * Simulates AI advisory responses without network calls
 * CRITICAL: Advisory only - never modifies user data
 */

// Simulate network delay for realism
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get AI advisory based on context
 * @param {Object} context - Advisory context
 * @param {string} context.crop - Crop name
 * @param {string} context.stage - Current lifecycle stage
 * @param {Object} context.weather - Weather conditions
 * @param {Array} context.diaryNotes - Recent diary entries
 * @param {Object} context.sensors - Sensor data
 * @returns {Promise<Object>} Advisory response
 */
export const getAdvisory = async (context) => {
    await simulateDelay(500);

    const {
        crop = 'Unknown',
        stage = 'Vegetative',
        weather = {},
        diaryNotes = [],
        sensors = {}
    } = context;

    // Rule-based advisory generation
    const advisory = generateAdvisory(crop, stage, weather, diaryNotes, sensors);

    return {
        recommendation: advisory.recommendation,
        confidence: advisory.confidence,
        riskLevel: advisory.riskLevel,
        timestamp: new Date().toISOString(),
        // Metadata to show this is mock
        source: 'Mock Ollama (Offline)'
    };
};

/**
 * Generate advisory based on rules
 */
const generateAdvisory = (crop, stage, weather, diaryNotes, sensors) => {
    const recommendations = [];
    let riskLevel = 'Low';
    let confidence = 0.75;

    // Check soil moisture
    if (sensors.soil_moisture !== undefined) {
        if (sensors.soil_moisture < 40) {
            recommendations.push('Soil moisture is critically low. Increase irrigation frequency immediately.');
            riskLevel = 'High';
            confidence = 0.92;
        } else if (sensors.soil_moisture < 60) {
            recommendations.push('Soil moisture is below optimal. Consider increasing irrigation by 15-20%.');
            riskLevel = 'Medium';
            confidence = 0.88;
        } else if (sensors.soil_moisture > 85) {
            recommendations.push('Soil moisture is very high. Reduce irrigation to prevent waterlogging.');
            riskLevel = 'Medium';
            confidence = 0.85;
        }
    }

    // Check temperature
    if (sensors.temperature !== undefined) {
        if (sensors.temperature > 35) {
            recommendations.push('High temperature detected. Ensure adequate water supply and consider shade netting.');
            riskLevel = riskLevel === 'High' ? 'High' : 'Medium';
            confidence = Math.max(confidence, 0.87);
        } else if (sensors.temperature < 10) {
            recommendations.push('Low temperature may stress plants. Monitor for frost damage.');
            riskLevel = 'Medium';
            confidence = 0.82;
        }
    }

    // Check humidity
    if (sensors.humidity !== undefined) {
        if (sensors.humidity > 85) {
            recommendations.push('High humidity increases fungal disease risk. Improve air circulation and monitor for signs of disease.');
            riskLevel = riskLevel === 'High' ? 'High' : 'Medium';
            confidence = 0.84;
        }
    }

    // Stage-specific recommendations
    const stageAdvice = getStageSpecificAdvice(stage, crop);
    if (stageAdvice) {
        recommendations.push(stageAdvice);
        confidence = Math.max(confidence, 0.80);
    }

    // Check diary for incidents
    const hasIncidents = diaryNotes.some(note =>
        note.type === 'incident' &&
        (note.content.toLowerCase().includes('pest') ||
            note.content.toLowerCase().includes('disease') ||
            note.content.toLowerCase().includes('aphid') ||
            note.content.toLowerCase().includes('fungus'))
    );

    if (hasIncidents) {
        recommendations.push('Recent pest/disease incidents detected. Continue monitoring and consider preventive organic treatments.');
        riskLevel = 'Medium';
        confidence = 0.86;
    }

    // Weather-based recommendations
    if (weather.precipitation > 30) {
        recommendations.push('Heavy rainfall expected. Ensure proper drainage to prevent waterlogging.');
        riskLevel = riskLevel === 'High' ? 'High' : 'Medium';
    }

    // Default recommendation if no specific issues
    if (recommendations.length === 0) {
        recommendations.push(`Crop health appears normal for ${stage} stage. Continue current management practices.`);
        riskLevel = 'Low';
        confidence = 0.75;
    }

    return {
        recommendation: recommendations.join(' '),
        confidence: parseFloat(confidence.toFixed(2)),
        riskLevel
    };
};

/**
 * Get stage-specific advice
 */
const getStageSpecificAdvice = (stage, crop) => {
    const stageAdviceMap = {
        'Sowing': {
            default: 'Ensure proper seed depth and spacing. Keep soil consistently moist for germination.',
            Wheat: 'Sow at 2-3 cm depth. Maintain soil moisture at 70-80% for optimal germination.',
            Rice: 'Ensure field is properly leveled and flooded. Maintain 5-7 cm water depth.',
            Corn: 'Plant at 4-5 cm depth. Ensure soil temperature is above 10°C for good germination.'
        },
        'Germination': {
            default: 'Maintain consistent moisture. Protect seedlings from extreme weather.',
            Wheat: 'Monitor for damping-off disease. Ensure adequate drainage.',
            Rice: 'Maintain shallow water depth. Watch for snail damage.',
            Corn: 'Protect from birds. Monitor soil moisture closely.'
        },
        'Vegetative': {
            default: 'Apply nitrogen-rich fertilizer. Monitor for pest activity.',
            Wheat: 'Apply first nitrogen dose. Monitor for aphids and rust.',
            Rice: 'Apply urea in split doses. Control weeds and maintain water level.',
            Corn: 'Side-dress with nitrogen. Monitor for corn borer.'
        },
        'Flowering': {
            default: 'Ensure adequate water supply. Avoid stress during this critical period.',
            Wheat: 'Maintain soil moisture. Monitor for head blight.',
            Rice: 'Maintain 5-10 cm water depth. Watch for blast disease.',
            Corn: 'Ensure consistent moisture. Monitor for corn earworm.'
        },
        'Harvest': {
            default: 'Monitor crop maturity. Plan harvest timing to optimize yield and quality.',
            Wheat: 'Harvest when moisture content is 12-14%. Check grain hardness.',
            Rice: 'Harvest when 80-85% of grains are golden yellow. Avoid over-maturity.',
            Corn: 'Harvest when kernel moisture is 20-25%. Check kernel milk line.'
        }
    };

    const cropAdvice = stageAdviceMap[stage]?.[crop];
    const defaultAdvice = stageAdviceMap[stage]?.default;

    return cropAdvice || defaultAdvice || null;
};

/**
 * Get quick advisory for a specific issue
 */
export const getQuickAdvisory = async (issue) => {
    await simulateDelay(300);

    const issueAdviceMap = {
        'low_moisture': {
            recommendation: 'Increase irrigation frequency. Consider drip irrigation for water efficiency.',
            confidence: 0.90,
            riskLevel: 'Medium'
        },
        'high_moisture': {
            recommendation: 'Reduce irrigation. Improve drainage to prevent root rot.',
            confidence: 0.88,
            riskLevel: 'Medium'
        },
        'pest_detected': {
            recommendation: 'Identify pest species. Apply appropriate organic or chemical control. Monitor daily.',
            confidence: 0.85,
            riskLevel: 'High'
        },
        'disease_suspected': {
            recommendation: 'Isolate affected area. Collect samples for lab testing. Apply preventive fungicide if needed.',
            confidence: 0.82,
            riskLevel: 'High'
        },
        'nutrient_deficiency': {
            recommendation: 'Conduct soil test. Apply balanced fertilizer based on test results.',
            confidence: 0.87,
            riskLevel: 'Medium'
        }
    };

    const advice = issueAdviceMap[issue] || {
        recommendation: 'Monitor the situation closely. Consult with agricultural expert if issue persists.',
        confidence: 0.70,
        riskLevel: 'Low'
    };

    return {
        ...advice,
        timestamp: new Date().toISOString(),
        source: 'Mock Ollama (Offline)'
    };
};

/**
 * Analyze diary entry and suggest actions
 */
export const analyzeDiaryEntry = async (entry) => {
    await simulateDelay(400);

    const content = entry.content.toLowerCase();
    const suggestions = [];

    // Detect keywords and provide suggestions
    if (content.includes('pest') || content.includes('insect') || content.includes('aphid')) {
        suggestions.push('Consider applying neem oil or insecticidal soap.');
        suggestions.push('Monitor daily and document pest population changes.');
    }

    if (content.includes('yellow') || content.includes('wilting')) {
        suggestions.push('Check soil moisture and drainage.');
        suggestions.push('Inspect for root rot or nutrient deficiency.');
    }

    if (content.includes('disease') || content.includes('fungus') || content.includes('mold')) {
        suggestions.push('Remove affected plant parts.');
        suggestions.push('Improve air circulation and reduce humidity.');
        suggestions.push('Consider applying organic fungicide.');
    }

    if (content.includes('fertilizer') || content.includes('compost')) {
        suggestions.push('Monitor plant response over next 7-10 days.');
        suggestions.push('Avoid over-application to prevent nutrient burn.');
    }

    return {
        suggestions: suggestions.length > 0 ? suggestions : ['Entry logged. Continue monitoring.'],
        confidence: suggestions.length > 0 ? 0.80 : 0.60,
        timestamp: new Date().toISOString(),
        source: 'Mock Ollama (Offline)'
    };
};

export default {
    getAdvisory,
    getQuickAdvisory,
    analyzeDiaryEntry
};
