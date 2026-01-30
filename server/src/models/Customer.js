const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    nationalId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Virtual for contracts
customerSchema.virtual('contracts', {
    ref: 'Contract',
    localField: '_id',
    foreignField: 'customerId'
});

customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Customer', customerSchema);
