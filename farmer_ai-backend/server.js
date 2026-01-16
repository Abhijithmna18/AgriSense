const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOptions = {
    origin: process.env.CLIENT_URL || '*', // Restrict to CLIENT_URL if present
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '5mb' })); // Body parser with 5mb limit

// DEBUG: Log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/crops', require('./src/routes/cropRoutes'));
app.use('/api/farms', require('./src/routes/farmRoutes'));
app.use('/api/uploads', require('./src/routes/uploadRoutes'));
app.use('/api/recommendations', require('./src/routes/recommendationRoutes'));
app.use('/api/warehouses', require('./src/routes/warehouseRoutes'));
app.use('/api/bookings', require('./src/routes/bookingRoutes'));
app.use('/api/feedback', require('./src/routes/feedbackRoutes'));
app.use('/api/homepage', require('./src/routes/homepageRoutes'));
app.use('/api/marketplace', require('./src/routes/marketplaceRoutes'));
app.use('/api/admin/marketplace', require('./src/routes/adminMarketplaceRoutes')); // New Admin Routes
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/finance', require('./src/routes/financeRoutes'));
app.use('/api/admin/finance', require('./src/routes/adminFinanceRoutes'));


// Make uploads folder static
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Health Check Endpoint
app.get('/healthz', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.status(200).json({
        status: 'OK',
        timestamp: new Date(),
        dbStatus: dbStatus,
        uptime: process.uptime()
    });
});

app.get('/', (req, res) => {
    res.send('Farmer AI Backend is running...');
});

// Error Handler Middleware (must be last)
app.use(errorHandler);

if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

module.exports = app;

const mongoose = require('mongoose'); // Required for health check
