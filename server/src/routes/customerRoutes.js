const express = require('express');
const router = express.Router();
const {
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer
} = require('../controllers/customerController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router
    .route('/')
    .get(protect, checkPermission('customers:read'), getCustomers)
    .post(protect, checkPermission('customers:create'), createCustomer);

router
    .route('/:id')
    .get(protect, checkPermission('customers:read'), getCustomer)
    .put(protect, checkPermission('customers:update'), updateCustomer)
    .delete(protect, checkPermission('customers:delete'), deleteCustomer);

module.exports = router;
