const HelpArticle = require('../models/HelpArticle');
const AppError = require('../utils/AppError');

/**
 * @desc    Get all help articles (public)
 * @route   GET /api/resources/help
 * @access  Public
 */
exports.getAllHelpArticles = async (req, res, next) => {
    try {
        const {
            type,
            category,
            tags,
            search,
            status = 'published',
            difficulty,
            sort = '-priority',
            page = 1,
            limit = 20
        } = req.query;

        // Build query
        const query = {};
        
        // Only admins can see drafts
        if (req.user?.roles?.includes('admin')) {
            if (status) query.status = status;
        } else {
            query.status = 'published';
        }

        if (type) query.type = type;
        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;
        if (tags) query.tags = { $in: tags.split(',') };
        
        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const [articles, total] = await Promise.all([
            HelpArticle.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .select('title slug type category difficulty content.summary content.question views helpful notHelpful publishedAt isFeatured estimatedTime')
                .populate('author', 'firstName lastName')
                .lean(),
            HelpArticle.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            count: articles.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: articles
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single help article by slug
 * @route   GET /api/resources/help/:slug
 * @access  Public
 */
exports.getHelpArticleBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const article = await HelpArticle.findOne({ slug })
            .populate('author', 'firstName lastName email')
            .populate('lastEditedBy', 'firstName lastName')
            .populate('relatedArticles', 'title slug type category content.summary');

        if (!article) {
            return next(new AppError('Article not found', 404));
        }

        // Only allow viewing drafts if user is admin
        if (article.status !== 'published' && !req.user?.roles?.includes('admin')) {
            return next(new AppError('Article not found', 404));
        }

        // Increment views (don't await to avoid blocking response)
        if (article.status === 'published') {
            article.incrementViews().catch(err => console.error('Error incrementing views:', err));
        }

        res.status(200).json({
            success: true,
            data: article
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get help articles by category
 * @route   GET /api/resources/help/category/:category
 * @access  Public
 */
exports.getHelpArticlesByCategory = async (req, res, next) => {
    try {
        const { category } = req.params;
        const { limit = 20, page = 1, sort = '-priority' } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [articles, total] = await Promise.all([
            HelpArticle.find({ status: 'published', category })
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .select('title slug type category content.summary content.question views helpful notHelpful')
                .populate('author', 'firstName lastName')
                .lean(),
            HelpArticle.countDocuments({ status: 'published', category })
        ]);

        res.status(200).json({
            success: true,
            count: articles.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: articles
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get help articles by type
 * @route   GET /api/resources/help/type/:type
 * @access  Public
 */
exports.getHelpArticlesByType = async (req, res, next) => {
    try {
        const { type } = req.params;
        const { limit = 20, page = 1, sort = '-priority' } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [articles, total] = await Promise.all([
            HelpArticle.find({ status: 'published', type })
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .select('title slug type category content.summary content.question views helpful notHelpful')
                .populate('author', 'firstName lastName')
                .lean(),
            HelpArticle.countDocuments({ status: 'published', type })
        ]);

        res.status(200).json({
            success: true,
            count: articles.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: articles
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get featured help articles
 * @route   GET /api/resources/help/featured
 * @access  Public
 */
exports.getFeaturedHelpArticles = async (req, res, next) => {
    try {
        const { limit = 5 } = req.query;

        const articles = await HelpArticle.getFeatured(parseInt(limit));

        res.status(200).json({
            success: true,
            count: articles.length,
            data: articles
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get popular help articles
 * @route   GET /api/resources/help/popular
 * @access  Public
 */
exports.getPopularHelpArticles = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;

        const articles = await HelpArticle.getPopular(parseInt(limit));

        res.status(200).json({
            success: true,
            count: articles.length,
            data: articles
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get related help articles
 * @route   GET /api/resources/help/:id/related
 * @access  Public
 */
exports.getRelatedHelpArticles = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { limit = 5 } = req.query;

        const article = await HelpArticle.findById(id);
        if (!article) {
            return next(new AppError('Article not found', 404));
        }

        // Find related articles by category and tags
        const related = await HelpArticle.find({
            _id: { $ne: id },
            status: 'published',
            $or: [
                { category: article.category },
                { type: article.type },
                { tags: { $in: article.tags } }
            ]
        })
            .sort({ helpful: -1 })
            .limit(parseInt(limit))
            .select('title slug type category content.summary content.question views helpful')
            .lean();

        res.status(200).json({
            success: true,
            count: related.length,
            data: related
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Search help articles
 * @route   GET /api/resources/help/search
 * @access  Public
 */
exports.searchHelpArticles = async (req, res, next) => {
    try {
        const { q, limit = 20, page = 1 } = req.query;

        if (!q) {
            return next(new AppError('Search query is required', 400));
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [articles, total] = await Promise.all([
            HelpArticle.find(
                { $text: { $search: q }, status: 'published' },
                { score: { $meta: 'textScore' } }
            )
                .sort({ score: { $meta: 'textScore' } })
                .skip(skip)
                .limit(parseInt(limit))
                .select('title slug type category content.summary content.question views helpful')
                .lean(),
            HelpArticle.countDocuments({ $text: { $search: q }, status: 'published' })
        ]);

        res.status(200).json({
            success: true,
            count: articles.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: articles
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all categories with article counts
 * @route   GET /api/resources/help/categories/list
 * @access  Public
 */
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await HelpArticle.aggregate([
            { $match: { status: 'published' } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    articles: {
                        $push: {
                            title: '$title',
                            slug: '$slug',
                            type: '$type'
                        }
                    }
                }
            },
            { $sort: { count: -1 } },
            {
                $project: {
                    category: '$_id',
                    count: 1,
                    sampleArticles: { $slice: ['$articles', 3] },
                    _id: 0
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all types with article counts
 * @route   GET /api/resources/help/types/list
 * @access  Public
 */
exports.getTypes = async (req, res, next) => {
    try {
        const types = await HelpArticle.aggregate([
            { $match: { status: 'published' } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            {
                $project: {
                    type: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: types.length,
            data: types
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create new help article
 * @route   POST /api/resources/help
 * @access  Private/Admin
 */
exports.createHelpArticle = async (req, res, next) => {
    try {
        // Add author
        req.body.author = req.user._id;

        // Create article
        const article = await HelpArticle.create(req.body);

        res.status(201).json({
            success: true,
            data: article
        });
    } catch (error) {
        if (error.code === 11000) {
            return next(new AppError('An article with this slug already exists', 400));
        }
        next(error);
    }
};

/**
 * @desc    Update help article
 * @route   PUT /api/resources/help/:id
 * @access  Private/Admin
 */
exports.updateHelpArticle = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Add last edited by
        req.body.lastEditedBy = req.user._id;

        const article = await HelpArticle.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!article) {
            return next(new AppError('Article not found', 404));
        }

        res.status(200).json({
            success: true,
            data: article
        });
    } catch (error) {
        if (error.code === 11000) {
            return next(new AppError('An article with this slug already exists', 400));
        }
        next(error);
    }
};

/**
 * @desc    Delete help article
 * @route   DELETE /api/resources/help/:id
 * @access  Private/Admin
 */
exports.deleteHelpArticle = async (req, res, next) => {
    try {
        const { id } = req.params;

        const article = await HelpArticle.findByIdAndDelete(id);

        if (!article) {
            return next(new AppError('Article not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Article deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark article as helpful
 * @route   POST /api/resources/help/:id/helpful
 * @access  Private
 */
exports.markHelpful = async (req, res, next) => {
    try {
        const { id } = req.params;

        const article = await HelpArticle.findById(id);

        if (!article) {
            return next(new AppError('Article not found', 404));
        }

        if (article.status !== 'published') {
            return next(new AppError('Cannot rate unpublished article', 400));
        }

        await article.markHelpful(req.user._id);

        res.status(200).json({
            success: true,
            data: {
                helpful: article.helpful,
                notHelpful: article.notHelpful,
                helpfulnessScore: Math.round((article.helpful / (article.helpful + article.notHelpful)) * 100) || 0
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark article as not helpful
 * @route   POST /api/resources/help/:id/not-helpful
 * @access  Private
 */
exports.markNotHelpful = async (req, res, next) => {
    try {
        const { id } = req.params;

        const article = await HelpArticle.findById(id);

        if (!article) {
            return next(new AppError('Article not found', 404));
        }

        if (article.status !== 'published') {
            return next(new AppError('Cannot rate unpublished article', 400));
        }

        await article.markNotHelpful(req.user._id);

        res.status(200).json({
            success: true,
            data: {
                helpful: article.helpful,
                notHelpful: article.notHelpful,
                helpfulnessScore: Math.round((article.helpful / (article.helpful + article.notHelpful)) * 100) || 0
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Toggle publish status
 * @route   PATCH /api/resources/help/:id/publish
 * @access  Private/Admin
 */
exports.togglePublishHelpArticle = async (req, res, next) => {
    try {
        const { id } = req.params;

        const article = await HelpArticle.findById(id);

        if (!article) {
            return next(new AppError('Article not found', 404));
        }

        // Toggle status
        if (article.status === 'published') {
            article.status = 'draft';
            article.publishedAt = null;
        } else {
            article.status = 'published';
            article.publishedAt = new Date();
        }

        article.lastEditedBy = req.user._id;
        await article.save();

        res.status(200).json({
            success: true,
            data: {
                status: article.status,
                publishedAt: article.publishedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Toggle featured status
 * @route   PATCH /api/resources/help/:id/feature
 * @access  Private/Admin
 */
exports.toggleFeatureHelpArticle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { priority } = req.body;

        const article = await HelpArticle.findById(id);

        if (!article) {
            return next(new AppError('Article not found', 404));
        }

        article.isFeatured = !article.isFeatured;
        if (article.isFeatured && priority !== undefined) {
            article.priority = priority;
        }

        await article.save();

        res.status(200).json({
            success: true,
            data: {
                isFeatured: article.isFeatured,
                priority: article.priority
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = exports;
