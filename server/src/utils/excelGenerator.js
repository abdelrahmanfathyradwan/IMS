const ExcelJS = require('exceljs');

/**
 * Generate Excel for installments report
 */
const generateInstallmentsExcel = async (installments) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'IMS';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Installments');

    // Define columns
    worksheet.columns = [
        { header: 'Customer', key: 'customer', width: 25 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Contract #', key: 'contract', width: 15 },
        { header: 'Installment #', key: 'number', width: 12 },
        { header: 'Amount', key: 'amount', width: 12 },
        { header: 'Due Date', key: 'dueDate', width: 15 },
        { header: 'Paid Date', key: 'paidDate', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Payment Method', key: 'paymentMethod', width: 15 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F81BD' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Add data
    installments.forEach(installment => {
        const row = worksheet.addRow({
            customer: installment.contractId?.customerId?.name || 'N/A',
            phone: installment.contractId?.customerId?.phone || 'N/A',
            contract: installment.contractId?.contractNumber || 'N/A',
            number: installment.installmentNumber,
            amount: installment.amount,
            dueDate: new Date(installment.dueDate).toLocaleDateString(),
            paidDate: installment.paidDate ? new Date(installment.paidDate).toLocaleDateString() : '',
            status: installment.status.toUpperCase(),
            paymentMethod: installment.paymentMethod || ''
        });

        // Color code by status
        if (installment.status === 'overdue') {
            row.getCell('status').fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFF0000' }
            };
            row.getCell('status').font = { color: { argb: 'FFFFFFFF' } };
        } else if (installment.status === 'paid') {
            row.getCell('status').fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF00FF00' }
            };
        }
    });

    // Add summary at bottom
    worksheet.addRow([]);
    worksheet.addRow(['Summary']);
    worksheet.addRow(['Total Installments', installments.length]);
    worksheet.addRow(['Paid', installments.filter(i => i.status === 'paid').length]);
    worksheet.addRow(['Overdue', installments.filter(i => i.status === 'overdue').length]);
    worksheet.addRow(['Total Amount', installments.reduce((sum, i) => sum + i.amount, 0)]);

    return workbook.xlsx.writeBuffer();
};

/**
 * Generate Excel for customers report
 */
const generateCustomersExcel = async (customers) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'IMS';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Customers');

    worksheet.columns = [
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'National ID', key: 'nationalId', width: 15 },
        { header: 'Address', key: 'address', width: 40 },
        { header: 'Created At', key: 'createdAt', width: 15 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F81BD' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    customers.forEach(customer => {
        worksheet.addRow({
            name: customer.name,
            phone: customer.phone,
            email: customer.email || '',
            nationalId: customer.nationalId || '',
            address: customer.address || '',
            createdAt: new Date(customer.createdAt).toLocaleDateString()
        });
    });

    return workbook.xlsx.writeBuffer();
};

/**
 * Generate Excel for overdue report
 */
const generateOverdueExcel = async (overdueInstallments) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'IMS';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Overdue Installments');

    worksheet.columns = [
        { header: 'Customer', key: 'customer', width: 25 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Contract #', key: 'contract', width: 15 },
        { header: 'Installment #', key: 'number', width: 12 },
        { header: 'Amount', key: 'amount', width: 12 },
        { header: 'Due Date', key: 'dueDate', width: 15 },
        { header: 'Days Overdue', key: 'daysOverdue', width: 12 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF0000' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    overdueInstallments.forEach(installment => {
        const customer = installment.contractId?.customerId;
        const daysOverdue = Math.floor((new Date() - new Date(installment.dueDate)) / (1000 * 60 * 60 * 24));

        worksheet.addRow({
            customer: customer?.name || 'N/A',
            phone: customer?.phone || 'N/A',
            email: customer?.email || '',
            contract: installment.contractId?.contractNumber || 'N/A',
            number: installment.installmentNumber,
            amount: installment.amount,
            dueDate: new Date(installment.dueDate).toLocaleDateString(),
            daysOverdue
        });
    });

    // Summary
    worksheet.addRow([]);
    worksheet.addRow(['Total Overdue Amount', overdueInstallments.reduce((sum, i) => sum + i.amount, 0)]);
    worksheet.addRow(['Total Overdue Installments', overdueInstallments.length]);

    return workbook.xlsx.writeBuffer();
};

module.exports = {
    generateInstallmentsExcel,
    generateCustomersExcel,
    generateOverdueExcel
};
