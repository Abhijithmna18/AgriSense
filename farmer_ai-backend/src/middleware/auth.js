const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided'
            });
        }

        try {
            // Verify token
            const decoded = verifyToken(token);

            // Get user from token
            const user = await User.findById(decoded.userId).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Attach user to request
            req.user = user;
            next();

        } catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message || 'Not authorized, token failed'
            });
        }

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

/**
 * Check if user is verified
 */
const requireVerified = (req, res, next) => {
    if (!req.user.isEmailVerified) {
        return res.status(403).json({
            success: false,
            message: 'Email verification required'
        });
    }
    next();
};

/**
 * Check user role
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        next();
    };
};

/**
 * Admin only middleware (backward compatibility)
 */
const adminOnly = authorize('admin');

module.exports = { protect, requireVerified, authorize, adminOnly };
