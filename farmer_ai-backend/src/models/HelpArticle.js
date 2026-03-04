const mongoose = require('mongoose');

/**
 * HelpArticle Model
 * 
 * Stores help center content including FAQs, guides, tutorials,
 * troubleshooting articles, and documentation.
 * 
 * Features:
 * - Multiple content types (FAQ, guide, tutorial, troubleshooting, documentation)
 * - Category-based organization
 * - Step-by-step instructions support
 * - Related articles linking
 * - Helpfulness voting system
 * - Search optimization
 * - Priority ordering
 */

const HelpArticleSchema = new mongoose.Schema({
    // Basic Information
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Type is required'],
        enum: {
            values: ['faq', 'guide', 'tutorial', 'troubleshooting', 'documentation'],
            message: '{VALUE} is not a valid type'
        },
        index: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: [
                'Getting Started',
                'Account Management',
                'Marketplace',
                'Finance & Payments',
                'Farm Management',
                'Weather & Alerts',
                'Disease Detection',
                'Technical Support',
                'Mobile App',
                'General'
            ],
            message: '{VALUE} is not a valid category'
        },
        index: true
    },
    tags: {
        type: [String],
        default: [],
        validate: {
            validator: function(tags) {
                return tags.length <= 10;
            },
            message: 'Cannot have more than 10 tags'
        }
    },

    // Content Structure
    content: {
        // For FAQs
        question: {
            type: String,
            default: ''
        },
        answer: {
            type: String,
            default: ''
        },

        // For Guides/Tutorials/Documentation
        summary: {
            type: String,
            default: ''
        },
        body: {
            type: String,
            default: ''
        },

        // Step-by-step instructions
        steps: [{
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            image: {
                type: String,
                default: ''
            },
            order: {
                type: Number,
                default: 0
            }
        }],

        // Additional sections
        prerequisites: {
            type: [String],
            default: []
        },
        tips: {
            type: [String],
            default: []
        },
        warnings: {
            type: [String],
            default: []
        },
        commonIssues: [{
            issue: String,
            solution: String
        }]
    },

    // Media
    images: [{
        url: {
            type: String,
            required: true
        },
        caption: {
            type: String,
            default: ''
        },
        order: {
            type: Number,
            default: 0
        }
    }],
    videoUrl: {
        type: String,
        default: ''
    },

    // Relationships
    relatedArticles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HelpArticle'
    }],

    // Authorship
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastEditedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Publishing
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
        index: true
    },
    publishedAt: {
        type: Date
    },

    // Priority & Ordering
    priority: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    isFeatured: {
        type: Boolean,
        default: false,
        index: true
    },

    // Engagement Metrics
    views: {
        type: Number,
        default: 0,
        min: 0
    },
    helpful: {
        type: Number,
        default: 0,
        min: 0
    },
    notHelpful: {
        type: Number,
        default: 0,
        min: 0
    },
    helpfulBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    notHelpfulBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    // SEO & Metadata
    metadata: {
        seoTitle: {
            type: String,
            maxlength: [60, 'SEO title cannot exceed 60 characters']
        },
        seoDescription: {
            type: String,
            maxlength: [160, 'SEO description cannot exceed 160 characters']
        },
        keywords: {
            type: [String],
            default: []
        }
    },

    // Difficulty Level (for tutorials/guides)
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },

    // Estimated time to complete (for tutorials)
    estimatedTime: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
HelpArticleSchema.index({ type: 1, category: 1 });
HelpArticleSchema.index({ status: 1, publishedAt: -1 });
HelpArticleSchema.index({ isFeatured: 1, priority: -1 });
HelpArticleSchema.index({ views: -1 });
HelpArticleSchema.index({ helpful: -1 });
HelpArticleSchema.index({ tags: 1 });

// Text index for search
HelpArticleSchema.index({
    title: 'text',
    'content.question': 'text',
    'content.answer': 'text',
    'content.summary': 'text',
    'content.body': 'text',
    tags: 'text'
});

// Virtual for helpfulness score
HelpArticleSchema.virtual('helpfulnessScore').get(function() {
    const total = this.helpful + this.notHelpful;
    if (total === 0) return 0;
    return Math.round((this.helpful / total) * 100);
});

// Virtual for reading time (approximate)
HelpArticleSchema.virtual('readingTime').get(function() {
    const wordsPerMinute = 200;
    let text = this.content.question + ' ' + 
               this.content.answer + ' ' + 
               this.content.summary + ' ' + 
               this.content.body;
    
    if (this.content.steps) {
        text += this.content.steps.map(s => s.title + ' ' + s.description).join(' ');
    }
    
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
});

// Pre-save middleware to generate slug
HelpArticleSchema.pre('save', function(next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    
    // Set published date when status changes to published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    
    // Sort steps by order
    if (this.content.steps && this.content.steps.length > 0) {
        this.content.steps.sort((a, b) => a.order - b.order);
    }
    
    next();
});

// Static method to get popular articles
HelpArticleSchema.statics.getPopular = function(limit = 10) {
    return this.find({ status: 'published' })
        .sort({ views: -1 })
        .limit(limit)
        .select('title slug type category views helpful notHelpful')
        .lean();
};

// Static method to get featured articles
HelpArticleSchema.statics.getFeatured = function(limit = 5) {
    return this.find({ status: 'published', isFeatured: true })
        .sort({ priority: -1 })
        .limit(limit)
        .select('title slug type category content.summary')
        .lean();
};

// Static method to get by category
HelpArticleSchema.statics.getByCategory = function(category, options = {}) {
    const { limit = 20, skip = 0, sort = '-priority' } = options;
    return this.find({ status: 'published', category })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('title slug type category content.summary views helpful')
        .lean();
};

// Static method to get by type
HelpArticleSchema.statics.getByType = function(type, options = {}) {
    const { limit = 20, skip = 0, sort = '-priority' } = options;
    return this.find({ status: 'published', type })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('title slug type category content.summary views helpful')
        .lean();
};

// Instance method to increment views
HelpArticleSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
};

// Instance method to mark as helpful
HelpArticleSchema.methods.markHelpful = function(userId) {
    // Remove from notHelpful if exists
    const notHelpfulIndex = this.notHelpfulBy.indexOf(userId);
    if (notHelpfulIndex > -1) {
        this.notHelpfulBy.splice(notHelpfulIndex, 1);
        this.notHelpful = Math.max(0, this.notHelpful - 1);
    }

    // Add to helpful if not already there
    if (!this.helpfulBy.includes(userId)) {
        this.helpfulBy.push(userId);
        this.helpful += 1;
    }

    return this.save();
};

// Instance method to mark as not helpful
HelpArticleSchema.methods.markNotHelpful = function(userId) {
    // Remove from helpful if exists
    const helpfulIndex = this.helpfulBy.indexOf(userId);
    if (helpfulIndex > -1) {
        this.helpfulBy.splice(helpfulIndex, 1);
        this.helpful = Math.max(0, this.helpful - 1);
    }

    // Add to notHelpful if not already there
    if (!this.notHelpfulBy.includes(userId)) {
        this.notHelpfulBy.push(userId);
        this.notHelpful += 1;
    }

    return this.save();
};

module.exports = mongoose.model('HelpArticle', HelpArticleSchema);
