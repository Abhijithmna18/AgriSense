const express = require('express');
const router = express.Router();
const homepageController = require('../controllers/homepageController');
const { protect, adminOnly } = require('../middleware/auth');

// Public route to get config
router.get('/', homepageController.getHomepageConfig);

// Admin-only route to update config
router.put('/', protect, adminOnly, homepageController.updateHomepageConfig);

module.exports = router;
