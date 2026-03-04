const express = require('express');
const router = express.Router();
const {
    getAllHelpArticles,
    getHelpArticleBySlug,
    getHelpArticlesByCategory,
    getHelpArticlesByType,
    getFeaturedHelpArticles,
    getPopularHelpArticles,
    getRelatedHelpArticles,
    searchHelpArticles,
    getCategories,
    getTypes,
    createHelpArticle,
    updateHelpArticle,
    deleteHelpArticle,
    markHelpful,
    markNotHelpful,
    togglePublishHelpArticle,
    toggleFeatureHelpArticle
} = require('../controllers/helpCenterController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllHelpArticles);
router.get('/featured', getFeaturedHelpArticles);
router.get('/popular', getPopularHelpArticles);
router.get('/categories/list', getCategories);
router.get('/types/list', getTypes);
router.get('/search', searchHelpArticles);
router.get('/category/:category', getHelpArticlesByCategory);
router.get('/type/:type', getHelpArticlesByType);
router.get('/:slug', getHelpArticleBySlug);
router.get('/:id/related', getRelatedHelpArticles);

// Protected routes (require authentication)
router.post('/:id/helpful', protect, markHelpful);
router.post('/:id/not-helpful', protect, markNotHelpful);

// Admin routes
router.post('/', protect, authorize('admin'), createHelpArticle);
router.put('/:id', protect, authorize('admin'), updateHelpArticle);
router.delete('/:id', protect, authorize('admin'), deleteHelpArticle);
router.patch('/:id/publish', protect, authorize('admin'), togglePublishHelpArticle);
router.patch('/:id/feature', protect, authorize('admin'), toggleFeatureHelpArticle);

module.exports = router;
