/**
 * priceAPI.js
 * Fetches agricultural commodity price data.
 *
 * Primary source: data.gov.in Agmarknet API (free, no rate limit for basic use)
 * Falls back to deterministic mock prices if the external API is unavailable.
 */
const axios = require('axios');

const AGMARKNET_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const GOV_API_KEY = process.env.GOV_DATA_API_KEY || 'demo_key'; // Register at data.gov.in for key

/**
 * Realistic base prices (₹/quintal) for common Indian crops.
 * Used as fallback / mock data.
 */
const BASE_PRICES = {
    wheat: 2150, rice: 3200, maize: 1900, soybean: 4800,
    tomato: 1200, potato: 1100, onion: 2500, sugarcane: 350,
    cotton: 6200, groundnut: 5800, mustard: 5400, turmeric: 11000,
    chilli: 8000, banana: 900, mango: 3500
};

/**
 * Generate a mock price with ±10% daily variance (deterministic on date/crop).
 */
const getMockPrice = (cropName) => {
    const crop = cropName.toLowerCase().replace(/\s+/g, '');
    const base = BASE_PRICES[crop] || 2000;
    const seed = crop.charCodeAt(0) + new Date().getDate();
    const pct = ((seed % 20) - 10) / 100;
    return parseFloat((base * (1 + pct)).toFixed(0));
};

/**
 * Fetch current modal price for a crop from data.gov.in Agmarknet.
 * Returns ₹/quintal.
 *
 * @param {string} commodity - Crop name e.g. 'Wheat', 'Tomato'
 * @param {string} [state] - State filter e.g. 'Punjab'
 */
exports.getMarketPrice = async (commodity, state) => {
    try {
        if (!process.env.GOV_DATA_API_KEY) throw new Error('No API key');

        const params = {
            'api-key': GOV_API_KEY,
            format: 'json',
            limit: 10,
            'filters[commodity]': commodity
        };
        if (state) params['filters[state]'] = state;

        const { data } = await axios.get(AGMARKNET_URL, { params, timeout: 8000 });

        if (!data?.records?.length) throw new Error('No records');

        const prices = data.records.map((r) => parseFloat(r.modal_price) || 0).filter(Boolean);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

        return {
            commodity,
            state: state || 'National',
            modal_price: parseFloat(avgPrice.toFixed(0)),
            unit: '₹/quintal',
            markets: data.records.length,
            source: 'data.gov.in',
            date: new Date().toISOString().split('T')[0]
        };
    } catch {
        // Fallback to mock
        return {
            commodity,
            state: state || 'National',
            modal_price: getMockPrice(commodity),
            unit: '₹/quintal',
            markets: 0,
            source: 'mock',
            date: new Date().toISOString().split('T')[0]
        };
    }
};

/**
 * Get prices for multiple crops at once.
 * @param {string[]} crops
 */
exports.getMultipleMarketPrices = async (crops) => {
    const results = await Promise.all(crops.map((c) => exports.getMarketPrice(c)));
    return results;
};

/**
 * Simple 7-day price trend simulation based on commodity.
 * Returns array of { date, price } for sparkline charts.
 */
exports.getPriceTrend = (commodity, days = 7) => {
    const base = getMockPrice(commodity);
    const trend = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const variance = ((d.getDate() + d.getMonth() + commodity.length) % 15 - 7) / 100;
        trend.push({
            date: d.toISOString().split('T')[0],
            price: parseFloat((base * (1 + variance)).toFixed(0))
        });
    }
    return trend;
};
