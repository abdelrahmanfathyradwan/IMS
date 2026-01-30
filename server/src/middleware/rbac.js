// Role-Based Access Control Middleware

const roles = {
    admin: ['admin', 'manager', 'user'],
    manager: ['manager', 'user'],
    user: ['user']
};

// Check if user has required role
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this route`
            });
        }

        next();
    };
};

// Check for specific permissions
const permissions = {
    // Customer permissions
    'customers:read': ['admin', 'manager', 'user'],
    'customers:create': ['admin', 'manager'],
    'customers:update': ['admin', 'manager'],
    'customers:delete': ['admin'],

    // Contract permissions
    'contracts:read': ['admin', 'manager', 'user'],
    'contracts:create': ['admin', 'manager'],
    'contracts:update': ['admin', 'manager'],
    'contracts:delete': ['admin'],

    // Installment permissions
    'installments:read': ['admin', 'manager', 'user'],
    'installments:update': ['admin', 'manager', 'user'],
    'installments:pay': ['admin', 'manager', 'user'],

    // Reports permissions
    'reports:read': ['admin', 'manager', 'user'],
    'reports:export': ['admin', 'manager'],

    // Settings permissions
    'settings:read': ['admin', 'manager'],
    'settings:update': ['admin'],

    // User management permissions
    'users:read': ['admin'],
    'users:create': ['admin'],
    'users:update': ['admin'],
    'users:delete': ['admin']
};

const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const allowedRoles = permissions[permission] || [];

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Not authorized to perform this action`
            });
        }

        next();
    };
};

module.exports = { authorize, checkPermission, permissions };
