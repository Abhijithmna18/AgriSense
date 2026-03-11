const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');
const AdminAudit = require('../models/AdminAudit');

// @desc    Get all roles
// @route   GET /api/admin/roles
// @access  Private/Admin
exports.getRoles = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        
        const query = search
            ? { name: { $regex: search, $options: 'i' } }
            : {};

        const roles = await Role.find(query)
            .populate('permissions')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Get user count for each role
        const rolesWithCounts = await Promise.all(
            roles.map(async (role) => {
                const userCount = await User.countDocuments({ activeRole: role.name.toLowerCase() });
                return {
                    ...role.toObject(),
                    userCount
                };
            })
        );

        const count = await Role.countDocuments(query);

        res.json({
            roles: rolesWithCounts,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single role
// @route   GET /api/admin/roles/:id
// @access  Private/Admin
exports.getRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id).populate('permissions');
        
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        const userCount = await User.countDocuments({ activeRole: role.name.toLowerCase() });

        res.json({
            ...role.toObject(),
            userCount
        });
    } catch (error) {
        console.error('Get role error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create new role
// @route   POST /api/admin/roles
// @access  Private/Admin
exports.createRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body;

        // Check if role already exists
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ message: 'Role already exists' });
        }

        // Validate permissions
        if (permissions && permissions.length > 0) {
            const validPermissions = await Permission.find({ _id: { $in: permissions } });
            if (validPermissions.length !== permissions.length) {
                return res.status(400).json({ message: 'Invalid permissions provided' });
            }
        }

        const role = await Role.create({
            name,
            description,
            permissions: permissions || [],
            createdBy: req.user._id
        });

        // Log audit
        await AdminAudit.create({
            action: 'role_created',
            performedBy: req.user._id,
            targetModel: 'Role',
            targetId: role._id,
            details: { roleName: name }
        });

        const populatedRole = await Role.findById(role._id).populate('permissions');
        res.status(201).json(populatedRole);
    } catch (error) {
        console.error('Create role error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update role
// @route   PUT /api/admin/roles/:id
// @access  Private/Admin
exports.updateRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body;

        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Prevent updating system roles
        if (role.isSystem) {
            return res.status(403).json({ message: 'Cannot modify system roles' });
        }

        // Validate permissions
        if (permissions && permissions.length > 0) {
            const validPermissions = await Permission.find({ _id: { $in: permissions } });
            if (validPermissions.length !== permissions.length) {
                return res.status(400).json({ message: 'Invalid permissions provided' });
            }
        }

        role.name = name || role.name;
        role.description = description || role.description;
        role.permissions = permissions || role.permissions;

        await role.save();

        // Log audit
        await AdminAudit.create({
            action: 'role_updated',
            performedBy: req.user._id,
            targetModel: 'Role',
            targetId: role._id,
            details: { roleName: role.name }
        });

        const updatedRole = await Role.findById(role._id).populate('permissions');
        res.json(updatedRole);
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete role
// @route   DELETE /api/admin/roles/:id
// @access  Private/Admin
exports.deleteRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Prevent deleting system roles
        if (role.isSystem) {
            return res.status(403).json({ message: 'Cannot delete system roles' });
        }

        // Check if any users have this role
        const userCount = await User.countDocuments({ activeRole: role.name.toLowerCase() });
        if (userCount > 0) {
            return res.status(400).json({ 
                message: `Cannot delete role. ${userCount} user(s) are assigned to this role.` 
            });
        }

        await role.deleteOne();

        // Log audit
        await AdminAudit.create({
            action: 'role_deleted',
            performedBy: req.user._id,
            targetModel: 'Role',
            targetId: role._id,
            details: { roleName: role.name }
        });

        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error('Delete role error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all permissions
// @route   GET /api/admin/permissions
// @access  Private/Admin
exports.getPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find().sort({ module: 1, name: 1 });
        
        // Group by module
        const groupedPermissions = permissions.reduce((acc, permission) => {
            if (!acc[permission.module]) {
                acc[permission.module] = [];
            }
            acc[permission.module].push(permission);
            return acc;
        }, {});

        res.json(groupedPermissions);
    } catch (error) {
        console.error('Get permissions error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get role permissions
// @route   GET /api/admin/roles/:id/permissions
// @access  Private/Admin
exports.getRolePermissions = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id).populate('permissions');
        
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        res.json(role.permissions);
    } catch (error) {
        console.error('Get role permissions error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Assign role to user
// @route   PUT /api/admin/users/:userId/role
// @access  Private/Admin
exports.assignRoleToUser = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate role exists
        const roleExists = await Role.findOne({ name: role });
        if (!roleExists) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        user.activeRole = role.toLowerCase();
        
        // Add to roles array if not present
        if (!user.roles.includes(role.toLowerCase())) {
            user.roles.push(role.toLowerCase());
        }

        await user.save();

        // Log audit
        await AdminAudit.create({
            action: 'role_assigned',
            performedBy: req.user._id,
            targetModel: 'User',
            targetId: user._id,
            details: { role, userEmail: user.email }
        });

        res.json({ message: 'Role assigned successfully', user });
    } catch (error) {
        console.error('Assign role error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
