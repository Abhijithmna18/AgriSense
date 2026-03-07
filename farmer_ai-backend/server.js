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
const dashboardRoutes = require('./src/routes/dashboardRoutes'); // Import dashboard routes

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/dashboard', dashboardRoutes); // New Dashboard Routes
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
app.use('/api/finance/minibank', require('./routes/miniBankRoutes')); // Mini Bank Routes
app.use('/api/banking', require('./routes/banking')); // New Banking System Routes
app.use('/api/admin/finance', require('./src/routes/adminFinanceRoutes'));
app.use('/api/crop-intelligence', require('./src/routes/cropIntelligenceRoutes'));
app.use('/api/consultations', require('./src/routes/consultationRoutes'));
app.use('/api/ai', require('./src/routes/plantIdentificationRoutes'));
app.use('/api/negotiations', require('./src/routes/negotiations'));
app.use('/api/reviews', require('./src/routes/reviewRoutes'));
app.use('/api/pest-prediction', require('./src/routes/pestPredictionRoutes'));
app.use('/api/decision-support', require('./src/routes/decisionSupportRoutes'));
app.use('/api/operations', require('./src/routes/operationRoutes'));
app.use('/api/logistics', require('./src/routes/logisticsRoutes'));
app.use('/api/market-prices', require('./src/routes/marketPriceRoutes'));
app.use('/api/weather', require('./src/routes/weatherRoutes'));
app.use('/api/advisory', require('./src/routes/advisoryRoutes'));
app.use('/api/soil-tests', require('./src/routes/soilTestRoutes'));
app.use('/api/fertilizer-calculator', require('./src/routes/fertilizerCalculatorRoutes'));
app.use('/api/ml', require('./src/routes/diseaseRoutes'));
app.use('/api/rl', require('./src/routes/rlRoutes'));
app.use('/api/ai-proxy', require('./src/routes/aiProxyRoutes'));
app.use('/api/sensors', require('./src/routes/iotRoutes')); // Legacy
app.use('/api/iot', require('./src/routes/iotRoutes')); // New Smart Irrigation
app.use('/api/yield', require('./src/routes/yieldPredictionRoutes')); // Crop Yield ML
app.use('/api/insights', require('./src/routes/farmInsightRoutes'));
app.use('/api/vendor-intelligence', require('./src/routes/vendorIntelligenceRoutes'));

// Community & Events Routes
app.use('/api/forum', require('./src/routes/forumRoutes'));
app.use('/api/events', require('./src/routes/eventRoutes'));

// Resources Routes
app.use('/api/resources/crop-knowledge', require('./src/routes/cropKnowledgeRoutes'));
app.use('/api/resources/help', require('./src/routes/helpCenterRoutes'));


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

    // Start background jobs
    const { startWeatherCron } = require('./src/cron/weatherAlertsJob');
    startWeatherCron();

    // Create HTTP server for Socket.io
    const http = require('http');
    const { Server } = require('socket.io');
    const server = http.createServer(app);

    // Configure Socket.io with existing CORS options
    const io = new Server(server, { cors: corsOptions });
    app.set('io', io);

    // Start mock IoT generator
    const { startMockDataGenerator } = require('./src/controllers/iotController');
    startMockDataGenerator(io);

    io.on('connection', (socket) => {
        console.log('Client connected to Socket.io');
        socket.on('disconnect', () => console.log('Client disconnected'));
    });

    server.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

module.exports = app;

const mongoose = require('mongoose'); // Required for health check

// trigger restart

console.log('Forcing nodemon restart...');
