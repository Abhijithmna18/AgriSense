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

            // DEBUG: Print user roles for auth debugging
            // console.log(`Auth Debug - User: ${user._id}, ActiveRole: ${user.activeRole}, Roles: ${user.roles}, LegacyRole: ${user.role}`);

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
        console.log(`[AUTHORIZE] Checking roles: ${roles.join(', ')}`);
        console.log(`[AUTHORIZE] User activeRole: ${req.user.activeRole}`);
        console.log(`[AUTHORIZE] User roles array: ${req.user.roles}`);
        console.log(`[AUTHORIZE] User legacy role: ${req.user.role}`);

        // 1. Check activeRole (Primary)
        if (req.user.activeRole && roles.includes(req.user.activeRole)) {
            console.log(`[AUTHORIZE] ✓ Authorized via activeRole: ${req.user.activeRole}`);
            return next();
        }

        // 2. Check roles array (Secondary/Fallback)
        if (req.user.roles && req.user.roles.some(role => roles.includes(role))) {
            console.log(`[AUTHORIZE] ✓ Authorized via roles array`);
            return next();
        }

        // 3. Check legacy role field (Backward Compatibility)
        if (req.user.role && roles.includes(req.user.role)) {
            console.log(`[AUTHORIZE] ✓ Authorized via legacy role: ${req.user.role}`);
            return next();
        }

        // If none match, deny access
        console.log(`[AUTHORIZE] ✗ DENIED - No matching role found`);
        return res.status(403).json({
            success: false,
            message: `Not authorized. Required roles: ${roles.join(', ')}`
        });
    };
};

/**
 * Admin only middleware (backward compatibility)
 */
// Update adminOnly to correctly use the flexible authorize function
const adminOnly = (req, res, next) => {
    return authorize('admin')(req, res, next);
};

module.exports = { protect, requireVerified, authorize, adminOnly };
