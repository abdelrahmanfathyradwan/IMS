const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Customer = require('../models/Customer');
const Contract = require('../models/Contract');
const Installment = require('../models/Installment');
const { generateInstallmentsPDF, generateCustomersPDF, generateOverduePDF } = require('../utils/pdfGenerator');
const { generateInstallmentsExcel, generateCustomersExcel, generateOverdueExcel } = require('../utils/excelGenerator');

// @desc    Export installments to PDF
// @route   GET /api/export/pdf/installments
// @access  Private
exports.exportInstallmentsPDF = async (req, res, next) => {
    try {
        const { status, startDate, endDate } = req.query;

        let query = {};
        if (status) query.status = status;
        if (startDate || endDate) {
            query.dueDate = {};
            if (startDate) query.dueDate.$gte = new Date(startDate);
            if (endDate) query.dueDate.$lte = new Date(endDate);
        }

        const installments = await Installment.find(query)
            .populate({
                path: 'contractId',
                populate: { path: 'customerId', select: 'name phone' }
            })
            .sort({ dueDate: 1 });

        const pdfBuffer = await generateInstallmentsPDF(installments);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=installments-report.pdf');
        res.send(pdfBuffer);
    } catch (error) {
        next(error);
    }
};

// @desc    Export installments to Excel
// @route   GET /api/export/excel/installments
// @access  Private
exports.exportInstallmentsExcel = async (req, res, next) => {
    try {
        const { status, startDate, endDate } = req.query;

        let query = {};
        if (status) query.status = status;
        if (startDate || endDate) {
            query.dueDate = {};
            if (startDate) query.dueDate.$gte = new Date(startDate);
            if (endDate) query.dueDate.$lte = new Date(endDate);
        }

        const installments = await Installment.find(query)
            .populate({
                path: 'contractId',
                populate: { path: 'customerId', select: 'name phone' }
            })
            .sort({ dueDate: 1 });

        const buffer = await generateInstallmentsExcel(installments);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=installments-report.xlsx');
        res.send(buffer);
    } catch (error) {
        next(error);
    }
};

// @desc    Export customers to PDF
// @route   GET /api/export/pdf/customers
// @access  Private
exports.exportCustomersPDF = async (req, res, next) => {
    try {
        const customers = await Customer.find().sort({ name: 1 });
        const pdfBuffer = await generateCustomersPDF(customers);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=customers-report.pdf');
        res.send(pdfBuffer);
    } catch (error) {
        next(error);
    }
};

// @desc    Export customers to Excel
// @route   GET /api/export/excel/customers
// @access  Private
exports.exportCustomersExcel = async (req, res, next) => {
    try {
        const customers = await Customer.find().sort({ name: 1 });
        const buffer = await generateCustomersExcel(customers);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=customers-report.xlsx');
        res.send(buffer);
    } catch (error) {
        next(error);
    }
};

// @desc    Export overdue report to PDF
// @route   GET /api/export/pdf/overdue
// @access  Private
exports.exportOverduePDF = async (req, res, next) => {
    try {
        await Installment.updateMany(
            { status: 'unpaid', dueDate: { $lt: new Date() } },
            { status: 'overdue' }
        );

        const overdueInstallments = await Installment.find({ status: 'overdue' })
            .populate({
                path: 'contractId',
                populate: { path: 'customerId' }
            })
            .sort({ dueDate: 1 });

        const pdfBuffer = await generateOverduePDF(overdueInstallments);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=overdue-report.pdf');
        res.send(pdfBuffer);
    } catch (error) {
        next(error);
    }
};

// @desc    Export overdue report to Excel
// @route   GET /api/export/excel/overdue
// @access  Private
exports.exportOverdueExcel = async (req, res, next) => {
    try {
        await Installment.updateMany(
            { status: 'unpaid', dueDate: { $lt: new Date() } },
            { status: 'overdue' }
        );

        const overdueInstallments = await Installment.find({ status: 'overdue' })
            .populate({
                path: 'contractId',
                populate: { path: 'customerId' }
            })
            .sort({ dueDate: 1 });

        const buffer = await generateOverdueExcel(overdueInstallments);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=overdue-report.xlsx');
        res.send(buffer);
    } catch (error) {
        next(error);
    }
};
