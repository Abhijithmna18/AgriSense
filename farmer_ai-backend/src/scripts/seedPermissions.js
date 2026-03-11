const mongoose = require('mongoose');
const Permission = require('../models/Permission');
const Role = require('../models/Role');
require('dotenv').config();

const permissions = [
    // User Management
    { name: 'view_users', module: 'User Management', description: 'View user list and details' },
    { name: 'create_users', module: 'User Management', description: 'Create new users' },
    { name: 'edit_users', module: 'User Management', description: 'Edit user information' },
    { name: 'delete_users', module: 'User Management', description: 'Delete users' },
    { name: 'suspend_users', module: 'User Management', description: 'Suspend/activate users' },
    
    // Vendor Management
    { name: 'view_vendors', module: 'Vendor Management', description: 'View vendor applications' },
    { name: 'approve_vendors', module: 'Vendor Management', description: 'Approve vendor applications' },
    { name: 'reject_vendors', module: 'Vendor Management', description: 'Reject vendor applications' },
    
    // Loan Management
    { name: 'view_loans', module: 'Loan Management', description: 'View loan applications' },
    { name: 'approve_loans', module: 'Loan Management', description: 'Approve loan applications' },
    { name: 'reject_loans', module: 'Loan Management', description: 'Reject loan applications' },
    { name: 'manage_loan_schemes', module: 'Loan Management', description: 'Manage loan schemes' },
    
    // Marketplace
    { name: 'view_products', module: 'Marketplace', description: 'View marketplace products' },
    { name: 'manage_products', module: 'Marketplace', description: 'Add, edit, delete products' },
    { name: 'manage_orders', module: 'Marketplace', description: 'Manage marketplace orders' },
    { name: 'view_transactions', module: 'Marketplace', description: 'View transaction history' },
    
    // Farm Management
    { name: 'view_farms', module: 'Farm Management', description: 'View farm information' },
    { name: 'manage_farms', module: 'Farm Management', description: 'Add, edit, delete farms' },
    { name: 'view_farm_analytics', module: 'Farm Management', description: 'View farm analytics and insights' },
    
    // System
    { name: 'view_audit_logs', module: 'System', description: 'View system audit logs' },
    { name: 'manage_feature_flags', module: 'System', description: 'Manage feature flags' },
    { name: 'manage_warehouses', module: 'System', description: 'Manage warehouse system' },
    { name: 'manage_roles', module: 'System', description: 'Manage roles and permissions' },
    { name: 'system_settings', module: 'System', description: 'Access system settings' },
    
    // Reports
    { name: 'view_reports', module: 'Reports', description: 'View system reports' },
    { name: 'view_ai_reports', module: 'Reports', description: 'View AI-generated reports' },
    { name: 'export_reports', module: 'Reports', description: 'Export reports' },
    
    // Community
    { name: 'manage_community', module: 'Community', description: 'Manage community events and forums' },
    { name: 'moderate_content', module: 'Community', description: 'Moderate user-generated content' }
];

const defaultRoles = [
    {
        name: 'Admin',
        description: 'Full system access with all permissions',
        isSystem: true,
        permissions: [] // Will be filled with all permissions
    },
    {
        name: 'Vendor',
        description: 'Vendor dashboard access for marketplace sellers',
        isSystem: true,
        permissions: ['view_products', 'manage_products', 'manage_orders', 'view_transactions']
    },
    {
        name: 'Farmer',
        description: 'Farmer platform access for farm management',
        isSystem: true,
        permissions: ['view_farms', 'manage_farms', 'view_farm_analytics', 'view_products']
    },
    {
        name: 'Loan Officer',
        description: 'Loan management and approval access',
        isSystem: true,
        permissions: ['view_loans', 'approve_loans', 'reject_loans', 'view_users']
    },
    {
        name: 'Manager',
        description: 'Reports and monitoring access',
        isSystem: true,
        permissions: ['view_reports', 'view_ai_reports', 'export_reports', 'view_users', 'view_farms', 'view_vendors']
    }
];

const seedPermissions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected...');

        // Clear existing permissions and roles
        await Permission.deleteMany({});
        await Role.deleteMany({});
        console.log('Cleared existing permissions and roles');

        // Create permissions
        const createdPermissions = await Permission.insertMany(permissions);
        console.log(`Created ${createdPermissions.length} permissions`);

        // Create permission map for easy lookup
        const permissionMap = {};
        createdPermissions.forEach(p => {
            permissionMap[p.name] = p._id;
        });

        // Create roles with permissions
        for (const roleData of defaultRoles) {
            let permissionIds = [];
            
            if (roleData.name === 'Admin') {
                // Admin gets all permissions
                permissionIds = createdPermissions.map(p => p._id);
            } else {
                // Map permission names to IDs
                permissionIds = roleData.permissions.map(permName => permissionMap[permName]).filter(Boolean);
            }

            await Role.create({
                name: roleData.name,
                description: roleData.description,
                isSystem: roleData.isSystem,
                permissions: permissionIds
            });
        }

        console.log(`Created ${defaultRoles.length} default roles`);
        console.log('Seeding completed successfully!');
        
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedPermissions();
