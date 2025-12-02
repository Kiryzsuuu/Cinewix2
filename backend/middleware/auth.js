const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Akses ditolak. Token tidak ditemukan.' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password -verificationCode -verificationExpires -resetPasswordToken -resetPasswordExpires');
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User tidak ditemukan.' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Token tidak valid.' 
        });
    }
};

// Check if user is admin
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Akses ditolak. Hanya admin yang dapat mengakses.' 
        });
    }
    next();
};

// Check if user is super admin
const superAdminMiddleware = (req, res, next) => {
    if (req.user.role !== 'superadmin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Akses ditolak. Hanya super admin yang dapat mengakses.' 
        });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware, superAdminMiddleware };
