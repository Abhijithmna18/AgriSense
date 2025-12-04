/**
 * Calculate password strength score (0-5)
 * @param {string} password 
 * @returns {Object} { score, level }
 */
export const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, level: 'weak' };

    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    // Cap at 5
    if (strength > 5) strength = 5;

    let level = 'weak';
    if (strength >= 5) level = 'strong';
    else if (strength >= 3) level = 'medium';

    return {
        score: strength,
        level
    };
};

/**
 * Validate password against rules
 * @param {string} password 
 * @returns {Object} { isValid, errors }
 */
export const validatePassword = (password) => {
    const errors = [];

    if (!password) {
        return { isValid: false, errors: ['Password is required'] };
    }

    if (password.length < 8) {
        errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('One uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('One number');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        errors.push('One special character');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
