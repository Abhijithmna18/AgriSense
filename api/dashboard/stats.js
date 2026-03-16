/**
 * Dashboard Stats Endpoint
 * GET /api/dashboard/stats
 * Headers: { Authorization: Bearer <token> }
 */

import mongoose from 'mongoose';

// Set CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
    // Verify authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Connect to MongoDB if not already connected
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    // TODO: Replace with your actual database queries
    // const Loan = mongoose.model('Loan');
    // const Transaction = mongoose.model('Transaction');
    // const User = mongoose.model('User');

    // Mock data for now
    const stats = {
      totalUsers: 1250,
      activeLoans: 45,
      totalTransactions: 3200,
      avgLoanAmount: 50000,
      totalLoanAmount: 2250000,
      repaymentRate: 92.5,
      pendingApprovals: 12,
      recentTransactions: [
        {
          id: '1',
          type: 'loan_disbursement',
          amount: 50000,
          date: new Date().toISOString(),
          status: 'completed'
        },
        {
          id: '2',
          type: 'repayment',
          amount: 5000,
          date: new Date().toISOString(),
          status: 'completed'
        }
      ]
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
