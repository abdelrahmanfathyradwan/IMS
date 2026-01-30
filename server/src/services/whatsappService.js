const Customer = require('../models/Customer');

/**
 * Mock WhatsApp API Service
 * In production, this would integrate with WhatsApp Business API
 */

/**
 * Send WhatsApp message (Mock)
 * @param {String} customerId - Customer ID
 * @param {String} message - Message to send
 */
const sendWhatsAppMessage = async (customerId, message) => {
    try {
        const customer = await Customer.findById(customerId);

        if (!customer) {
            return {
                success: false,
                error: 'Customer not found'
            };
        }

        if (!customer.phone) {
            return {
                success: false,
                error: 'Customer has no phone number'
            };
        }

        // Mock API call - In production, use actual WhatsApp Business API
        console.log(`[MOCK WHATSAPP] Sending to ${customer.phone}: ${message}`);

        // Simulate API response delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Mock successful response
        return {
            success: true,
            messageId: `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            recipient: customer.phone,
            status: 'sent'
        };
    } catch (error) {
        console.error('WhatsApp send error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Send bulk WhatsApp messages (Mock)
 * @param {Array} customerIds - Array of customer IDs
 * @param {String} message - Message to send
 */
const sendBulkWhatsApp = async (customerIds, message) => {
    const results = await Promise.all(
        customerIds.map(id => sendWhatsAppMessage(id, message))
    );

    return {
        total: customerIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
    };
};

/**
 * Send email notification (Mock)
 * @param {String} customerId - Customer ID
 * @param {String} message - Message to send
 */
const sendEmailNotification = async (customerId, message) => {
    try {
        const customer = await Customer.findById(customerId);

        if (!customer) {
            return {
                success: false,
                error: 'Customer not found'
            };
        }

        if (!customer.email) {
            return {
                success: false,
                error: 'Customer has no email address'
            };
        }

        // Mock API call - In production, use actual email service
        console.log(`[MOCK EMAIL] Sending to ${customer.email}: ${message}`);

        return {
            success: true,
            messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            recipient: customer.email,
            status: 'sent'
        };
    } catch (error) {
        console.error('Email send error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    sendWhatsAppMessage,
    sendBulkWhatsApp,
    sendEmailNotification
};
