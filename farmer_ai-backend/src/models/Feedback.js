const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['Bug Report', 'Feature Request', 'UI/UX Improvement', 'Performance Issue', 'Other'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    mood: {
        type: String, // 'happy', 'neutral', 'sad', etc. - simplified for now
        default: 'neutral'
    },
    attachments: [{
        type: String // URL to uploaded file
    }],
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Low'
    },
    status: {
        type: String,
        enum: ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'],
        default: 'Submitted'
    },
    adminReplies: [{
        adminName: String,
        message: String,
        date: { type: Date, default: Date.now }
    }],
    // AI Enhanced Fields
    aiAnalysis: {
        sentiment: String, // 'Positive', 'Neutral', 'Negative'
        suggestedPriority: String,
        autoCategory: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
