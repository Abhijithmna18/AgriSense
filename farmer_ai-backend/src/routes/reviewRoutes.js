const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { addReview, getReviews } = require('../controllers/reviewController');

router.post('/', protect, addReview);
router.get('/', protect, getReviews);

module.exports = router;
