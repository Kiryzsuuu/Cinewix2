const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateVerificationCode, sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');

// Register user
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email sudah terdaftar' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification code
        const verificationCode = generateVerificationCode();
        const verificationExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            verificationCode,
            verificationExpires
        });

        // Send welcome email
        await sendWelcomeEmail(email, firstName, verificationCode);

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil! Kode verifikasi telah dikirim ke email Anda.',
            userId: user._id
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat registrasi',
            error: error.message 
        });
    }
};

// Verify email
const verifyEmail = async (req, res) => {
    try {
        const { userId, code } = req.body;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }

        if (user.isVerified) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email sudah terverifikasi' 
            });
        }

        // Check if code is expired
        if (user.verificationExpires < Date.now()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Kode verifikasi sudah kadaluarsa' 
            });
        }

        // Check if code matches
        if (user.verificationCode !== code) {
            return res.status(400).json({ 
                success: false, 
                message: 'Kode verifikasi salah' 
            });
        }

        // Update user
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationExpires = undefined;
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            message: 'Email berhasil diverifikasi',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat verifikasi email',
            error: error.message 
        });
    }
};

// Resend verification code
const resendVerificationCode = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }

        if (user.isVerified) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email sudah terverifikasi' 
            });
        }

        // Generate new verification code
        const verificationCode = generateVerificationCode();
        const verificationExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        user.verificationCode = verificationCode;
        user.verificationExpires = verificationExpires;
        await user.save();

        // Send email
        await sendWelcomeEmail(user.email, user.firstName, verificationCode);

        res.json({
            success: true,
            message: 'Kode verifikasi baru telah dikirim ke email Anda'
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mengirim ulang kode verifikasi',
            error: error.message 
        });
    }
};

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email atau password salah' 
            });
        }

        // Check if verified
        if (!user.isVerified) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email belum diverifikasi. Silakan verifikasi email Anda terlebih dahulu.',
                userId: user._id,
                needVerification: true
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email atau password salah' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            message: 'Login berhasil',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat login',
            error: error.message 
        });
    }
};

// Forgot password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Email tidak ditemukan' 
            });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        // Send email
        await sendPasswordResetEmail(email, user.firstName, resetToken);

        res.json({
            success: true,
            message: 'Link reset password telah dikirim ke email Anda'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat memproses permintaan',
            error: error.message 
        });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.resetPasswordToken !== token) {
            return res.status(400).json({ 
                success: false, 
                message: 'Token tidak valid atau sudah kadaluarsa' 
            });
        }

        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Token sudah kadaluarsa' 
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Password berhasil direset'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mereset password',
            error: error.message 
        });
    }
};

// Get current user
const getCurrentUser = async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan',
            error: error.message 
        });
    }
};

// Logout
const logout = async (req, res) => {
    try {
        res.clearCookie('token');
        res.json({
            success: true,
            message: 'Logout berhasil'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat logout',
            error: error.message 
        });
    }
};

module.exports = {
    register,
    verifyEmail,
    resendVerificationCode,
    login,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    logout
};
