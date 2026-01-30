const Notification = require('../models/Notification');
const Customer = require('../models/Customer');

/**
 * Send payment confirmation notification
 * @param {Object} installment - The paid installment
 */
const sendPaymentNotification = async (installment) => {
    try {
        const populatedInstallment = await installment.populate({
            path: 'contractId',
            populate: { path: 'customerId' }
        });

        const customer = populatedInstallment.contractId?.customerId;
        if (!customer) return null;

        const message = `Payment received for installment #${installment.installmentNumber}. Amount: $${installment.paidAmount || installment.amount}. Thank you!`;

        const notification = await Notification.create({
            customerId: customer._id,
            contractId: installment.contractId._id,
            installmentId: installment._id,
            type: 'payment_confirmation',
            channel: 'system',
            message,
            status: 'sent',
            sentAt: new Date()
        });

        return notification;
    } catch (error) {
        console.error('Error sending payment notification:', error);
        return null;
    }
};

/**
 * Send reminder notification
 * @param {Object} installment - The upcoming installment
 * @param {Number} daysBefore - Days before due date
 */
const sendReminderNotification = async (installment, daysBefore = 7) => {
    try {
        const populatedInstallment = await installment.populate({
            path: 'contractId',
            populate: { path: 'customerId' }
        });

        const customer = populatedInstallment.contractId?.customerId;
        if (!customer) return null;

        const dueDate = new Date(installment.dueDate).toLocaleDateString();
        const message = `Reminder: Installment #${installment.installmentNumber} of $${installment.amount} is due on ${dueDate}. Please ensure timely payment.`;

        const notification = await Notification.create({
            customerId: customer._id,
            contractId: installment.contractId._id,
            installmentId: installment._id,
            type: 'reminder',
            channel: 'system',
            message,
            status: 'sent',
            sentAt: new Date()
        });

        return notification;
    } catch (error) {
        console.error('Error sending reminder notification:', error);
        return null;
    }
};

/**
 * Send overdue notification
 * @param {Object} installment - The overdue installment
 */
const sendOverdueNotification = async (installment) => {
    try {
        const populatedInstallment = await installment.populate({
            path: 'contractId',
            populate: { path: 'customerId' }
        });

        const customer = populatedInstallment.contractId?.customerId;
        if (!customer) return null;

        const daysOverdue = Math.floor((new Date() - new Date(installment.dueDate)) / (1000 * 60 * 60 * 24));
        const message = `OVERDUE: Installment #${installment.installmentNumber} of $${installment.amount} is ${daysOverdue} days overdue. Please make payment immediately to avoid penalties.`;

        const notification = await Notification.create({
            customerId: customer._id,
            contractId: installment.contractId._id,
            installmentId: installment._id,
            type: 'overdue',
            channel: 'system',
            message,
            status: 'sent',
            sentAt: new Date()
        });

        return notification;
    } catch (error) {
        console.error('Error sending overdue notification:', error);
        return null;
    }
};

module.exports = {
    sendPaymentNotification,
    sendReminderNotification,
    sendOverdueNotification
};
