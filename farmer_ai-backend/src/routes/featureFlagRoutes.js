const express = require('express');
const router = express.Router();
const { checkFeatureFlag } = require('../controllers/featureFlagController');
const { protect } = require('../middleware/auth');

// Public route to check if feature is enabled
// Can be called with or without authentication
router.get('/check/:key', (req, res, next) => {
    // Try to authenticate, but don't require it
    if (req.headers.authorization) {
        return protect(req, res, next);
    }
    next();
}, checkFeatureFlag);

module.exports = router;
