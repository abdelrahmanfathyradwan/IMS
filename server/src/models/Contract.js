const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'Customer is required']
    },
    contractNumber: {
        type: String,
        unique: true
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: 0
    },
    downPayment: {
        type: Number,
        default: 0,
        min: 0
    },
    numberOfInstallments: {
        type: Number,
        required: [true, 'Number of installments is required'],
        min: 1
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

// Virtual for installments
contractSchema.virtual('installments', {
    ref: 'Installment',
    localField: '_id',
    foreignField: 'contractId'
});

// Virtual for remaining amount
contractSchema.virtual('remainingAmount').get(function () {
    return this.totalAmount - this.downPayment;
});

// Virtual for installment amount
contractSchema.virtual('installmentAmount').get(function () {
    return (this.totalAmount - this.downPayment) / this.numberOfInstallments;
});

contractSchema.set('toJSON', { virtuals: true });
contractSchema.set('toObject', { virtuals: true });

// Generate contract number before validation (runs before save)
contractSchema.pre('validate', async function (next) {
    if (!this.contractNumber) {
        const count = await mongoose.model('Contract').countDocuments();
        this.contractNumber = `CNT-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Contract', contractSchema);
