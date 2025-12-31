const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// User routes
const upload = require('../middleware/upload');

// User routes
router.post('/', upload.array('attachments', 3), feedbackController.createFeedback);
router.get('/community', feedbackController.getCommunityFeedback); // Public trends
router.get('/user', feedbackController.getFeedbackByUser);

// Admin routes (Should add role check middleware in real app)
router.get('/admin', feedbackController.getAllFeedback);
router.patch('/:id/status', feedbackController.updateFeedbackStatus); // In real app, check if user is admin
router.post('/:id/reply', feedbackController.addAdminReply); // In real app, check if user is admin
router.get('/stats', feedbackController.getFeedbackStats); // In real app, check if user is admin

module.exports = router;
