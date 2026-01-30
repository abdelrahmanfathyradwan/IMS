const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const { morganMiddleware } = require('./middleware/logger');

// Route files
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const contractRoutes = require('./routes/contractRoutes');
const installmentRoutes = require('./routes/installmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const exportRoutes = require('./routes/exportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://installment-management-system.netlify.app'
    ],
    credentials: true
}));

// Logging middleware
if (config.nodeEnv === 'development') {
    app.use(morganMiddleware);
}

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/installments', installmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/settings', settingsRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'IMS API is running. Access endpoints via /api',
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'IMS API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handler
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = config.port || 5000;

// Only start server if run directly (local dev), not when imported (Vercel)
if (require.main === module) {
    const server = app.listen(PORT, () => {
        console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
        console.error(`Error: ${err.message}`);
        // Close server & exit process
        server.close(() => process.exit(1));
    });
}

module.exports = app;
