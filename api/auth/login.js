/**
 * Login Endpoint
 * POST /api/auth/login
 * Body: { email, password }
 */

import mongoose from 'mongoose';

// Set CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Connect to MongoDB if not already connected
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    // TODO: Replace with your actual User model
    // const User = mongoose.model('User');
    // const user = await User.findOne({ email });
    // if (!user || !user.comparePassword(password)) {
    //   return res.status(401).json({ error: 'Invalid credentials' });
    // }

    // Mock response for now
    const mockUser = {
      id: '123',
      email: email,
      name: 'Test User',
      role: 'farmer'
    };

    // Generate JWT token (use jsonwebtoken in production)
    const token = Buffer.from(JSON.stringify(mockUser)).toString('base64');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      user: mockUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
