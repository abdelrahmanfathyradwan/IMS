const express = require('express');
const router = express.Router();
const {
    getNotifications,
    sendNotification,
    sendWhatsApp,
    markAsRead,
    deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router
    .route('/')
    .get(protect, getNotifications);

router.post('/send', protect, sendNotification);
router.post('/whatsapp', protect, sendWhatsApp);

router
    .route('/:id')
    .delete(protect, authorize('admin'), deleteNotification);

router.put('/:id/read', protect, markAsRead);

module.exports = router;
