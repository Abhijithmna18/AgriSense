const { body, validationResult } = require('express-validator');

// Validation middleware
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// Registration validation
exports.registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').isMobilePhone().withMessage('Valid phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Login validation
exports.loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Send money validation
exports.sendMoneyValidation = [
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
    body('description').optional().trim()
];

// Bill creation validation
exports.billValidation = [
    body('billType').isIn(['electricity', 'water', 'mobile', 'internet', 'gas', 'insurance', 'loan_emi']).withMessage('Invalid bill type'),
    body('provider').trim().notEmpty().withMessage('Provider is required'),
    body('accountNumber').trim().notEmpty().withMessage('Account number is required'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
    body('dueDate').isISO8601().withMessage('Valid due date is required')
];

// Savings goal validation
exports.savingsGoalValidation = [
    body('name').trim().notEmpty().withMessage('Goal name is required'),
    body('targetAmount').isFloat({ min: 1 }).withMessage('Target amount must be greater than 0'),
    body('targetDate').isISO8601().withMessage('Valid target date is required')
];

// FD creation validation
exports.fdValidation = [
    body('principalAmount').isFloat({ min: 1000 }).withMessage('Minimum FD amount is ₹1000'),
    body('tenure.value').isInt({ min: 1 }).withMessage('Tenure must be at least 1'),
    body('tenure.unit').isIn(['months', 'years']).withMessage('Tenure unit must be months or years')
];
