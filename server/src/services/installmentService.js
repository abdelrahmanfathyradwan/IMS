const Installment = require('../models/Installment');

/**
 * Generate installments for a contract
 * @param {Object} contract - The contract document
 */
const generateInstallments = async (contract) => {
    const installmentAmount = (contract.totalAmount - contract.downPayment) / contract.numberOfInstallments;
    const installments = [];

    let dueDate = new Date(contract.startDate);

    for (let i = 1; i <= contract.numberOfInstallments; i++) {
        // Set due date to the same day each month
        const installmentDueDate = new Date(dueDate);
        installmentDueDate.setMonth(installmentDueDate.getMonth() + (i - 1));

        installments.push({
            contractId: contract._id,
            installmentNumber: i,
            amount: Math.round(installmentAmount * 100) / 100, // Round to 2 decimal places
            dueDate: installmentDueDate,
            status: 'unpaid'
        });
    }

    // Bulk insert installments
    await Installment.insertMany(installments);

    return installments;
};

/**
 * Regenerate installments for a contract (for updates)
 * @param {Object} contract - The contract document
 */
const regenerateInstallments = async (contract) => {
    // Delete existing unpaid installments
    await Installment.deleteMany({
        contractId: contract._id,
        status: { $ne: 'paid' }
    });

    // Get count of paid installments
    const paidCount = await Installment.countDocuments({
        contractId: contract._id,
        status: 'paid'
    });

    // Calculate remaining installments
    const remainingCount = contract.numberOfInstallments - paidCount;
    if (remainingCount <= 0) return;

    // Calculate remaining amount
    const paidInstallments = await Installment.find({
        contractId: contract._id,
        status: 'paid'
    });
    const totalPaid = paidInstallments.reduce((sum, i) => sum + (i.paidAmount || i.amount), 0);
    const remainingAmount = contract.totalAmount - contract.downPayment - totalPaid;

    const installmentAmount = remainingAmount / remainingCount;
    const installments = [];

    let dueDate = new Date();

    for (let i = 1; i <= remainingCount; i++) {
        const installmentDueDate = new Date(dueDate);
        installmentDueDate.setMonth(installmentDueDate.getMonth() + i);

        installments.push({
            contractId: contract._id,
            installmentNumber: paidCount + i,
            amount: Math.round(installmentAmount * 100) / 100,
            dueDate: installmentDueDate,
            status: 'unpaid'
        });
    }

    await Installment.insertMany(installments);
    return installments;
};

/**
 * Update overdue installments
 */
const updateOverdueStatus = async () => {
    const result = await Installment.updateMany(
        {
            status: 'unpaid',
            dueDate: { $lt: new Date() }
        },
        { status: 'overdue' }
    );
    return result.modifiedCount;
};

module.exports = {
    generateInstallments,
    regenerateInstallments,
    updateOverdueStatus
};
