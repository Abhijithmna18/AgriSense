const express = require('express');
const router = express.Router();
const { runRecommendation, getRecommendation, getHistory, saveRecommendation, generateFarmRecommendations } = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes require auth

router.post('/run', runRecommendation);
router.get('/history', getHistory);
router.get('/farms/:farmId/ai-recommendations', generateFarmRecommendations);
router.get('/:id', getRecommendation);
router.post('/:id/save', saveRecommendation);

module.exports = router;
