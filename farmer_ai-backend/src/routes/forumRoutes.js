const express = require('express');
const router = express.Router();
const { getQuestions, getQuestion, createQuestion, addAnswer, toggleVote, acceptAnswer, addComment } = require('../controllers/forumController');
const { protect } = require('../middleware/auth');

router.get('/', getQuestions);
router.get('/:id', getQuestion);
router.post('/', protect, createQuestion);

router.post('/:id/answers', protect, addAnswer);
router.put('/answers/:answerId/vote', protect, toggleVote);
router.put('/answers/:answerId/accept', protect, acceptAnswer);
router.post('/answers/:answerId/comments', protect, addComment);

module.exports = router;
