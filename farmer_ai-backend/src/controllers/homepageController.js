const HomepageConfig = require('../models/HomepageConfig');

// Get current homepage config (or create default if not exists)
exports.getHomepageConfig = async (req, res) => {
    try {
        let config = await HomepageConfig.findOne();
        if (!config) {
            // Seed default config if none exists
            config = new HomepageConfig({
                hero: {
                    navLinks: [
                        { label: 'Features', path: '#features' },
                        { label: 'Marketplace', path: '#marketplace' },
                        { label: 'AI Advisory', path: '#advisory' }
                    ],
                    ctas: [
                        { label: 'Get Started', path: '/register', type: 'primary' },
                        { label: 'Watch Demo', path: '#demo', type: 'secondary' }
                    ],
                    trustIndicators: [
                        { label: 'Yield Increase', value: '30%' },
                        { label: 'Prediction Accuracy', value: '95%' }
                    ]
                },
                features: {
                    cards: [
                        { icon: 'Activity', title: 'AI Advisory', description: 'Personalized AI consultant for data-driven farming decisions.' },
                        { icon: 'Leaf', title: 'Crop Health', description: 'Monitor crops using satellite imagery and health indicators.' },
                        { icon: 'BarChart2', title: 'Yield Analytics', description: 'Advanced processing for predictive yield insights.' }
                    ]
                },
                performance: {
                    metrics: [
                        { label: 'Active Farmers', value: '5000+', unit: 'Users' }
                    ]
                }
            });
            await config.save();
        }
        res.status(200).json(config);
    } catch (error) {
        console.error('Error fetching homepage config:', error);
        res.status(500).json({ message: 'Server error fetching homepage config' });
    }
};

// Update homepage config
exports.updateHomepageConfig = async (req, res) => {
    try {
        const updates = req.body;
        // Upsert: true creates it if it doesn't exist, though we usually expect it to exist from GET
        // We use findOneAndUpdate to ensure we're updating the single config document
        const config = await HomepageConfig.findOneAndUpdate({}, updates, { new: true, upsert: true });
        res.status(200).json(config);
    } catch (error) {
        console.error('Error updating homepage config:', error);
        res.status(500).json({ message: 'Server error updating homepage config' });
    }
};
