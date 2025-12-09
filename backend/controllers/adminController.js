const User = require('../models/User');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const Movie = require('../models/Movie');
const bcrypt = require('bcryptjs');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

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
        const totalUsers = await User.countDocuments();
        const totalMovies = await Movie.countDocuments({ isActive: true });
        const totalBookings = await Booking.countDocuments();
        
        const revenueResult = await Transaction.aggregate([
            { $match: { status: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        const recentBookings = await Booking.find()
            .populate('user', 'firstName lastName email')
            .populate('movie', 'title')
            .sort({ createdAt: -1 })
            .limit(10);

        const recentTransactions = await Transaction.find()
            .populate('user', 'firstName lastName email')
            .populate({
                path: 'booking',
                populate: { path: 'movie', select: 'title' }
            })
            .sort({ createdAt: -1 })
            .limit(10);

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
        const transactions = await Transaction.find()
            .populate('user', 'firstName lastName email')
            .populate({
                path: 'booking',
                populate: { path: 'movie', select: 'title' }
            })
            .sort({ createdAt: -1 });

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
        const { userId, role } = req.body;

        const user = await User.findById(userId);
        
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
        const user = await User.findById(req.params.id);
        
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

        await User.findByIdAndDelete(req.params.id);

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
        const bookings = await Booking.find()
            .populate('user', 'firstName lastName email')
            .populate('movie', 'title')
            .sort({ createdAt: -1 });

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
        const { bookingId, status, paymentStatus } = req.body;

        const booking = await Booking.findById(bookingId);
        
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
            await Transaction.updateMany(
                { booking: bookingId },
                { status: paymentStatus === 'paid' ? 'success' : 'pending' }
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
