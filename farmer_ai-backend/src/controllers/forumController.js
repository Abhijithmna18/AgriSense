const ForumQuestion = require('../models/Forum');

// @desc    Get all active questions (with optional search and category filters)
// @route   GET /api/forum
exports.getQuestions = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};

        if (category && category !== 'All') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'tags': { $regex: search, $options: 'i' } }
            ];
        }

        const questions = await ForumQuestion.find(query)
            .populate('author', 'name role')
            .sort({ isPinned: -1, createdAt: -1 }); // Pinned posts on top

        res.json({ success: true, count: questions.length, data: questions });
    } catch (error) {
        console.error('getQuestions Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get single question with answers
// @route   GET /api/forum/:id
exports.getQuestion = async (req, res) => {
    try {
        const question = await ForumQuestion.findById(req.params.id)
            .populate('author', 'name role badge avatar')
            .populate('answers.author', 'name role badge avatar')
            .populate('answers.comments.author', 'name role avatar');

        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        // Increment view count
        question.views += 1;
        await question.save();

        res.json({ success: true, data: question });
    } catch (error) {
        console.error('getQuestion Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create a new question
// @route   POST /api/forum
exports.createQuestion = async (req, res) => {
    try {
        const { title, body, category, tags } = req.body;

        const question = await ForumQuestion.create({
            title,
            body,
            category,
            tags: tags || [],
            author: req.user.id
        });

        const populatedQ = await ForumQuestion.findById(question._id).populate('author', 'name role');

        res.status(201).json({ success: true, data: populatedQ });
    } catch (error) {
        console.error('createQuestion Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Add an answer to a question
// @route   POST /api/forum/:id/answers
exports.addAnswer = async (req, res) => {
    try {
        const question = await ForumQuestion.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const newAnswer = {
            body: req.body.body,
            author: req.user.id
        };

        question.answers.push(newAnswer);
        await question.save();

        // Optional: Trigger a notification to the question author here

        const updatedQ = await ForumQuestion.findById(req.params.id)
            .populate('answers.author', 'name role badge');

        res.status(201).json({ success: true, data: updatedQ.answers[updatedQ.answers.length - 1] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Upvote/Downvote an answer
// @route   PUT /api/forum/answers/:answerId/vote
exports.toggleVote = async (req, res) => {
    try {
        // Find the question containing this answer id
        const question = await ForumQuestion.findOne({ 'answers._id': req.params.answerId });

        if (!question) return res.status(404).json({ success: false, message: 'Answer not found' });

        const answer = question.answers.id(req.params.answerId);

        // Check if user already voted
        const voteIndex = answer.upvotes.findIndex(id => id.toString() === req.user.id);

        if (voteIndex === -1) {
            // Add vote
            answer.upvotes.push(req.user.id);
        } else {
            // Remove vote
            answer.upvotes.splice(voteIndex, 1);
        }

        await question.save();
        res.json({ success: true, upvotes: answer.upvotes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Mark an answer as "Best Answer"
// @route   PUT /api/forum/answers/:answerId/accept
exports.acceptAnswer = async (req, res) => {
    try {
        const question = await ForumQuestion.findOne({ 'answers._id': req.params.answerId });

        if (!question) return res.status(404).json({ success: false, message: 'Not found' });

        // Ensure only the author of the QUESTION can accept an answer
        if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Reset any existing best answer
        question.answers.forEach(ans => ans.isBestAnswer = false);

        // Mark the selected one
        const answer = question.answers.id(req.params.answerId);
        answer.isBestAnswer = true;

        await question.save();
        res.json({ success: true, answers: question.answers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Add comment to answer
// @route   POST /api/forum/answers/:answerId/comments
exports.addComment = async (req, res) => {
    try {
        const question = await ForumQuestion.findOne({ 'answers._id': req.params.answerId });
        if (!question) return res.status(404).json({ success: false, message: 'Answer not found' });

        const answer = question.answers.id(req.params.answerId);

        answer.comments.push({
            body: req.body.body,
            author: req.user.id
        });

        await question.save();
        const updatedQ = await ForumQuestion.findById(question._id).populate('answers.comments.author', 'name');
        const updatedAnswer = updatedQ.answers.id(req.params.answerId);

        res.status(201).json({ success: true, comments: updatedAnswer.comments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
