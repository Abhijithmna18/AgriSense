const MarketPrice = require('../models/MarketPrice');
const { generateJSON } = require('../utils/llmService');
const AppError = require('../utils/AppError');

// @desc    Get price history for a crop
// @route   GET /api/market-prices/:crop
// @access  Private
exports.getPriceHistory = async (req, res, next) => {
    try {
        const { crop } = req.params;
        const { location, days = 30 } = req.query;

        const query = { crop: crop.toLowerCase() };
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        const prices = await MarketPrice.find(query)
            .sort({ date: 1 }) // Ascending for chart
            .limit(parseInt(days));

        res.status(200).json({
            success: true,
            count: prices.length,
            data: prices
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get AI-driven price prediction and advice
// @route   POST /api/market-prices/predict
// @access  Private
exports.predictPriceTrend = async (req, res, next) => {
    try {
        const { crop, location, currentPrice } = req.body;

        if (!crop || !currentPrice) {
            throw new AppError('Crop and current price are required', 400);
        }

        // 1. Fetch recent history for context
        const history = await MarketPrice.find({
            crop: crop.toLowerCase(),
            location: { $regex: location || '', $options: 'i' }
        })
            .sort({ date: -1 })
            .limit(10); // Last 10 records

        const historyText = history.map(p =>
            `${p.date.toISOString().split('T')[0]}: ₹${p.price}/${p.unit}`
        ).join('\n');

        // 2. Construct AI Prompt
        const systemPrompt = `You are an expert Agricultural Economist and Market Analyst.
        Your goal is to advise a farmer/vendor on whether to sell their crop NOW or WAIT based on price trends.
        
        Analyze the provided price history and current price.
        Consider seasonal trends for the crop (e.g., harvest time usually drops prices).
        
        Output strictly in JSON format:
        {
            "recommendation": "SELL" | "HOLD" | "BUY",
            "confidence_score": Number (0-100),
            "predicted_trend": "rising" | "falling" | "stable",
            "reasoning": "Detailed explanation...",
            "forecast_next_week": Number (projected price)
        }`;

        const userPrompt = `
        Crop: ${crop}
        Location: ${location || 'General Market'}
        Current Price: ₹${currentPrice}
        
        Recent Price History:
        ${historyText}
        
        Is it a good time to sell?`;

        // 3. Call LLM
        const prediction = await generateJSON(systemPrompt, userPrompt);

        res.status(200).json({
            success: true,
            data: prediction
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Seed mock data for demonstration
// @route   POST /api/market-prices/seed
// @access  Private (Dev only)
exports.seedMarketData = async (req, res, next) => {
    try {
        const crops = ['wheat', 'rice', 'corn', 'potato', 'onion', 'tomato'];
        // Prices fetched from Agmarknet/Commodity Online (Feb 2026)
        const basePrices = {
            'wheat': 2525,  // ~₹2524.78
            'rice': 4080,   // ~₹4080
            'corn': 2785,   // ~₹2784.72
            'potato': 1400, // ~₹1397
            'onion': 2650,  // ~₹2649.91
            'tomato': 1915  // ~₹1913
        };

        const prices = [];
        const today = new Date();

        // Generate 30 days of data for each crop
        for (const crop of crops) {
            let currentPrice = basePrices[crop];

            for (let i = 29; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);

                // Random fluctuation (-5% to +5%)
                const volatility = crop === 'onion' || crop === 'tomato' ? 0.10 : 0.02;
                const change = 1 + (Math.random() * volatility * 2 - volatility);
                currentPrice = Math.round(currentPrice * change);

                prices.push({
                    crop,
                    market: 'APMC Mandi',
                    location: 'District Headquarter',
                    price: currentPrice,
                    unit: 'quintal',
                    date: date
                });
            }
        }

        // Clear simulation data for these crops to avoid duplicates on re-seed
        await MarketPrice.deleteMany({ crop: { $in: crops } });

        await MarketPrice.insertMany(prices);

        res.status(201).json({
            success: true,
            message: `Seeded ${prices.length} price records`,
            data: prices.slice(0, 5) // Show sample
        });

    } catch (err) {
        next(err);
    }
};
