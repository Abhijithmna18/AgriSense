# Roles & Permissions Management System - Setup Guide

## Overview
A complete Role-Based Access Control (RBAC) system has been implemented for the AgriSense Admin Dashboard. This system allows administrators to create, manage, and assign roles with granular permissions to control user access across the platform.

## Features Implemented

### 1. Backend Components

#### Models
- **Permission Model** (`farmer_ai-backend/src/models/Permission.js`)
  - Stores individual permissions with module categorization
  - Modules: User Management, Vendor Management, Loan Management, Marketplace, System, Farm Management, Reports, Community

- **Role Model** (`farmer_ai-backend/src/models/Role.js`)
  - Stores roles with associated permissions
  - Supports system roles (cannot be deleted)
  - Tracks creation and updates

#### Controllers
- **Role Controller** (`farmer_ai-backend/src/controllers/roleController.js`)
  - `getRoles()` - List all roles with pagination and search
  - `getRole()` - Get single role details
  - `createRole()` - Create new role with permissions
  - `updateRole()` - Update role details and permissions
  - `deleteRole()` - Delete role (with validation)
  - `getPermissions()` - Get all permissions grouped by module
  - `getRolePermissions()` - Get permissions for specific role
  - `assignRoleToUser()` - Assign role to user

#### Routes
- All routes added to `/api/admin/roles` endpoint
- Protected with admin authentication middleware
- Integrated into existing admin routes

### 2. Frontend Components

#### Roles & Permissions Admin Page
**Location:** `farmer_ai-frontend/src/pages/admin/RolesPermissionsAdmin.jsx`

**Features:**
- ✅ Roles table with search and pagination
- ✅ Create role modal with permission selection
- ✅ Edit role modal (system roles protected)
- ✅ View permissions modal
- ✅ Delete role with confirmation
- ✅ Empty state for first-time setup
- ✅ Permission grouping by module
- ✅ User count per role
- ✅ Responsive design matching admin theme

#### Users Admin Page Enhancement
**Location:** `farmer_ai-frontend/src/pages/admin/UsersAdmin.jsx`

**Updates:**
- ✅ Role dropdown in user table
- ✅ Direct role assignment from user list
- ✅ Dynamic role loading from backend
- ✅ Visual role indicators with colors

### 3. Database Schema

#### Permissions Table
```javascript
{
  name: String (unique),
  module: String (enum),
  description: String,
  createdAt: Date
}
```

#### Roles Table
```javascript
{
  name: String (unique),
  description: String,
  permissions: [ObjectId] (ref: Permission),
  isSystem: Boolean,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

#### User Model Updates
- Existing `roles` array field (multiple roles support)
- Existing `activeRole` field (current active role)

### 4. Default Roles & Permissions

The system comes with 5 pre-configured roles:

1. **Admin** - Full system access (all permissions)
2. **Vendor** - Marketplace seller access
3. **Farmer** - Farm management access
4. **Loan Officer** - Loan approval access
5. **Manager** - Reports and monitoring access

**Total Permissions:** 30 permissions across 8 modules

## Setup Instructions

### Step 1: Seed Permissions and Roles

Run the seed script to populate default permissions and roles:

```bash
cd farmer_ai-backend
node src/scripts/seedPermissions.js
```

Expected output:
```
MongoDB connected...
Cleared existing permissions and roles
Created 30 permissions
Created 5 default roles
Seeding completed successfully!
```

### Step 2: Restart Backend Server

```bash
cd farmer_ai-backend
npm start
```

### Step 3: Restart Frontend

```bash
cd farmer_ai-frontend
npm run dev
```

### Step 4: Access Roles Management

1. Log in as an admin user
2. Navigate to Admin Dashboard
3. Click on "Roles" in the sidebar
4. You should see the roles management interface

## API Endpoints

### Roles
- `GET /api/admin/roles` - List all roles (with pagination, search)
- `POST /api/admin/roles` - Create new role
- `GET /api/admin/roles/:id` - Get single role
- `PUT /api/admin/roles/:id` - Update role
- `DELETE /api/admin/roles/:id` - Delete role
- `GET /api/admin/roles/:id/permissions` - Get role permissions

### Permissions
- `GET /api/admin/roles/permissions/all` - Get all permissions (grouped by module)

### User Role Assignment
- `PUT /api/admin/users/:userId/role` - Assign role to user

## Usage Guide

### Creating a New Role

1. Click "Create Role" button
2. Enter role name (e.g., "Content Manager")
3. Enter description
4. Select permissions by module:
   - User Management
   - Vendor Management
   - Loan Management
   - Marketplace
   - Farm Management
   - System
   - Reports
   - Community
5. Click "Create Role"

### Editing a Role

1. Click the edit icon on any role (except system roles)
2. Modify name, description, or permissions
3. Click "Save Changes"

### Viewing Role Permissions

1. Click the eye icon on any role
2. View all assigned permissions grouped by module
3. See user count and permission count

### Deleting a Role

1. Click the delete icon (only for non-system roles)
2. Type "DELETE" to confirm
3. Note: Cannot delete roles with assigned users

### Assigning Roles to Users

**Method 1: From Users Page**
1. Go to Users Admin page
2. Use the role dropdown in the user table
3. Select new role from dropdown
4. Role is assigned immediately

**Method 2: Via API**
```javascript
PUT /api/admin/users/:userId/role
Body: { role: "manager" }
```

## Security Features

1. **System Role Protection**
   - System roles (Admin, Vendor, Farmer, etc.) cannot be deleted
   - Prevents accidental removal of critical roles

2. **User Assignment Validation**
   - Cannot delete roles with assigned users
   - Prevents orphaned user accounts

3. **Admin-Only Access**
   - All role management endpoints require admin authentication
   - Protected by `protect` and `authorize('admin')` middleware

4. **Audit Logging**
   - All role operations logged to AdminAudit collection
   - Tracks who created/modified/deleted roles

## Permission Categories

### User Management
- view_users, create_users, edit_users, delete_users, suspend_users

### Vendor Management
- view_vendors, approve_vendors, reject_vendors

### Loan Management
- view_loans, approve_loans, reject_loans, manage_loan_schemes

### Marketplace
- view_products, manage_products, manage_orders, view_transactions

### Farm Management
- view_farms, manage_farms, view_farm_analytics

### System
- view_audit_logs, manage_feature_flags, manage_warehouses, manage_roles, system_settings

### Reports
- view_reports, view_ai_reports, export_reports

### Community
- manage_community, moderate_content

## Troubleshooting

### Issue: Roles not appearing in frontend
**Solution:** 
1. Check backend is running
2. Verify seed script ran successfully
3. Check browser console for API errors
4. Verify admin authentication token

### Issue: Cannot create role
**Solution:**
1. Check role name is unique
2. Verify at least one permission is selected
3. Check backend logs for validation errors

### Issue: Cannot delete role
**Solution:**
1. Verify role is not a system role
2. Check if users are assigned to this role
3. Reassign users to different role first

### Issue: Role assignment not working
**Solution:**
1. Verify role exists in database
2. Check user ID is correct
3. Verify admin permissions

## Future Enhancements

Potential improvements for the system:

1. **Permission-Based UI Rendering**
   - Hide/show UI elements based on user permissions
   - Implement permission checks in frontend components

2. **Role Templates**
   - Pre-configured role templates for common use cases
   - Quick role creation from templates

3. **Bulk User Role Assignment**
   - Assign roles to multiple users at once
   - CSV import for role assignments

4. **Permission Groups**
   - Group related permissions for easier management
   - Quick selection of permission groups

5. **Role Hierarchy**
   - Parent-child role relationships
   - Permission inheritance

6. **Activity Dashboard**
   - Track role usage and permission access
   - Analytics on role effectiveness

## Testing

### Manual Testing Checklist

- [ ] Seed permissions and roles successfully
- [ ] View roles list in admin dashboard
- [ ] Create new custom role
- [ ] Edit custom role permissions
- [ ] View role permissions
- [ ] Delete custom role
- [ ] Verify system roles cannot be deleted
- [ ] Assign role to user from Users page
- [ ] Verify role dropdown shows all roles
- [ ] Search roles functionality
- [ ] Pagination works correctly
- [ ] Empty state displays when no roles exist

### API Testing

Use tools like Postman or curl to test endpoints:

```bash
# Get all roles
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/roles

# Create role
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Role","description":"Test","permissions":[]}' \
  http://localhost:5000/api/admin/roles

# Assign role to user
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"manager"}' \
  http://localhost:5000/api/admin/users/USER_ID/role
```

## Support

For issues or questions:
1. Check backend logs: `farmer_ai-backend/combined.log`
2. Check browser console for frontend errors
3. Verify database connection
4. Ensure all dependencies are installed

## Summary

The Roles & Permissions Management System is now fully functional and integrated into the AgriSense Admin Dashboard. Administrators can create custom roles, assign granular permissions, and manage user access levels through an intuitive interface that maintains the existing admin theme and design patterns.
