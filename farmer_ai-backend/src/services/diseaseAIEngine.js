/**
 * diseaseAIEngine.js
 * AI engine for disease analysis, outbreak detection, and treatment advice.
 * Used by diseaseController and disease routes.
 */
const { callLLM } = require('../utils/llmService');

/**
 * Analyze a disease prediction result and generate detailed treatment advice.
 * @param {string} cropName - e.g. "Tomato"
 * @param {string} diseaseName - e.g. "Early Blight"
 * @param {number} confidence - 0–1 from model
 */
exports.generateTreatmentAdvice = async (cropName, diseaseName, confidence) => {
    if (diseaseName.toLowerCase() === 'healthy') {
        return {
            summary: 'Your plant appears healthy! No disease detected.',
            immediate_actions: [],
            treatment_plan: [],
            prevention: ['Continue regular monitoring', 'Maintain proper irrigation and fertilization', 'Ensure good air circulation'],
            severity: 'None',
            recovery_time: 'N/A'
        };
    }

    const prompt = `You are a plant pathologist. A ${cropName} plant with ${(confidence * 100).toFixed(0)}% confidence has been diagnosed with "${diseaseName}".

Provide treatment advice in JSON:
{
  "summary": "...",
  "severity": "Mild|Moderate|Severe",
  "immediate_actions": ["...", "..."],
  "treatment_plan": [
    { "step": 1, "action": "...", "product": "...", "dosage": "...", "frequency": "..." }
  ],
  "prevention": ["...", "..."],
  "recovery_time": "...",
  "when_to_consult_expert": "..."
}
Return ONLY valid JSON.`;

    try {
        const raw = await callLLM(prompt, { temperature: 0.3, max_tokens: 600 });
        const match = raw.match(/\{[\s\S]+\}/);
        if (!match) throw new Error('No JSON in response');
        return JSON.parse(match[0]);
    } catch (err) {
        console.error('[DiseaseAIEngine] LLM error:', err.message);
        return {
            summary: `${diseaseName} detected in ${cropName}.`,
            severity: 'Moderate',
            immediate_actions: ['Isolate affected plants', 'Remove infected leaves', 'Apply appropriate fungicide/bactericide'],
            treatment_plan: [],
            prevention: ['Maintain crop hygiene', 'Use disease-resistant varieties', 'Avoid waterlogging'],
            recovery_time: '2–4 weeks with proper treatment',
            when_to_consult_expert: 'If symptoms spread to >30% of the crop'
        };
    }
};

/**
 * Evaluate outbreak risk in a region based on disease scan history.
 * @param {Array} recentScans - Array of DiseaseScan documents
 * @param {string} region - State or district name
 */
exports.assessOutbreakRisk = (recentScans, region) => {
    const windowDays = 7;
    const cutoff = new Date(Date.now() - windowDays * 86400000);
    const recent = recentScans.filter((s) => new Date(s.createdAt) > cutoff);

    const diseaseCounts = {};
    recent.forEach((scan) => {
        if (scan.disease && scan.disease.toLowerCase() !== 'healthy') {
            diseaseCounts[scan.disease] = (diseaseCounts[scan.disease] || 0) + 1;
        }
    });

    const threshold = 5; // 5+ cases in 7 days = outbreak risk
    const outbreaks = Object.entries(diseaseCounts)
        .filter(([, count]) => count >= threshold)
        .map(([disease, count]) => ({
            disease,
            cases: count,
            risk_level: count >= 10 ? 'High' : 'Medium',
            region,
            window: `Last ${windowDays} days`
        }));

    return {
        region,
        total_scans: recent.length,
        disease_cases: Object.values(diseaseCounts).reduce((a, b) => a + b, 0),
        potential_outbreaks: outbreaks,
        health_pct: recent.length > 0 ? ((recent.length - Object.values(diseaseCounts).reduce((a, b) => a + b, 0)) / recent.length * 100).toFixed(1) : 100
    };
};

/**
 * Summarize historical disease activity for a farm.
 */
exports.getFarmDiseaseHistory = (scans) => {
    const monthly = {};
    scans.forEach((scan) => {
        const month = new Date(scan.createdAt).toISOString().slice(0, 7);
        if (!monthly[month]) monthly[month] = { total: 0, diseases: {} };
        monthly[month].total++;
        if (scan.disease && scan.disease.toLowerCase() !== 'healthy') {
            monthly[month].diseases[scan.disease] = (monthly[month].diseases[scan.disease] || 0) + 1;
        }
    });

    return Object.entries(monthly)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
            month,
            total_scans: data.total,
            disease_incidents: Object.values(data.diseases).reduce((a, b) => a + b, 0),
            top_disease: Object.entries(data.diseases).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
        }));
};
