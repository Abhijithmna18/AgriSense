/**
 * Market Analytics Endpoint
 * GET /api/market/analytics?timeRange=7d
 * Query params: timeRange (7d, 30d, 90d)
 */

import mongoose from 'mongoose';

// Set CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'public, max-age=3600');
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { timeRange = '7d' } = req.query;

    // Validate timeRange
    if (!['7d', '30d', '90d'].includes(timeRange)) {
      return res.status(400).json({
        error: 'Invalid timeRange. Must be 7d, 30d, or 90d'
      });
    }

    // Connect to MongoDB if not already connected
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    // TODO: Replace with your actual database queries
    // const MarketData = mongoose.model('MarketData');
    // const data = await MarketData.find({
    //   date: { $gte: new Date(Date.now() - getDaysInMs(timeRange)) }
    // });

    // Mock data for now
    const generateMockData = (days) => {
      const data = [];
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toISOString().split('T')[0],
          avgPrice: Math.floor(Math.random() * 5000) + 20000,
          minPrice: Math.floor(Math.random() * 3000) + 15000,
          maxPrice: Math.floor(Math.random() * 8000) + 25000,
          volume: Math.floor(Math.random() * 1000) + 100
        });
      }
      return data;
    };

    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const days = daysMap[timeRange];

    const analytics = {
      timeRange: timeRange,
      avgMarketPrice: 42500,
      priceVolatility: 12.5,
      activeSuppliers: 234,
      bestTimeToBy: 'Next 3 days',
      costSavingPotential: '15-20%',
      supplyAlert: 'High demand expected',
      priceHistory: generateMockData(days),
      topCrops: [
        { name: 'Wheat', price: 45000, change: 2.5 },
        { name: 'Rice', price: 42000, change: -1.2 },
        { name: 'Corn', price: 38000, change: 3.1 },
        { name: 'Soybean', price: 52000, change: 0.8 }
      ],
      suppliers: [
        {
          id: '1',
          name: 'Punjab Agro Supplies',
          rating: 4.8,
          price: 40000,
          location: 'Punjab'
        },
        {
          id: '2',
          name: 'Haryana Farm Inputs',
          rating: 4.5,
          price: 41000,
          location: 'Haryana'
        },
        {
          id: '3',
          name: 'UP Agricultural Co.',
          rating: 4.3,
          price: 39500,
          location: 'Uttar Pradesh'
        }
      ]
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Market analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
