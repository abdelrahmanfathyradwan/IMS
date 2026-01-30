const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    contractId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract'
    },
    installmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Installment'
    },
    type: {
        type: String,
        enum: ['reminder', 'overdue', 'payment_confirmation', 'general'],
        required: true
    },
    channel: {
        type: String,
        enum: ['email', 'sms', 'whatsapp', 'system'],
        default: 'system'
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'read'],
        default: 'pending'
    },
    sentAt: {
        type: Date
    },
    readAt: {
        type: Date
    }
}, {
    timestamps: true
});

notificationSchema.index({ customerId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
