const express = require('express');
const router = express.Router();
const { runRecommendation, getRecommendation, getHistory, saveRecommendation } = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes require auth

router.post('/run', runRecommendation);
router.get('/history', getHistory);
router.get('/:id', getRecommendation);
router.post('/:id/save', saveRecommendation);

module.exports = router;
