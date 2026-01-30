const express = require('express');
const router = express.Router();
const {
    getSettings,
    updateSettings,
    getSetting,
    resetSettings
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router
    .route('/')
    .get(protect, checkPermission('settings:read'), getSettings)
    .put(protect, checkPermission('settings:update'), updateSettings);

router.post('/reset', protect, checkPermission('settings:update'), resetSettings);
router.get('/:key', protect, checkPermission('settings:read'), getSetting);

module.exports = router;
