const Role = require('../models/Role');
const User = require('../models/User');

/**
 * Middleware to check if user has specific permission
 * Usage: router.get('/endpoint', protect, checkPermission('view_users'), handler)
 */
const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            // Admin always has access
            if (req.user.activeRole === 'admin') {
                return next();
            }

            // Get user's role
            const role = await Role.findOne({ 
                name: { $regex: new RegExp(`^${req.user.activeRole}$`, 'i') }
            }).populate('permissions');

            if (!role) {
                return res.status(403).json({ 
                    message: 'Access denied: Role not found' 
                });
            }

            // Check if role has the required permission
            const hasPermission = role.permissions.some(
                perm => perm.name === requiredPermission
            );

            if (!hasPermission) {
                return res.status(403).json({ 
                    message: `Access denied: Missing permission '${requiredPermission}'` 
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ message: 'Server error during permission check' });
        }
    };
};

/**
 * Middleware to check if user has any of the specified permissions
 * Usage: router.get('/endpoint', protect, checkAnyPermission(['view_users', 'edit_users']), handler)
 */
const checkAnyPermission = (requiredPermissions) => {
    return async (req, res, next) => {
        try {
            // Admin always has access
            if (req.user.activeRole === 'admin') {
                return next();
            }

            // Get user's role
            const role = await Role.findOne({ 
                name: { $regex: new RegExp(`^${req.user.activeRole}$`, 'i') }
            }).populate('permissions');

            if (!role) {
                return res.status(403).json({ 
                    message: 'Access denied: Role not found' 
                });
            }

            // Check if role has any of the required permissions
            const hasPermission = role.permissions.some(
                perm => requiredPermissions.includes(perm.name)
            );

            if (!hasPermission) {
                return res.status(403).json({ 
                    message: `Access denied: Missing one of permissions: ${requiredPermissions.join(', ')}` 
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ message: 'Server error during permission check' });
        }
    };
};

/**
 * Middleware to check if user has all specified permissions
 * Usage: router.get('/endpoint', protect, checkAllPermissions(['view_users', 'edit_users']), handler)
 */
const checkAllPermissions = (requiredPermissions) => {
    return async (req, res, next) => {
        try {
            // Admin always has access
            if (req.user.activeRole === 'admin') {
                return next();
            }

            // Get user's role
            const role = await Role.findOne({ 
                name: { $regex: new RegExp(`^${req.user.activeRole}$`, 'i') }
            }).populate('permissions');

            if (!role) {
                return res.status(403).json({ 
                    message: 'Access denied: Role not found' 
                });
            }

            // Check if role has all required permissions
            const userPermissions = role.permissions.map(perm => perm.name);
            const hasAllPermissions = requiredPermissions.every(
                perm => userPermissions.includes(perm)
            );

            if (!hasAllPermissions) {
                const missingPermissions = requiredPermissions.filter(
                    perm => !userPermissions.includes(perm)
                );
                return res.status(403).json({ 
                    message: `Access denied: Missing permissions: ${missingPermissions.join(', ')}` 
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ message: 'Server error during permission check' });
        }
    };
};

/**
 * Helper function to get user permissions (for use in controllers)
 */
const getUserPermissions = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return [];

        // Admin has all permissions
        if (user.activeRole === 'admin') {
            const Permission = require('../models/Permission');
            const allPermissions = await Permission.find();
            return allPermissions.map(p => p.name);
        }

        const role = await Role.findOne({ 
            name: { $regex: new RegExp(`^${user.activeRole}$`, 'i') }
        }).populate('permissions');

        if (!role) return [];

        return role.permissions.map(perm => perm.name);
    } catch (error) {
        console.error('Get user permissions error:', error);
        return [];
    }
};

module.exports = {
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    getUserPermissions
};
