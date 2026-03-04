const CropKnowledge = require('../models/CropKnowledge');
const AppError = require('../utils/AppError');

/**
 * @desc    Get all crop knowledge articles (public)
 * @route   GET /api/resources/crop-knowledge
 * @access  Public
 */
exports.getAllCropKnowledge = async (req, res, next) => {
    try {
        const {
            category,
            tags,
            search,
            status = 'published',
            sort = '-publishedAt',
            page = 1,
            limit = 20,
            featured
        } = req.query;

        // Build query
        const query = {};
        
        // Only admins can see drafts
        if (req.user?.roles?.includes('admin')) {
            if (status) query.status = status;
        } else {
            query.status = 'published';
        }

        if (category) query.category = category;
        if (tags) query.tags = { $in: tags.split(',') };
        if (featured !== undefined) query.isFeatured = featured === 'true';
        
        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const [articles, total] = await Promise.all([
            CropKnowledge.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .select('title slug category tags coverImage content.introduction views likes publishedAt isFeatured')
                .populate('author', 'firstName lastName')
                .lean(),
            CropKnowledge.countDocuments(query)
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
 * @desc    Get single crop knowledge article by slug
 * @route   GET /api/resources/crop-knowledge/:slug
 * @access  Public
 */
exports.getCropKnowledgeBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const article = await CropKnowledge.findOne({ slug })
            .populate('author', 'firstName lastName email')
            .populate('lastEditedBy', 'firstName lastName')
            .populate('relatedCrops', 'title slug category coverImage');

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
 * @desc    Get crop knowledge by category
 * @route   GET /api/resources/crop-knowledge/category/:category
 * @access  Public
 */
exports.getCropKnowledgeByCategory = async (req, res, next) => {
    try {
        const { category } = req.params;
        const { limit = 20, page = 1, sort = '-publishedAt' } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [articles, total] = await Promise.all([
            CropKnowledge.find({ status: 'published', category })
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .select('title slug category coverImage content.introduction views likes publishedAt')
                .populate('author', 'firstName lastName')
                .lean(),
            CropKnowledge.countDocuments({ status: 'published', category })
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
 * @desc    Get featured crop knowledge articles
 * @route   GET /api/resources/crop-knowledge/featured
 * @access  Public
 */
exports.getFeaturedCropKnowledge = async (req, res, next) => {
    try {
        const { limit = 5 } = req.query;

        const articles = await CropKnowledge.getFeatured(parseInt(limit));

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
 * @desc    Get popular crop knowledge articles
 * @route   GET /api/resources/crop-knowledge/popular
 * @access  Public
 */
exports.getPopularCropKnowledge = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;

        const articles = await CropKnowledge.getPopular(parseInt(limit));

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
 * @desc    Get related crop knowledge articles
 * @route   GET /api/resources/crop-knowledge/:id/related
 * @access  Public
 */
exports.getRelatedCropKnowledge = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { limit = 5 } = req.query;

        const article = await CropKnowledge.findById(id);
        if (!article) {
            return next(new AppError('Article not found', 404));
        }

        // Find related articles by category and tags
        const related = await CropKnowledge.find({
            _id: { $ne: id },
            status: 'published',
            $or: [
                { category: article.category },
                { tags: { $in: article.tags } }
            ]
        })
            .sort({ views: -1 })
            .limit(parseInt(limit))
            .select('title slug category coverImage content.introduction views likes')
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
 * @desc    Create new crop knowledge article
 * @route   POST /api/resources/crop-knowledge
 * @access  Private/Admin
 */
exports.createCropKnowledge = async (req, res, next) => {
    try {
        // Add author
        req.body.author = req.user._id;

        // Create article
        const article = await CropKnowledge.create(req.body);

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
 * @desc    Update crop knowledge article
 * @route   PUT /api/resources/crop-knowledge/:id
 * @access  Private/Admin
 */
exports.updateCropKnowledge = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Add last edited by
        req.body.lastEditedBy = req.user._id;

        const article = await CropKnowledge.findByIdAndUpdate(
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
 * @desc    Delete crop knowledge article
 * @route   DELETE /api/resources/crop-knowledge/:id
 * @access  Private/Admin
 */
exports.deleteCropKnowledge = async (req, res, next) => {
    try {
        const { id } = req.params;

        const article = await CropKnowledge.findByIdAndDelete(id);

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
 * @desc    Toggle like on crop knowledge article
 * @route   POST /api/resources/crop-knowledge/:id/like
 * @access  Private
 */
exports.toggleLikeCropKnowledge = async (req, res, next) => {
    try {
        const { id } = req.params;

        const article = await CropKnowledge.findById(id);

        if (!article) {
            return next(new AppError('Article not found', 404));
        }

        if (article.status !== 'published') {
            return next(new AppError('Cannot like unpublished article', 400));
        }

        await article.toggleLike(req.user._id);

        res.status(200).json({
            success: true,
            data: {
                likes: article.likes,
                isLiked: article.likedBy.includes(req.user._id)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all categories with article counts
 * @route   GET /api/resources/crop-knowledge/categories/list
 * @access  Public
 */
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await CropKnowledge.aggregate([
            { $match: { status: 'published' } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    articles: {
                        $push: {
                            title: '$title',
                            slug: '$slug',
                            coverImage: '$coverImage'
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
 * @desc    Get all tags with usage counts
 * @route   GET /api/resources/crop-knowledge/tags/list
 * @access  Public
 */
exports.getTags = async (req, res, next) => {
    try {
        const tags = await CropKnowledge.aggregate([
            { $match: { status: 'published' } },
            { $unwind: '$tags' },
            {
                $group: {
                    _id: '$tags',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 50 },
            {
                $project: {
                    tag: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: tags.length,
            data: tags
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Search crop knowledge articles
 * @route   GET /api/resources/crop-knowledge/search
 * @access  Public
 */
exports.searchCropKnowledge = async (req, res, next) => {
    try {
        const { q, limit = 20, page = 1 } = req.query;

        if (!q) {
            return next(new AppError('Search query is required', 400));
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [articles, total] = await Promise.all([
            CropKnowledge.find(
                { $text: { $search: q }, status: 'published' },
                { score: { $meta: 'textScore' } }
            )
                .sort({ score: { $meta: 'textScore' } })
                .skip(skip)
                .limit(parseInt(limit))
                .select('title slug category coverImage content.introduction views likes')
                .lean(),
            CropKnowledge.countDocuments({ $text: { $search: q }, status: 'published' })
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
 * @desc    Publish/unpublish crop knowledge article
 * @route   PATCH /api/resources/crop-knowledge/:id/publish
 * @access  Private/Admin
 */
exports.togglePublishCropKnowledge = async (req, res, next) => {
    try {
        const { id } = req.params;

        const article = await CropKnowledge.findById(id);

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
 * @route   PATCH /api/resources/crop-knowledge/:id/feature
 * @access  Private/Admin
 */
exports.toggleFeatureCropKnowledge = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { order } = req.body;

        const article = await CropKnowledge.findById(id);

        if (!article) {
            return next(new AppError('Article not found', 404));
        }

        article.isFeatured = !article.isFeatured;
        if (article.isFeatured && order !== undefined) {
            article.featuredOrder = order;
        }

        await article.save();

        res.status(200).json({
            success: true,
            data: {
                isFeatured: article.isFeatured,
                featuredOrder: article.featuredOrder
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = exports;
