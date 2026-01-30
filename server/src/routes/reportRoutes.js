const express = require('express');
const router = express.Router();
const {
    getDashboardSummary,
    getInstallmentsReport,
    getCustomersReport,
    getOverdueReport,
    getMonthlyReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.get('/summary', protect, checkPermission('reports:read'), getDashboardSummary);
router.get('/installments', protect, checkPermission('reports:read'), getInstallmentsReport);
router.get('/customers', protect, checkPermission('reports:read'), getCustomersReport);
router.get('/overdue', protect, checkPermission('reports:read'), getOverdueReport);
router.get('/monthly', protect, checkPermission('reports:read'), getMonthlyReport);

module.exports = router;
