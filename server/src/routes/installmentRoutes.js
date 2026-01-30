const express = require('express');
const router = express.Router();
const {
    getInstallments,
    getInstallment,
    updateInstallment,
    payInstallment,
    getOverdueInstallments,
    getUpcomingInstallments
} = require('../controllers/installmentController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

// Special routes first
router.get('/overdue', protect, checkPermission('installments:read'), getOverdueInstallments);
router.get('/upcoming', protect, checkPermission('installments:read'), getUpcomingInstallments);

router
    .route('/')
    .get(protect, checkPermission('installments:read'), getInstallments);

router
    .route('/:id')
    .get(protect, checkPermission('installments:read'), getInstallment)
    .put(protect, checkPermission('installments:update'), updateInstallment);

router.post('/:id/pay', protect, checkPermission('installments:pay'), payInstallment);

module.exports = router;
