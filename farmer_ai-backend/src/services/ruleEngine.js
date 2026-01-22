/**
 * AgriSense Rule-Based Advisory Engine (MVP)
 * Deterministic logic for crop recommendations.
 */

const SEASON_MAPPING = {
    'kharif': ['June', 'July', 'August', 'September', 'October'],
    'rabi': ['November', 'December', 'January', 'February'],
    'zaid': ['March', 'April', 'May']
};

const CROP_RULES = [
    {
        crop: 'Rice',
        minRainfall: 1000, // mm
        soilTypes: ['Clay', 'Loamy'],
        seasons: ['kharif'],
        waterNeed: 'High',
        nitrogenNeed: 'High'
    },
    {
        crop: 'Wheat',
        minRainfall: 400,
        soilTypes: ['Loamy', 'Clay'],
        seasons: ['rabi'],
        waterNeed: 'Medium',
        nitrogenNeed: 'Medium'
    },
    {
        crop: 'Cotton',
        minRainfall: 500,
        soilTypes: ['Black'],
        seasons: ['kharif'],
        waterNeed: 'Medium',
        nitrogenNeed: 'High'
    },
    {
        crop: 'Maize',
        minRainfall: 500,
        soilTypes: ['Loamy', 'Red'],
        seasons: ['kharif', 'rabi'],
        waterNeed: 'Medium',
        nitrogenNeed: 'High'
    },
    {
        crop: 'Soybean',
        minRainfall: 600,
        soilTypes: ['Loamy', 'Black'],
        seasons: ['kharif'],
        waterNeed: 'Medium',
        nitrogenNeed: 'Low' // Nitrogen fixer
    },
    {
        crop: 'Mustard',
        minRainfall: 300,
        soilTypes: ['Loamy', 'Sandy'],
        seasons: ['rabi'],
        waterNeed: 'Low',
        nitrogenNeed: 'Medium'
    }
];

exports.recommendCrops = (inputs) => {
    const { soilType, waterAvailability, region, month, soilTest } = inputs;
    const currentMonth = month || new Date().toLocaleString('default', { month: 'long' });

    // Determine Season
    let currentSeason = 'unknown';
    for (const [season, months] of Object.entries(SEASON_MAPPING)) {
        if (months.includes(currentMonth)) {
            currentSeason = season;
            break;
        }
    }

    const recommendations = [];

    CROP_RULES.forEach(rule => {
        let score = 0;
        const reasons = [];

        // 1. Season Check (Critical)
        if (rule.seasons.includes(currentSeason)) {
            score += 50;
            reasons.push(`Suitable for ${currentSeason} season`);
        } else {
            return; // Skip if wrong season
        }

        // 2. Soil Match
        if (rule.soilTypes.includes(soilType)) {
            score += 30;
            reasons.push(`Thrives in ${soilType} soil`);
        } else {
            score -= 10; // Penalty but allow if other factors strong
        }

        // 3. Water Check
        if (rule.waterNeed === 'High' && waterAvailability === 'Low') {
            score -= 50; // Critical mismatch
            reasons.push('Insufficient water availability');
        } else if (rule.waterNeed === 'Low' && waterAvailability === 'High') {
            score += 10; // Can handle it
        } else if (rule.waterNeed === waterAvailability) {
            score += 20;
            reasons.push('Matches water availability');
        }

        // 4. Fertilizer Logic (Soil Test)
        if (soilTest) {
            if (soilTest.n < 280 && rule.nitrogenNeed === 'High') {
                reasons.push('Soil N is low; apply Urea');
            } else if (soilTest.n > 560 && rule.nitrogenNeed === 'Low') {
                reasons.push('High N soil; good for non-legumes');
            }
        }

        if (score > 60) {
            recommendations.push({
                cropName: rule.crop,
                score,
                reasons,
                season: currentSeason
            });
        }
    });

    return recommendations.sort((a, b) => b.score - a.score);
};
