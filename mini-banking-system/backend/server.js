require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const cron = require('node-cron');

// Import routes
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const transactionRoutes = require('./routes/transactions');
const paymentRoutes = require('./routes/payments');
const billRoutes = require('./routes/bills');
const savingsRoutes = require('./routes/savings');
const fdRoutes = require('./routes/fixedDeposits');
const cardRoutes = require('./routes/cards');
const notificationRoutes = require('./routes/notifications');
const securityRoutes = require('./routes/security');

// Import scheduled tasks
const { checkBillReminders, resetDailyLimits, checkFDMaturity } = require('./utils/scheduledTasks');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Mini Banking API'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/savings-goals', savingsRoutes);
app.use('/api/fixed-deposits', fdRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/security', securityRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Scheduled Tasks (Cron Jobs)
// Check bill reminders every day at 9 AM
cron.schedule('0 9 * * *', () => {
    console.log('Running bill reminder check...');
    checkBillReminders();
});

// Reset daily limits every day at midnight
cron.schedule('0 0 * * *', () => {
    console.log('Resetting daily transaction limits...');
    resetDailyLimits();
});

// Check FD maturity every day at 10 AM
cron.schedule('0 10 * * *', () => {
    console.log('Checking FD maturity...');
    checkFDMaturity();
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏦 Mini Banking System API is ready!`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});
