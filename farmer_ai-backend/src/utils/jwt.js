const jwt = require('jsonwebtoken');

/**
 * Generate JWT access token
 * @param {Object} payload - Data to encode in token
 * @returns {String} JWT token
 */
const generateAccessToken = (payload) => {
    const secret = process.env.JWT_SECRET || 'your_jwt_secret_change_in_production';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - Data to encode in token
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (payload) => {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your_jwt_refresh_secret';
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

    return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @param {Boolean} isRefreshToken - Whether this is a refresh token
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token, isRefreshToken = false) => {
    const secret = isRefreshToken
        ? (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
        : process.env.JWT_SECRET;

    try {
        return jwt.verify(token, secret);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        }
        throw error;
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken
};
