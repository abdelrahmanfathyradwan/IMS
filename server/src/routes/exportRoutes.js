const express = require('express');
const router = express.Router();
const {
    exportInstallmentsPDF,
    exportInstallmentsExcel,
    exportCustomersPDF,
    exportCustomersExcel,
    exportOverduePDF,
    exportOverdueExcel
} = require('../controllers/exportController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

// PDF exports
router.get('/pdf/installments', protect, checkPermission('reports:export'), exportInstallmentsPDF);
router.get('/pdf/customers', protect, checkPermission('reports:export'), exportCustomersPDF);
router.get('/pdf/overdue', protect, checkPermission('reports:export'), exportOverduePDF);

// Excel exports
router.get('/excel/installments', protect, checkPermission('reports:export'), exportInstallmentsExcel);
router.get('/excel/customers', protect, checkPermission('reports:export'), exportCustomersExcel);
router.get('/excel/overdue', protect, checkPermission('reports:export'), exportOverdueExcel);

module.exports = router;
