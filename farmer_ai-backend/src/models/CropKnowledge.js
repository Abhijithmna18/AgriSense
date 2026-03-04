const mongoose = require('mongoose');

/**
 * CropKnowledge Model
 * 
 * Stores educational content about crops including cultivation practices,
 * pest management, harvest information, and post-harvest handling.
 * 
 * Features:
 * - Rich content structure with multiple sections
 * - Category and tag-based organization
 * - SEO optimization fields
 * - Image gallery support
 * - Related crops linking
 * - View and like tracking
 * - Draft/Published workflow
 */

const CropKnowledgeSchema = new mongoose.Schema({
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
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['Cereals', 'Pulses', 'Vegetables', 'Fruits', 'Spices', 'Cash Crops', 'Oilseeds', 'Fiber Crops'],
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
        // Introduction/Overview
        introduction: {
            type: String,
            required: [true, 'Introduction is required'],
            maxlength: [2000, 'Introduction cannot exceed 2000 characters']
        },

        // Cultivation Requirements
        cultivation: {
            soilRequirements: {
                type: String,
                default: ''
            },
            climate: {
                type: String,
                default: ''
            },
            season: {
                type: String,
                default: ''
            },
            waterRequirements: {
                type: String,
                default: ''
            },
            temperature: {
                min: Number,
                max: Number,
                optimal: Number
            },
            rainfall: {
                min: Number,
                max: Number,
                unit: {
                    type: String,
                    default: 'mm'
                }
            }
        },

        // Farming Practices
        practices: {
            landPreparation: {
                type: String,
                default: ''
            },
            sowing: {
                method: String,
                depth: String,
                spacing: String,
                seedRate: String
            },
            fertilization: {
                basal: String,
                topDressing: String,
                organic: String,
                npkRatio: String
            },
            irrigation: {
                method: String,
                frequency: String,
                criticalStages: [String]
            },
            weedManagement: {
                type: String,
                default: ''
            },
            pestManagement: {
                commonPests: [String],
                diseases: [String],
                management: String
            }
        },

        // Harvest Information
        harvest: {
            duration: {
                type: String,
                default: ''
            },
            maturityIndicators: {
                type: [String],
                default: []
            },
            harvestingMethod: {
                type: String,
                default: ''
            },
            expectedYield: {
                min: Number,
                max: Number,
                unit: {
                    type: String,
                    default: 'kg/ha'
                }
            },
            harvestingTime: {
                type: String,
                default: ''
            }
        },

        // Post-Harvest Handling
        postHarvest: {
            cleaning: {
                type: String,
                default: ''
            },
            drying: {
                type: String,
                default: ''
            },
            storage: {
                conditions: String,
                duration: String,
                packaging: String
            },
            processing: {
                type: String,
                default: ''
            },
            marketing: {
                type: String,
                default: ''
            },
            valueAddition: {
                type: [String],
                default: []
            }
        },

        // Additional Information
        economics: {
            costOfCultivation: String,
            marketPrice: String,
            profitability: String
        },
        nutritionalValue: {
            type: String,
            default: ''
        },
        uses: {
            type: [String],
            default: []
        }
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
        type: {
            type: String,
            enum: ['cover', 'gallery', 'diagram', 'lifecycle', 'pest', 'harvest'],
            default: 'gallery'
        },
        order: {
            type: Number,
            default: 0
        }
    }],

    // Cover image (primary)
    coverImage: {
        type: String,
        default: ''
    },

    // Relationships
    relatedCrops: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CropKnowledge'
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

    // Engagement Metrics
    views: {
        type: Number,
        default: 0,
        min: 0
    },
    likes: {
        type: Number,
        default: 0,
        min: 0
    },
    likedBy: [{
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
        },
        canonicalUrl: String
    },

    // Featured
    isFeatured: {
        type: Boolean,
        default: false,
        index: true
    },
    featuredOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
CropKnowledgeSchema.index({ category: 1, status: 1 });
CropKnowledgeSchema.index({ tags: 1 });
CropKnowledgeSchema.index({ status: 1, publishedAt: -1 });
CropKnowledgeSchema.index({ isFeatured: 1, featuredOrder: 1 });
CropKnowledgeSchema.index({ views: -1 });
CropKnowledgeSchema.index({ likes: -1 });

// Text index for search
CropKnowledgeSchema.index({
    title: 'text',
    'content.introduction': 'text',
    tags: 'text'
});

// Virtual for reading time (approximate)
CropKnowledgeSchema.virtual('readingTime').get(function() {
    const wordsPerMinute = 200;
    const text = this.content.introduction + 
                 JSON.stringify(this.content.cultivation) +
                 JSON.stringify(this.content.practices) +
                 JSON.stringify(this.content.harvest) +
                 JSON.stringify(this.content.postHarvest);
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
});

// Pre-save middleware to generate slug
CropKnowledgeSchema.pre('save', function(next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    
    // Set cover image from first image if not set
    if (!this.coverImage && this.images.length > 0) {
        const coverImg = this.images.find(img => img.type === 'cover');
        this.coverImage = coverImg ? coverImg.url : this.images[0].url;
    }
    
    // Set published date when status changes to published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    
    next();
});

// Static method to get popular crops
CropKnowledgeSchema.statics.getPopular = function(limit = 10) {
    return this.find({ status: 'published' })
        .sort({ views: -1 })
        .limit(limit)
        .select('title slug category coverImage views likes')
        .lean();
};

// Static method to get featured crops
CropKnowledgeSchema.statics.getFeatured = function(limit = 5) {
    return this.find({ status: 'published', isFeatured: true })
        .sort({ featuredOrder: 1 })
        .limit(limit)
        .select('title slug category coverImage content.introduction')
        .lean();
};

// Static method to get by category
CropKnowledgeSchema.statics.getByCategory = function(category, options = {}) {
    const { limit = 20, skip = 0, sort = '-publishedAt' } = options;
    return this.find({ status: 'published', category })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('title slug category coverImage content.introduction views likes publishedAt')
        .lean();
};

// Instance method to increment views
CropKnowledgeSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
};

// Instance method to toggle like
CropKnowledgeSchema.methods.toggleLike = function(userId) {
    const index = this.likedBy.indexOf(userId);
    if (index > -1) {
        this.likedBy.splice(index, 1);
        this.likes = Math.max(0, this.likes - 1);
    } else {
        this.likedBy.push(userId);
        this.likes += 1;
    }
    return this.save();
};

module.exports = mongoose.model('CropKnowledge', CropKnowledgeSchema);
