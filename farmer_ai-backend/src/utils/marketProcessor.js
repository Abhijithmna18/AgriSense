/**
 * Analytic utility to process user-supplied market price time-series.
 * Computes trend slope and normalized scores to influence crop ranking.
 */

const processMarketTrends = (marketTrends, agronomicRanking) => {
    // If no market data, return agronomic ranking as-is with 0 market score
    if (!marketTrends || marketTrends.length === 0) {
        return agronomicRanking.map(crop => ({
            ...crop,
            marketScore: 0,
            marketSlope: 0,
            finalScore: crop.suitability // purely agronomic
        }));
    }

    // 1. Compute Slope (Linear Regression) for each crop series
    const cropTrends = {};

    marketTrends.forEach(item => {
        // Series: [[date, price], [date, price]...]
        // Sort by date just in case
        const sorted = item.series.sort((a, b) => new Date(a[0]) - new Date(b[0]));
        if (sorted.length < 2) return; // Need at least 2 points

        const n = sorted.length;
        const prices = sorted.map(d => d[1]);

        // Simple linear regression slope on index (0, 1, 2...) representing time steps
        // Slope > 0 means rising prices
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += prices[i];
            sumXY += (i * prices[i]);
            sumXX += (i * i);
        }

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        cropTrends[item.crop.toLowerCase()] = { slope, currentPrice: prices[n - 1] };
    });

    // 2. Adjust Ranking
    // We boost score if slope > 0 (rising market)
    // We penalize if slope < 0

    return agronomicRanking.map(crop => {
        const trend = cropTrends[crop.cropName.toLowerCase()];

        let marketScore = 0.5; // neutral default
        let marketSlope = 0;
        let priceImpact = 0;

        if (trend) {
            marketSlope = Number(trend.slope.toFixed(2));
            // Normalize slope roughly: +10 slope => score 1.0, -10 => 0.0
            // Sigmoid-ish or clamped linear
            marketScore = Math.min(Math.max((trend.slope + 10) / 20, 0), 1);

            // Expected profit boost calculation (simplified)
            // If slope is +5 (price up 5rs/unit per timestep), yield * 5 is extra profit?
            // Just a heuristic for the UI sparkline context.
            priceImpact = trend.slope * 1000; // arbitrary yield scalar
        }

        // Weighted combination: 70% agronomic, 30% market (could be user param)
        const w_agronomic = 0.7;
        const w_market = 0.3;

        const finalScore = (crop.suitability * w_agronomic) + (marketScore * w_market);

        return {
            ...crop,
            score: Number(finalScore.toFixed(2)),
            marketScore,
            marketSlope,
            expectedProfitPerHa: crop.expectedProfitPerHa + priceImpact // Adjust profit hint
        };
    }).sort((a, b) => b.score - a.score); // Re-sort by blended score
};

module.exports = { processMarketTrends };
