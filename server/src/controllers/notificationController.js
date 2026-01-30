const Notification = require('../models/Notification');
const { sendWhatsAppMessage, sendEmailNotification } = require('../services/whatsappService');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        const { customerId, type, status, page = 1, limit = 20 } = req.query;

        let query = {};

        if (customerId) query.customerId = customerId;
        if (type) query.type = type;
        if (status) query.status = status;

        const total = await Notification.countDocuments(query);
        const notifications = await Notification.find(query)
            .populate('customerId', 'name phone email')
            .populate('contractId', 'contractNumber')
            .populate('installmentId', 'installmentNumber amount dueDate')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: notifications.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send notification
// @route   POST /api/notifications/send
// @access  Private
exports.sendNotification = async (req, res, next) => {
    try {
        const { customerId, contractId, installmentId, type, channel, message } = req.body;

        const notification = await Notification.create({
            customerId,
            contractId,
            installmentId,
            type,
            channel,
            message,
            status: 'pending'
        });

        // Simulate sending based on channel
        let sendResult = { success: true };

        if (channel === 'whatsapp') {
            sendResult = await sendWhatsAppMessage(customerId, message);
        } else if (channel === 'email') {
            sendResult = await sendEmailNotification(customerId, message);
        }

        notification.status = sendResult.success ? 'sent' : 'failed';
        notification.sentAt = new Date();
        await notification.save();

        const populatedNotification = await Notification.findById(notification._id)
            .populate('customerId', 'name phone email');

        res.status(201).json({
            success: true,
            data: populatedNotification
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send WhatsApp notification
// @route   POST /api/notifications/whatsapp
// @access  Private
exports.sendWhatsApp = async (req, res, next) => {
    try {
        const { customerId, contractId, installmentId, message } = req.body;

        const result = await sendWhatsAppMessage(customerId, message);

        const notification = await Notification.create({
            customerId,
            contractId,
            installmentId,
            type: 'reminder',
            channel: 'whatsapp',
            message,
            status: result.success ? 'sent' : 'failed',
            sentAt: new Date()
        });

        const populatedNotification = await Notification.findById(notification._id)
            .populate('customerId', 'name phone email');

        res.status(201).json({
            success: true,
            data: populatedNotification,
            whatsappResult: result
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { status: 'read', readAt: new Date() },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
exports.deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
