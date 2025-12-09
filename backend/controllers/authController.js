const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateVerificationCode, generateOTP, sendWelcomeEmail, sendPasswordResetEmail, sendLoginOTP } = require('../utils/emailService');

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

        // Send welcome email (non-blocking)
        try {
            await sendWelcomeEmail(email, firstName, verificationCode);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Continue anyway, user is created
        }

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

// Login - Step 1: Send OTP
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

        // Generate OTP
        const otpCode = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.loginOtpCode = otpCode;
        user.loginOtpExpires = otpExpires;
        await user.save();

        // Send OTP email
        await sendLoginOTP(email, user.firstName, otpCode);

        res.json({
            success: true,
            message: 'Kode OTP telah dikirim ke email Anda',
            userId: user._id,
            requireOtp: true
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

// Login - Step 2: Verify OTP
const verifyLoginOtp = async (req, res) => {
    try {
        const { userId, otpCode } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }

        // Check if OTP expired
        if (user.loginOtpExpires < Date.now()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Kode OTP sudah kadaluarsa' 
            });
        }

        // Check if OTP matches
        if (user.loginOtpCode !== otpCode) {
            return res.status(400).json({ 
                success: false, 
                message: 'Kode OTP salah' 
            });
        }

        // Clear OTP
        user.loginOtpCode = undefined;
        user.loginOtpExpires = undefined;
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
        console.error('Verify OTP error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat verifikasi OTP',
            error: error.message 
        });
    }
};

// Forgot password - Send OTP
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

        // Generate OTP
        const resetToken = generateOTP();
        const tokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = tokenExpires;
        await user.save();

        // Send email with OTP
        await sendPasswordResetEmail(email, user.firstName, resetToken);

        res.json({
            success: true,
            message: 'Kode OTP reset password telah dikirim ke email Anda',
            userId: user._id
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

// Reset password with OTP
const resetPassword = async (req, res) => {
    try {
        const { userId, otpCode, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }

        // Check if OTP expired
        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Kode OTP sudah kadaluarsa' 
            });
        }

        // Check if OTP matches
        if (user.resetPasswordToken !== otpCode) {
            return res.status(400).json({ 
                success: false, 
                message: 'Kode OTP salah' 
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
    verifyLoginOtp,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    logout
};
