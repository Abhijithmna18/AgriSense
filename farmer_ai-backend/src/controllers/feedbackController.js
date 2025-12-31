const Feedback = require('../models/Feedback');

// Mock AI Logic (Placeholder for actual AI service)
const analyzeFeedback = (text, rating) => {
    let sentiment = 'Neutral';
    if (rating >= 4) sentiment = 'Positive';
    if (rating <= 2) sentiment = 'Negative';

    // Simple keyword based priority suggestion
    let priority = 'Low';
    const lowerText = text.toLowerCase();
    if (lowerText.includes('crash') || lowerText.includes('urgent') || lowerText.includes('broken')) {
        priority = 'High';
    } else if (lowerText.includes('slow') || lowerText.includes('error')) {
        priority = 'Medium';
    }

    return {
        sentiment,
        suggestedPriority: priority,
        autoCategory: 'General' // Placeholder
    };
};

exports.createFeedback = async (req, res) => {
    try {
        const { category, description, rating, mood, priority } = req.body;

        // Handle file uploads
        let attachments = [];
        if (req.files && req.files.length > 0) {
            attachments = req.files.map(file => `/${file.path.replace(/\\/g, '/')}`);
        }

        // AI Analysis (Simulated)
        const aiAnalysis = analyzeFeedback(description, Number(rating));

        const newFeedback = new Feedback({
            user: req.user.id,
            category,
            description,
            rating: Number(rating),
            mood,
            attachments,
            priority: priority || aiAnalysis.suggestedPriority,
            aiAnalysis
        });

        const savedFeedback = await newFeedback.save();
        res.status(201).json(savedFeedback);
    } catch (error) {
        console.error('Error creating feedback:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCommunityFeedback = async (req, res) => {
    try {
        // Get public feedback (anonymized or just stats/trends)
        // For now, return recent 5 star ratings or specific categories
        const trends = await Feedback.find({ rating: { $gte: 4 } })
            .select('category rating mood aiAnalysis createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json(trends);
    } catch (error) {
        console.error('Error fetching community trends:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getFeedbackByUser = async (req, res) => {
    try {
        const feedback = await Feedback.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(feedback);
    } catch (error) {
        console.error('Error fetching user feedback:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.json(feedback);
    } catch (error) {
        console.error('Error fetching all feedback:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const mongoose = require('mongoose');
// ... existing imports

exports.updateFeedbackStatus = async (req, res) => {
    try {
        const { status, priority } = req.body;

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        if (status) feedback.status = status;
        if (priority) feedback.priority = priority;

        const updatedFeedback = await feedback.save();
        res.json(updatedFeedback);
    } catch (error) {
        console.error('Error updating feedback:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addAdminReply = async (req, res) => {
    try {
        const { message } = req.body;
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        feedback.adminReplies.push({
            adminName: req.user.name || 'Admin', // Assuming req.user has name
            message
        });

        const updatedFeedback = await feedback.save();
        res.json(updatedFeedback);
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getFeedbackStats = async (req, res) => {
    try {
        const total = await Feedback.countDocuments();

        const byCategory = await Feedback.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const avgRating = await Feedback.aggregate([
            { $group: { _id: null, avg: { $avg: "$rating" } } }
        ]);

        res.json({
            total,
            byCategory,
            averageRating: avgRating[0] ? avgRating[0].avg : 0
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
