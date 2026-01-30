const PDFDocument = require('pdfkit');

/**
 * Generate PDF for installments report
 */
const generateInstallmentsPDF = async (installments) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            // Header
            doc.fontSize(20).text('Installments Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown(2);

            // Summary
            const total = installments.length;
            const paid = installments.filter(i => i.status === 'paid').length;
            const overdue = installments.filter(i => i.status === 'overdue').length;
            const totalAmount = installments.reduce((sum, i) => sum + i.amount, 0);

            doc.fontSize(12).text('Summary:', { underline: true });
            doc.fontSize(10);
            doc.text(`Total Installments: ${total}`);
            doc.text(`Paid: ${paid}`);
            doc.text(`Overdue: ${overdue}`);
            doc.text(`Total Amount: $${totalAmount.toFixed(2)}`);
            doc.moveDown(2);

            // Table header
            doc.fontSize(10).font('Helvetica-Bold');
            const tableTop = doc.y;
            doc.text('Customer', 50, tableTop, { width: 100 });
            doc.text('Contract', 150, tableTop, { width: 80 });
            doc.text('#', 230, tableTop, { width: 30 });
            doc.text('Amount', 260, tableTop, { width: 70 });
            doc.text('Due Date', 330, tableTop, { width: 80 });
            doc.text('Status', 410, tableTop, { width: 60 });
            doc.moveDown();

            // Draw line
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.5);

            // Table rows
            doc.font('Helvetica');
            installments.forEach((installment, index) => {
                if (doc.y > 700) {
                    doc.addPage();
                }

                const y = doc.y;
                const customerName = installment.contractId?.customerId?.name || 'N/A';
                const contractNum = installment.contractId?.contractNumber || 'N/A';

                doc.text(customerName.substring(0, 15), 50, y, { width: 100 });
                doc.text(contractNum.substring(0, 12), 150, y, { width: 80 });
                doc.text(installment.installmentNumber.toString(), 230, y, { width: 30 });
                doc.text(`$${installment.amount.toFixed(2)}`, 260, y, { width: 70 });
                doc.text(new Date(installment.dueDate).toLocaleDateString(), 330, y, { width: 80 });
                doc.text(installment.status.toUpperCase(), 410, y, { width: 60 });
                doc.moveDown();
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Generate PDF for customers report
 */
const generateCustomersPDF = async (customers) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            // Header
            doc.fontSize(20).text('Customers Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.fontSize(10).text(`Total Customers: ${customers.length}`, { align: 'center' });
            doc.moveDown(2);

            // Table header
            doc.fontSize(10).font('Helvetica-Bold');
            const tableTop = doc.y;
            doc.text('Name', 50, tableTop, { width: 120 });
            doc.text('Phone', 170, tableTop, { width: 100 });
            doc.text('Email', 270, tableTop, { width: 150 });
            doc.text('National ID', 420, tableTop, { width: 100 });
            doc.moveDown();

            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.5);

            // Table rows
            doc.font('Helvetica');
            customers.forEach(customer => {
                if (doc.y > 700) {
                    doc.addPage();
                }

                const y = doc.y;
                doc.text(customer.name?.substring(0, 18) || 'N/A', 50, y, { width: 120 });
                doc.text(customer.phone || 'N/A', 170, y, { width: 100 });
                doc.text(customer.email?.substring(0, 22) || 'N/A', 270, y, { width: 150 });
                doc.text(customer.nationalId || 'N/A', 420, y, { width: 100 });
                doc.moveDown();
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Generate PDF for overdue report
 */
const generateOverduePDF = async (overdueInstallments) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            // Header
            doc.fontSize(20).fillColor('red').text('OVERDUE INSTALLMENTS REPORT', { align: 'center' });
            doc.fillColor('black');
            doc.moveDown();
            doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown(2);

            // Summary
            const totalOverdue = overdueInstallments.reduce((sum, i) => sum + i.amount, 0);
            doc.fontSize(12).text('Summary:', { underline: true });
            doc.fontSize(10);
            doc.text(`Total Overdue Installments: ${overdueInstallments.length}`);
            doc.text(`Total Overdue Amount: $${totalOverdue.toFixed(2)}`);
            doc.moveDown(2);

            // Table
            doc.fontSize(10).font('Helvetica-Bold');
            const tableTop = doc.y;
            doc.text('Customer', 50, tableTop, { width: 100 });
            doc.text('Phone', 150, tableTop, { width: 80 });
            doc.text('Amount', 230, tableTop, { width: 70 });
            doc.text('Due Date', 300, tableTop, { width: 80 });
            doc.text('Days Overdue', 380, tableTop, { width: 80 });
            doc.moveDown();

            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.5);

            doc.font('Helvetica');
            overdueInstallments.forEach(installment => {
                if (doc.y > 700) {
                    doc.addPage();
                }

                const y = doc.y;
                const customer = installment.contractId?.customerId;
                const daysOverdue = Math.floor((new Date() - new Date(installment.dueDate)) / (1000 * 60 * 60 * 24));

                doc.text(customer?.name?.substring(0, 15) || 'N/A', 50, y, { width: 100 });
                doc.text(customer?.phone || 'N/A', 150, y, { width: 80 });
                doc.text(`$${installment.amount.toFixed(2)}`, 230, y, { width: 70 });
                doc.text(new Date(installment.dueDate).toLocaleDateString(), 300, y, { width: 80 });
                doc.fillColor('red').text(daysOverdue.toString(), 380, y, { width: 80 });
                doc.fillColor('black');
                doc.moveDown();
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateInstallmentsPDF,
    generateCustomersPDF,
    generateOverduePDF
};
