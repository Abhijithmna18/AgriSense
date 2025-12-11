/**
 * Deterministic rules for soil correction based on input values.
 * Returns required amendments (Lime, NPK) independent of the ML model.
 */

const calculateSoilActions = (soil, crop的需求 = {}) => {
    const actions = {
        addNkgHa: 0,
        addPkgHa: 0,
        addKkgHa: 0,
        limeKgHa: 0,
        note: []
    };

    if (!soil) return actions;

    // 1. pH Correction (Liming)
    // Target pH roughly 6.5 for most crops.
    // Rule: If pH < 5.5, apply lime. Rate depends on buffer capacity (simplified here as texture factor).
    if (soil.ph < 5.5) {
        const targetPh = 6.5;
        const diff = targetPh - soil.ph;
        // Clay soils need more lime (factor 1.2) than sandy (0.8). Default 1.0.
        let factor = 1000; // Base requirement kg/ha per pH unit
        if (soil.texture === 'clay') factor = 1200;
        if (soil.texture === 'sandy') factor = 800;

        actions.limeKgHa = Math.round(diff * factor);
        actions.note.push(`Acidic soil (pH ${soil.ph}). Apply lime.`);
    } else if (soil.ph > 8.0) {
        actions.note.push(`Alkaline soil (pH ${soil.ph}). Consider Gypsum.`);
    }

    // 2. NPK Gaps
    // Simplified logic: If soil values are strictly "Low", recommend basal dose.
    // Thresholds (approx ppm or kg/ha equivalent): N < 280, P < 10, K < 100 (Indian standards usually kg/ha)

    // Nitrogen
    if (soil.n !== undefined && soil.n < 280) {
        const deficit = 280 - soil.n;
        // Recommend 50% of deficit as basal application
        actions.addNkgHa = Math.round(deficit * 0.5);
        actions.note.push('Low Nitrogen. Apply Urea/Compost.');
    }

    // Phosphorus
    if (soil.p !== undefined && soil.p < 15) { // <10-20 kg/ha is low
        const deficit = 20 - soil.p;
        actions.addPkgHa = Math.round(deficit * 2); // P fixation factor
        actions.note.push('Low Phosphorus. Apply DAP/SSP.');
    }

    // Potassium
    if (soil.k !== undefined && soil.k < 120) { // <150 kg/ha is medium/low
        const deficit = 150 - soil.k;
        actions.addKkgHa = Math.round(deficit * 0.8);
        actions.note.push('Low Potassium. Apply MOP.');
    }

    // Organic Carbon
    if (soil.organic_c !== undefined && soil.organic_c < 0.5) {
        actions.note.push('Very low Organic Carbon. Apply FYM (Farm Yard Manure).');
    }

    return {
        ...actions,
        note: actions.note.join(' ')
    };
};

module.exports = { calculateSoilActions };
