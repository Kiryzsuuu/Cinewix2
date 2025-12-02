const express = require('express');
const router = express.Router();
const {
    createBooking,
    getUserBookings,
    getBookingById,
    cancelBooking,
    getAvailableSeats
} = require('../controllers/bookingController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, createBooking);
router.get('/my-bookings', authMiddleware, getUserBookings);
router.get('/available-seats', getAvailableSeats);
router.get('/:id', authMiddleware, getBookingById);
router.put('/:id/cancel', authMiddleware, cancelBooking);

module.exports = router;
