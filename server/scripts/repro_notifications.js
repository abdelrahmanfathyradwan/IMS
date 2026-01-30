const path = require('path');
const dotenv = require('dotenv');

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Notification = require('../src/models/Notification');
// Ensure referenced models are loaded
require('../src/models/Customer');
require('../src/models/Contract');
require('../src/models/Installment');

const run = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ims';
        console.log(`Connecting to DB: ${mongoUri}`);
        await mongoose.connect(mongoUri);
        console.log('Connected to DB');

        // Simulate controller logic
        const query = {};
        const page = 1;
        const limit = 20;

        console.log('Counting documents...');
        const total = await Notification.countDocuments(query);
        console.log(`Total: ${total}`);

        console.log('Fetching notifications...');
        const notifications = await Notification.find(query)
            .populate('customerId', 'name phone email')
            .populate('contractId', 'contractNumber')
            .populate('installmentId', 'installmentNumber amount dueDate')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        console.log('Success!', notifications.length, 'entries found.');
        console.log('Sample entry:', JSON.stringify(notifications[0], null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

run();
