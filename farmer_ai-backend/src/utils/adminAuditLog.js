const AdminAudit = require('../models/AdminAudit');

/**
 * Creates an admin audit log entry
 * @param {Object} req - Express request object (must have req.user)
 * @param {String} action - Action name (e.g., 'SUSPEND_USER')
 * @param {String} entity - Entity type (e.g., 'User')
 * @param {String} entityId - ID of the entity
 * @param {Object} changes - { before, after } objects
 * @param {Object} details - Additional details
 */
const logAdminAction = async (req, action, entity, entityId, changes = {}, details = {}) => {
    try {
        const adminId = req.user ? req.user._id : null;
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');

        if (!adminId) {
            console.warn('AdminAudit: No admin ID found in request (ensure protect middleware is used)');
        }

        await AdminAudit.create({
            adminId,
            action,
            entity,
            entityId,
            changes,
            details,
            ip,
            userAgent
        });
    } catch (error) {
        console.error('AdminAudit Error:', error);
        // Don't crash the request if audit fails, but log it
    }
};

module.exports = logAdminAction;
