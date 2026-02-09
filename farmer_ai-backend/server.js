const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');
const AppError = require('./src/utils/AppError');

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
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5000',
    'http://localhost:5001',
    process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || !process.env.CLIENT_URL) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
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
app.use('/api/crop-intelligence', require('./src/routes/cropIntelligenceRoutes'));
app.use('/api/consultations', require('./src/routes/consultationRoutes'));
app.use('/api/ai', require('./src/routes/plantIdentificationRoutes'));
app.use('/api/negotiations', require('./src/routes/negotiations'));
app.use('/api/reviews', require('./src/routes/reviewRoutes'));
app.use('/api/pest-prediction', require('./src/routes/pestPredictionRoutes'));
app.use('/api/decision-support', require('./src/routes/decisionSupportRoutes'));
app.use('/api/market-prices', require('./src/routes/marketPriceRoutes'));


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

// Handle unhandled routes
app.all(/(.*)/, (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
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
