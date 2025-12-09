const { Booking, Transaction, Movie, User } = require('../models/mysql-models');
const { connectDB } = require('../config/mysql-database');
const { sendBookingConfirmation, sendBookingReceipt } = require('../utils/emailService');

// Generate booking code
const generateBookingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'CW';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Generate transaction ID
const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `TRX${timestamp}${random}`;
};

// Create booking
const createBooking = async (req, res) => {
    try {
        await connectDB();
        const { movieId, showtime, seats, paymentMethod } = req.body;
        
        // Get movie details
        const movie = await Movie.findByPk(movieId);
        if (!movie) {
            return res.status(404).json({ 
                success: false, 
                message: 'Film tidak ditemukan' 
            });
        }

        // Calculate total price
        const pricePerSeat = 50000; // Rp 50,000 per seat
        const totalPrice = seats.length * pricePerSeat;

        // Generate booking code
        const bookingCode = generateBookingCode();

        // Create booking
        const booking = await Booking.create({
            userId: req.user.id,
            movieId: movieId,
            showtime,
            seats: seats.map(seat => ({ seatNumber: seat, price: pricePerSeat })),
            totalPrice,
            bookingCode,
            paymentMethod
        });

        // Create transaction
        const transactionId = generateTransactionId();
        await Transaction.create({
            bookingId: booking.id,
            userId: req.user.id,
            amount: totalPrice,
            paymentMethod,
            transactionId
        });

        // Send receipt email with barcode
        await sendBookingReceipt(req.user.email, req.user.firstName, {
            bookingId: bookingCode,
            movie: {
                title: movie.title
            },
            seats: seats,
            showtime: showtime.date,
            totalPrice,
            paymentMethod
        });

        res.status(201).json({
            success: true,
            message: 'Booking berhasil! E-tiket dengan barcode telah dikirim ke email Anda.',
            booking: {
                id: booking.id,
                bookingCode,
                movie: movie.title,
                showtime,
                seats,
                totalPrice
            }
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat membuat booking',
            error: error.message 
        });
    }
};

// Get user bookings
const getUserBookings = async (req, res) => {
    try {
        await connectDB();
        const bookings = await Booking.findAll({
            where: { userId: req.user.id },
            include: [{ model: Movie }],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengambil data booking',
            error: error.message 
        });
    }
};

// Get booking by ID
const getBookingById = async (req, res) => {
    try {
        await connectDB();
        const booking = await Booking.findByPk(req.params.id, {
            include: [
                { model: Movie },
                { model: User, attributes: ['firstName', 'lastName', 'email'] }
            ]
        });

        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking tidak ditemukan' 
            });
        }

        // Check if user owns this booking or is admin
        if (booking.userId !== req.user.id && 
            req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Akses ditolak' 
            });
        }

        res.json({
            success: true,
            booking
        });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengambil data booking',
            error: error.message 
        });
    }
};

// Cancel booking
const cancelBooking = async (req, res) => {
    try {
        await connectDB();
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking tidak ditemukan' 
            });
        }

        // Check if user owns this booking
        if (booking.userId !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Akses ditolak' 
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ 
                success: false, 
                message: 'Booking sudah dibatalkan' 
            });
        }

        if (booking.status === 'completed') {
            return res.status(400).json({ 
                success: false, 
                message: 'Booking yang sudah selesai tidak dapat dibatalkan' 
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({
            success: true,
            message: 'Booking berhasil dibatalkan'
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat membatalkan booking',
            error: error.message 
        });
    }
};

// Get available seats for a showtime
const getAvailableSeats = async (req, res) => {
    try {
        const { movieId, date, time, studio } = req.query;

        // Get all bookings for this showtime
        const bookings = await Booking.find({
            movie: movieId,
            'showtime.date': new Date(date),
            'showtime.time': time,
            'showtime.studio': studio,
            status: { $ne: 'cancelled' }
        });

        // Get booked seats
        const bookedSeats = [];
        bookings.forEach(booking => {
            booking.seats.forEach(seat => {
                bookedSeats.push(seat.seatNumber);
            });
        });

        // Generate all seats (assuming 50 seats per studio)
        const totalSeats = 50;
        const rows = ['A', 'B', 'C', 'D', 'E'];
        const seatsPerRow = 10;
        const allSeats = [];

        for (let row of rows) {
            for (let i = 1; i <= seatsPerRow; i++) {
                const seatNumber = `${row}${i}`;
                allSeats.push({
                    number: seatNumber,
                    isBooked: bookedSeats.includes(seatNumber)
                });
            }
        }

        res.json({
            success: true,
            seats: allSeats
        });
    } catch (error) {
        console.error('Get available seats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengambil data kursi',
            error: error.message 
        });
    }
};

module.exports = {
    createBooking,
    getUserBookings,
    getBookingById,
    cancelBooking,
    getAvailableSeats
};
