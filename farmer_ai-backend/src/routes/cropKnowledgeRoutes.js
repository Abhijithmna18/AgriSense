const express = require('express');
const router = express.Router();
const {
    getAllCropKnowledge,
    getCropKnowledgeBySlug,
    getCropKnowledgeByCategory,
    getFeaturedCropKnowledge,
    getPopularCropKnowledge,
    getRelatedCropKnowledge,
    createCropKnowledge,
    updateCropKnowledge,
    deleteCropKnowledge,
    toggleLikeCropKnowledge,
    getCategories,
    getTags,
    searchCropKnowledge,
    togglePublishCropKnowledge,
    toggleFeatureCropKnowledge
} = require('../controllers/cropKnowledgeController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllCropKnowledge);
router.get('/featured', getFeaturedCropKnowledge);
router.get('/popular', getPopularCropKnowledge);
router.get('/categories/list', getCategories);
router.get('/tags/list', getTags);
router.get('/search', searchCropKnowledge);
router.get('/category/:category', getCropKnowledgeByCategory);
router.get('/:slug', getCropKnowledgeBySlug);
router.get('/:id/related', getRelatedCropKnowledge);

// Protected routes (require authentication)
router.post('/:id/like', protect, toggleLikeCropKnowledge);

// Admin routes
router.post('/', protect, authorize('admin'), createCropKnowledge);
router.put('/:id', protect, authorize('admin'), updateCropKnowledge);
router.delete('/:id', protect, authorize('admin'), deleteCropKnowledge);
router.patch('/:id/publish', protect, authorize('admin'), togglePublishCropKnowledge);
router.patch('/:id/feature', protect, authorize('admin'), toggleFeatureCropKnowledge);

module.exports = router;
