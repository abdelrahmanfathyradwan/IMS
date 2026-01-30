const express = require('express');
const router = express.Router();
const {
    login,
    register,
    getMe,
    logout,
    updatePassword,
    getUsers,
    updateUser,
    deleteUser
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.post('/login', login);
router.post('/register', protect, authorize('admin'), register);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/password', protect, updatePassword);

// User management (Admin only)
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
