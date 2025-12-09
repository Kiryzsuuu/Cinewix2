const { User, Booking, Transaction, Movie } = require('../models/mysql-models');
const { connectDB } = require('../config/mysql-database');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        await connectDB();
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengambil data user',
            error: error.message 
        });
    }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        await connectDB();
        
        const totalUsers = await User.count();
        const totalMovies = await Movie.count({ where: { isActive: true } });
        const totalBookings = await Booking.count();
        
        const revenueResult = await Transaction.sum('amount', {
            where: { status: 'success' }
        });
        const totalRevenue = revenueResult || 0;

        const recentBookings = await Booking.findAll({
            include: [
                { model: User, attributes: ['firstName', 'lastName', 'email'] },
                { model: Movie, attributes: ['title'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        const recentTransactions = await Transaction.findAll({
            include: [
                { model: User, attributes: ['firstName', 'lastName', 'email'] },
                { 
                    model: Booking,
                    include: [{ model: Movie, attributes: ['title'] }]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalMovies,
                totalBookings,
                totalRevenue
            },
            recentBookings,
            recentTransactions
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengambil statistik',
            error: error.message 
        });
    }
};

// Get all transactions (admin only)
const getAllTransactions = async (req, res) => {
    try {
        await connectDB();
        
        const transactions = await Transaction.findAll({
            include: [
                { model: User, attributes: ['firstName', 'lastName', 'email'] },
                { 
                    model: Booking,
                    include: [{ model: Movie, attributes: ['title'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: transactions.length,
            transactions
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengambil data transaksi',
            error: error.message 
        });
    }
};

// Update user role (admin only)
const updateUserRole = async (req, res) => {
    try {
        await connectDB();
        const { userId, role } = req.body;

        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }

        // Check if user is permanent (super admin)
        if (user.isPermanent) {
            return res.status(403).json({ 
                success: false, 
                message: 'Tidak dapat mengubah role super admin permanent' 
            });
        }

        // Only super admin can make someone admin
        if (role === 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Hanya super admin yang dapat menambahkan admin' 
            });
        }

        user.role = role;
        await user.save();

        res.json({
            success: true,
            message: `User berhasil diubah menjadi ${role}`,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengubah role user',
            error: error.message 
        });
    }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
    try {
        await connectDB();
        const user = await User.findByPk(req.params.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }

        // Check if user is permanent (super admin)
        if (user.isPermanent) {
            return res.status(403).json({ 
                success: false, 
                message: 'Tidak dapat menghapus super admin permanent' 
            });
        }

        // Check if trying to delete another admin
        if (user.role === 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Hanya super admin yang dapat menghapus admin' 
            });
        }

        await user.destroy();

        res.json({
            success: true,
            message: 'User berhasil dihapus'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat menghapus user',
            error: error.message 
        });
    }
};

// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
    try {
        await connectDB();
        
        const bookings = await Booking.findAll({
            include: [
                { model: User, attributes: ['firstName', 'lastName', 'email'] },
                { model: Movie, attributes: ['title'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengambil data booking',
            error: error.message 
        });
    }
};

// Update booking status (admin only)
const updateBookingStatus = async (req, res) => {
    try {
        await connectDB();
        const { bookingId, status, paymentStatus } = req.body;

        const booking = await Booking.findByPk(bookingId);
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking tidak ditemukan' 
            });
        }

        if (status) booking.status = status;
        if (paymentStatus) booking.paymentStatus = paymentStatus;
        
        await booking.save();

        // Update transaction if payment status changed
        if (paymentStatus) {
            await Transaction.update(
                { status: paymentStatus === 'paid' ? 'success' : 'pending' },
                { where: { bookingId: bookingId } }
            );
        }

        res.json({
            success: true,
            message: 'Status booking berhasil diupdate',
            booking
        });
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengupdate status booking',
            error: error.message 
        });
    }
};

module.exports = {
    getAllUsers,
    getDashboardStats,
    getAllTransactions,
    updateUserRole,
    deleteUser,
    getAllBookings,
    updateBookingStatus
};
