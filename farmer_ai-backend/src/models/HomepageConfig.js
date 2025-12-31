const mongoose = require('mongoose');

const HomepageConfigSchema = new mongoose.Schema({
    hero: {
        brandLogo: { type: String, default: '' },
        navLinks: [
            { label: { type: String }, path: { type: String } }
        ],
        headline: { type: String, default: 'Cultivating a Smarter Future' },
        subheadline: { type: String, default: 'AI-driven agricultural optimization for modern farming.' },
        ctas: [
            { label: { type: String }, path: { type: String }, type: { type: String, enum: ['primary', 'secondary'] } }
        ],
        trustIndicators: [
            { label: { type: String }, value: { type: String } }
        ]
    },
    features: {
        title: { type: String, default: 'Powerful Features for Modern Farming' },
        description: { type: String, default: 'Our platform integrates cutting-edge technology to provide you with actionable insights.' },
        gridColumns: { type: Number, default: 4 },
        cards: [
            {
                icon: { type: String, default: 'Activity' },
                title: { type: String },
                description: { type: String },
                color: { type: String, default: 'bg-blue-50 text-blue-600' },
                active: { type: Boolean, default: true }
            }
        ]
    },
    performance: {
        title: { type: String, default: 'Platform Performance' },
        description: { type: String, default: 'Real-time analytics for precision farming' },
        metrics: [
            {
                label: { type: String, default: 'Plant Health Index' },
                isLive: { type: Boolean, default: false },
                demoValue: { type: String, default: '98%' },
                liveSource: { type: String, default: 'sensor_health_01' },
                progress: { type: Number, default: 98 },
                status: { type: String, enum: ['Optimal', 'Warning', 'Critical'], default: 'Optimal' }
            }
        ],
        chart: {
            title: { type: String, default: 'Crop Yield Projection' },
            isLive: { type: Boolean, default: false },
            liveSource: { type: String, default: 'api/yields' },
            manualData: {
                type: [
                    {
                        month: { type: String },
                        projected: { type: Number },
                        actual: { type: Number }
                    }
                ],
                default: [
                    { month: 'Jan', projected: 65, actual: 60 },
                    { month: 'Feb', projected: 70, actual: 68 },
                    { month: 'Mar', projected: 75, actual: 74 },
                    { month: 'Apr', projected: 80, actual: 82 },
                    { month: 'May', projected: 85, actual: 84 },
                    { month: 'Jun', projected: 90, actual: 88 }
                ]
            },
            legendLabels: {
                projected: { type: String, default: 'Projected Yield' },
                actual: { type: String, default: 'Actual Yield' }
            }
        },
        systemStatus: {
            showLiveFeed: { type: Boolean, default: true },
            showServerLoad: { type: Boolean, default: true },
            showDbStatus: { type: Boolean, default: true }
        }
    },
    marketplace: {
        title: { type: String, default: 'Shop Our Best-Sellers' },
        subtitle: { type: String, default: 'Premium agricultural products and solutions' },
        viewAllLink: { type: String, default: '/marketplace' },
        carousel: {
            autoPlay: { type: Boolean, default: true },
            slideDuration: { type: Number, default: 3, min: 2 },
            navigationStyle: { type: String, enum: ['dots', 'arrows', 'none'], default: 'dots' },
            itemsPerView: {
                desktop: { type: Number, default: 4, min: 2, max: 4 },
                tablet: { type: Number, default: 2, min: 1, max: 3 },
                mobile: { type: Number, default: 1, min: 1, max: 2 }
            }
        },
        featuredProducts: [
            {
                productId: { type: String },
                productName: { type: String },
                productPrice: { type: Number },
                showOnHome: { type: Boolean, default: true },
                order: { type: Number, default: 0 },
                carouselImage: { type: String, default: '' },
                badge: { type: String, enum: ['none', 'new', 'bestseller', 'sale'], default: 'none' },
                quickAction: { type: String, enum: ['addToCart', 'viewDetails'], default: 'viewDetails' }
            }
        ]
    },
    footer: {
        branding: {
            logo: { type: String, default: '' },
            companyName: { type: String, default: 'AgriSense' },
            mission: { type: String, default: 'Empowering farmers with artificial intelligence for a sustainable and productive future.', maxlength: 200 }
        },
        socialMedia: [
            {
                platform: { type: String, enum: ['twitter', 'facebook', 'instagram', 'linkedin', 'youtube'], default: 'twitter' },
                url: { type: String }
            }
        ],
        navigationColumns: [
            {
                title: { type: String },
                order: { type: Number, default: 0 },
                links: [
                    {
                        label: { type: String },
                        url: { type: String }
                    }
                ]
            }
        ],
        newsletter: {
            heading: { type: String, default: 'Stay Updated' },
            subtext: { type: String, default: 'Subscribe to our newsletter for the latest agricultural trends.' },
            placeholder: { type: String, default: 'Enter your email' },
            submissionDestination: { type: String, enum: ['local', 'email', 'mailchimp'], default: 'local' }
        },
        legal: {
            copyright: { type: String, default: '© {year} AgriSense. All rights reserved.' },
            privacyPolicyUrl: { type: String, default: '/privacy' },
            termsOfServiceUrl: { type: String, default: '/terms' },
            showRegionSelector: { type: Boolean, default: false }
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('HomepageConfig', HomepageConfigSchema);
