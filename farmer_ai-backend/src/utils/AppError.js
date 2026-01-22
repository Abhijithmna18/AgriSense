class AppError extends Error {
    constructor(message, statusCode, errorCode = null, isRetryable = false) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.errorCode = errorCode; // Custom error code like 'INSUFFICIENT_STOCK'
        this.isRetryable = isRetryable;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
