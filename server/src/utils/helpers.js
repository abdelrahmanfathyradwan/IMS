/**
 * Utility helper functions
 */

// Format currency
const formatCurrency = (amount, symbol = '$') => {
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
};

// Format date
const formatDate = (date, format = 'YYYY-MM-DD') => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    switch (format) {
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        case 'DD/MM/YYYY':
            return `${day}/${month}/${year}`;
        case 'MM/DD/YYYY':
            return `${month}/${day}/${year}`;
        default:
            return d.toLocaleDateString();
    }
};

// Calculate days between dates
const daysBetween = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Check if date is past
const isPastDate = (date) => {
    return new Date(date) < new Date();
};

// Generate random string
const generateRandomString = (length = 10) => {
    return Math.random().toString(36).substring(2, 2 + length);
};

// Pagination helper
const paginate = (page = 1, limit = 10) => {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    return { skip, limit: parseInt(limit) };
};

// Async wrapper for route handlers
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = {
    formatCurrency,
    formatDate,
    daysBetween,
    isPastDate,
    generateRandomString,
    paginate,
    asyncHandler
};
