const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getDashboardStats,
    getAllTransactions,
    updateUserRole,
    deleteUser,
    getAllBookings,
    updateBookingStatus
} = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware, adminMiddleware);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/transactions', getAllTransactions);
router.get('/bookings', getAllBookings);
router.put('/users/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.put('/bookings/status', updateBookingStatus);

module.exports = router;
