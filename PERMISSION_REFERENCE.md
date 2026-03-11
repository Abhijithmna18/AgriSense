# Permission Reference Guide

## Complete Permission List

### User Management Module
| Permission | Name | Description |
|------------|------|-------------|
| view_users | View Users | View user list and details |
| create_users | Create Users | Create new users |
| edit_users | Edit Users | Edit user information |
| delete_users | Delete Users | Delete users |
| suspend_users | Suspend Users | Suspend/activate users |

### Vendor Management Module
| Permission | Name | Description |
|------------|------|-------------|
| view_vendors | View Vendors | View vendor applications |
| approve_vendors | Approve Vendors | Approve vendor applications |
| reject_vendors | Reject Vendors | Reject vendor applications |

### Loan Management Module
| Permission | Name | Description |
|------------|------|-------------|
| view_loans | View Loans | View loan applications |
| approve_loans | Approve Loans | Approve loan applications |
| reject_loans | Reject Loans | Reject loan applications |
| manage_loan_schemes | Manage Loan Schemes | Manage loan schemes |

### Marketplace Module
| Permission | Name | Description |
|------------|------|-------------|
| view_products | View Products | View marketplace products |
| manage_products | Manage Products | Add, edit, delete products |
| manage_orders | Manage Orders | Manage marketplace orders |
| view_transactions | View Transactions | View transaction history |

### Farm Management Module
| Permission | Name | Description |
|------------|------|-------------|
| view_farms | View Farms | View farm information |
| manage_farms | Manage Farms | Add, edit, delete farms |
| view_farm_analytics | View Farm Analytics | View farm analytics and insights |

### System Module
| Permission | Name | Description |
|------------|------|-------------|
| view_audit_logs | View Audit Logs | View system audit logs |
| manage_feature_flags | Manage Feature Flags | Manage feature flags |
| manage_warehouses | Manage Warehouses | Manage warehouse system |
| manage_roles | Manage Roles | Manage roles and permissions |
| system_settings | System Settings | Access system settings |

### Reports Module
| Permission | Name | Description |
|------------|------|-------------|
| view_reports | View Reports | View system reports |
| view_ai_reports | View AI Reports | View AI-generated reports |
| export_reports | Export Reports | Export reports |

### Community Module
| Permission | Name | Description |
|------------|------|-------------|
| manage_community | Manage Community | Manage community events and forums |
| moderate_content | Moderate Content | Moderate user-generated content |

## Default Role Configurations

### Admin Role
**Permissions:** ALL (30 permissions)
- Full system access
- Cannot be deleted (system role)

### Vendor Role
**Permissions:**
- view_products
- manage_products
- manage_orders
- view_transactions

### Farmer Role
**Permissions:**
- view_farms
- manage_farms
- view_farm_analytics
- view_products

### Loan Officer Role
**Permissions:**
- view_loans
- approve_loans
- reject_loans
- view_users

### Manager Role
**Permissions:**
- view_reports
- view_ai_reports
- export_reports
- view_users
- view_farms
- view_vendors

## Using Permission Middleware

### Example 1: Single Permission Check
```javascript
const { checkPermission } = require('../middleware/checkPermission');

router.get('/users', 
    protect, 
    checkPermission('view_users'), 
    getUsersHandler
);
```

### Example 2: Multiple Permissions (Any)
```javascript
const { checkAnyPermission } = require('../middleware/checkPermission');

router.put('/users/:id', 
    protect, 
    checkAnyPermission(['edit_users', 'manage_users']), 
    updateUserHandler
);
```

### Example 3: Multiple Permissions (All Required)
```javascript
const { checkAllPermissions } = require('../middleware/checkPermission');

router.delete('/users/:id', 
    protect, 
    checkAllPermissions(['delete_users', 'view_audit_logs']), 
    deleteUserHandler
);
```

### Example 4: Get User Permissions in Controller
```javascript
const { getUserPermissions } = require('../middleware/checkPermission');

const myController = async (req, res) => {
    const permissions = await getUserPermissions(req.user._id);
    
    if (permissions.includes('view_reports')) {
        // User can view reports
    }
};
```
