const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Custom logger middleware
const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
};

// Morgan setup for HTTP logging
const morganMiddleware = morgan('combined', {
    skip: (req, res) => res.statusCode < 400,
    stream: {
        write: (message) => console.log(message.trim())
    }
});

// Application logger
const appLogger = {
    info: (message, data = {}) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
    },
    error: (message, error = {}) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
    },
    warn: (message, data = {}) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
    },
    debug: (message, data = {}) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data);
        }
    }
};

module.exports = { logger, morganMiddleware, appLogger };
