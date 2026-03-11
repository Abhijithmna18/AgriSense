const express = require('express');
const router = express.Router();
const {
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
    getPermissions,
    getRolePermissions,
    assignRoleToUser
} = require('../controllers/roleController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Role routes
router.route('/')
    .get(getRoles)
    .post(createRole);

router.route('/:id')
    .get(getRole)
    .put(updateRole)
    .delete(deleteRole);

router.get('/:id/permissions', getRolePermissions);

// Permission routes
router.get('/permissions/all', getPermissions);

// User role assignment
router.put('/users/:userId/role', assignRoleToUser);

module.exports = router;
