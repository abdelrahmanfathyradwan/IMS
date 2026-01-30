const express = require('express');
const router = express.Router();
const {
    getContracts,
    getContract,
    createContract,
    updateContract,
    deleteContract,
    getContractSummary
} = require('../controllers/contractController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router
    .route('/')
    .get(protect, checkPermission('contracts:read'), getContracts)
    .post(protect, checkPermission('contracts:create'), createContract);

router
    .route('/:id')
    .get(protect, checkPermission('contracts:read'), getContract)
    .put(protect, checkPermission('contracts:update'), updateContract)
    .delete(protect, checkPermission('contracts:delete'), deleteContract);

router.get('/:id/summary', protect, checkPermission('contracts:read'), getContractSummary);

module.exports = router;
