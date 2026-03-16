/**
 * Register Endpoint
 * POST /api/auth/register
 * Body: { email, password, name, role }
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
    const { email, password, name, role } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password, and name are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters'
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
    // const existingUser = await User.findOne({ email });
    // if (existingUser) {
    //   return res.status(409).json({ error: 'User already exists' });
    // }
    // const user = new User({ email, password, name, role: role || 'farmer' });
    // await user.save();

    // Mock response for now
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email: email,
      name: name,
      role: role || 'farmer'
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
