const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getNotifications, markAsRead, getUnreadCount, deleteNotification } = require('../controllers/notificationController');

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.get('/unread-count', getUnreadCount);
router.delete('/:id', deleteNotification);

module.exports = router;
