const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const User = require('../models/User');
const Customer = require('../models/Customer');
const Contract = require('../models/Contract');
const Installment = require('../models/Installment');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');
const { generateInstallments } = require('../services/installmentService');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ims';

const seedData = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await Customer.deleteMany({});
        await Contract.deleteMany({});
        await Installment.deleteMany({});
        await Settings.deleteMany({});
        await Notification.deleteMany({});
        console.log('Existing data cleared');

        // Create users
        const users = await User.create([
            {
                username: 'admin',
                email: 'admin@ims.com',
                password: 'admin123',
                role: 'admin',
                isActive: true
            },
            {
                username: 'manager',
                email: 'manager@ims.com',
                password: 'manager123',
                role: 'manager',
                isActive: true
            },
            {
                username: 'user',
                email: 'user@ims.com',
                password: 'user123',
                role: 'user',
                isActive: true
            }
        ]);
        console.log('Users created:', users.length);

        // Create customers
        const customers = await Customer.create([
            {
                name: 'Ahmed Hassan',
                phone: '+1234567890',
                email: 'ahmed.hassan@email.com',
                nationalId: 'NID001',
                address: '123 Main Street, City A'
            },
            {
                name: 'Sarah Johnson',
                phone: '+1234567891',
                email: 'sarah.johnson@email.com',
                nationalId: 'NID002',
                address: '456 Oak Avenue, City B'
            },
            {
                name: 'Mohamed Ali',
                phone: '+1234567892',
                email: 'mohamed.ali@email.com',
                nationalId: 'NID003',
                address: '789 Pine Road, City C'
            },
            {
                name: 'Emily Davis',
                phone: '+1234567893',
                email: 'emily.davis@email.com',
                nationalId: 'NID004',
                address: '321 Elm Street, City D'
            },
            {
                name: 'Omar Khalil',
                phone: '+1234567894',
                email: 'omar.khalil@email.com',
                nationalId: 'NID005',
                address: '654 Maple Lane, City E'
            }
        ]);
        console.log('Customers created:', customers.length);

        // Create contracts and installments
        const contractsData = [
            {
                customerId: customers[0]._id,
                totalAmount: 12000,
                downPayment: 2000,
                numberOfInstallments: 10,
                startDate: new Date('2024-01-01'),
                status: 'active',
                description: 'Car Purchase - Toyota Camry 2024'
            },
            {
                customerId: customers[1]._id,
                totalAmount: 24000,
                downPayment: 4000,
                numberOfInstallments: 12,
                startDate: new Date('2024-03-01'),
                status: 'active',
                description: 'Home Furniture Package'
            },
            {
                customerId: customers[2]._id,
                totalAmount: 6000,
                downPayment: 1000,
                numberOfInstallments: 5,
                startDate: new Date('2024-06-01'),
                status: 'active',
                description: 'Laptop and Electronics'
            },
            {
                customerId: customers[3]._id,
                totalAmount: 18000,
                downPayment: 3000,
                numberOfInstallments: 15,
                startDate: new Date('2023-06-01'),
                status: 'completed',
                description: 'Kitchen Renovation'
            },
            {
                customerId: customers[4]._id,
                totalAmount: 8500,
                downPayment: 1500,
                numberOfInstallments: 7,
                startDate: new Date('2024-09-01'),
                status: 'active',
                description: 'Home Appliances Bundle'
            }
        ];

        for (const contractData of contractsData) {
            const contract = await Contract.create(contractData);
            await generateInstallments(contract);
            console.log(`Contract created: ${contract.contractNumber}`);
        }

        // Update some installments as paid and overdue
        const allInstallments = await Installment.find().sort({ dueDate: 1 });

        // Mark some as paid
        for (let i = 0; i < Math.min(15, allInstallments.length); i++) {
            await Installment.findByIdAndUpdate(allInstallments[i]._id, {
                status: 'paid',
                paidAmount: allInstallments[i].amount,
                paidDate: new Date(allInstallments[i].dueDate),
                paymentMethod: ['cash', 'bank_transfer', 'card'][Math.floor(Math.random() * 3)]
            });
        }

        // Update overdue status for past due dates
        await Installment.updateMany(
            {
                status: 'unpaid',
                dueDate: { $lt: new Date() }
            },
            { status: 'overdue' }
        );

        console.log('Installments updated with payment statuses');

        // Create default settings
        const settings = await Settings.create([
            { key: 'companyName', value: 'IMS Corporation', description: 'Company name' },
            { key: 'currency', value: 'USD', description: 'Default currency' },
            { key: 'currencySymbol', value: '$', description: 'Currency symbol' },
            { key: 'reminderDaysBefore', value: 7, description: 'Days before due to send reminder' },
            { key: 'enableWhatsAppNotifications', value: true, description: 'Enable WhatsApp notifications' },
            { key: 'enableEmailNotifications', value: true, description: 'Enable email notifications' }
        ]);
        console.log('Settings created:', settings.length);

        // Create some sample notifications
        await Notification.create([
            {
                customerId: customers[0]._id,
                type: 'reminder',
                channel: 'system',
                message: 'Your installment is due in 7 days.',
                status: 'sent',
                sentAt: new Date()
            },
            {
                customerId: customers[1]._id,
                type: 'payment_confirmation',
                channel: 'email',
                message: 'Payment received. Thank you!',
                status: 'sent',
                sentAt: new Date()
            }
        ]);
        console.log('Sample notifications created');

        console.log('\n========================================');
        console.log('Database seeded successfully!');
        console.log('========================================');
        console.log('\nDemo Credentials:');
        console.log('Admin: admin@ims.com / admin123');
        console.log('Manager: manager@ims.com / manager123');
        console.log('User: user@ims.com / user123');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedData();
