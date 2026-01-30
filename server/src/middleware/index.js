const { protect, generateToken } = require('./auth');
const { authorize, checkPermission } = require('./rbac');
const errorHandler = require('./errorHandler');
const { logger, morganMiddleware, appLogger } = require('./logger');

module.exports = {
    protect,
    generateToken,
    authorize,
    checkPermission,
    errorHandler,
    logger,
    morganMiddleware,
    appLogger
};
