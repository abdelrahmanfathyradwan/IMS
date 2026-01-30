const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
    contractId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
        required: [true, 'Contract is required']
    },
    installmentNumber: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: 0
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    paidDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['paid', 'unpaid', 'overdue', 'partial'],
        default: 'unpaid'
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank_transfer', 'check', 'card', 'other'],
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Index for efficient queries
installmentSchema.index({ contractId: 1, installmentNumber: 1 });
installmentSchema.index({ dueDate: 1, status: 1 });

// Method to check if overdue
installmentSchema.methods.checkOverdue = function () {
    if (this.status === 'unpaid' && new Date(this.dueDate) < new Date()) {
        this.status = 'overdue';
        return true;
    }
    return false;
};

// Static method to get overdue installments
installmentSchema.statics.getOverdue = function () {
    return this.find({
        status: { $in: ['unpaid', 'overdue'] },
        dueDate: { $lt: new Date() }
    }).populate({
        path: 'contractId',
        populate: { path: 'customerId' }
    });
};

module.exports = mongoose.model('Installment', installmentSchema);
