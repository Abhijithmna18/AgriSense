const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// Validation middleware
const validateRegister = [
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateLogin = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/me', protect, getMe);

module.exports = router;
