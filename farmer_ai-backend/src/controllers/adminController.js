const ForumQuestion = require('../models/Forum');
const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Get Forum Analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
    try {
        const totalQuestions = await ForumQuestion.countDocuments();
        const questions = await ForumQuestion.find().select('answers views category');

        let totalAnswers = 0;
        let totalViews = 0;
        const categoryCounts = {};

        questions.forEach(q => {
            totalAnswers += q.answers.length;
            totalViews += q.views;
            categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
        });

        res.json({
            success: true,
            data: {
                totalQuestions,
                totalAnswers,
                totalViews,
                categoryBreakdown: categoryCounts
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Pin a question
// @route   PUT /api/admin/forum/:id/pin
// @access  Private/Admin
exports.pinQuestion = async (req, res) => {
    try {
        const question = await ForumQuestion.findById(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

        question.isPinned = !question.isPinned; // Toggle
        await question.save();

        res.json({ success: true, isPinned: question.isPinned });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a question (Moderation)
// @route   DELETE /api/admin/forum/:id
// @access  Private/Admin
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await ForumQuestion.findById(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

        await question.deleteOne();
        res.json({ success: true, message: 'Question removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new community event
// @route   POST /api/admin/events
// @access  Private/Admin
exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, location, capacity } = req.body;

        const event = await Event.create({
            title,
            description,
            date,
            location,
            capacity,
            organizer: req.user.id
        });

        res.status(201).json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update an event status
// @route   PUT /api/admin/events/:id/status
// @access  Private/Admin
exports.updateEventStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const event = await Event.findById(req.params.id);

        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        event.status = status;
        await event.save();

        res.json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
