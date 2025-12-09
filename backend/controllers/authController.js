// Use MySQL models instead of MongoDB
const { User } = require('../models/mysql-models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateVerificationCode, generateOTP, sendWelcomeEmail, sendPasswordResetEmail, sendLoginOTP } = require('../utils/emailService');
const { connectDB } = require('../config/mysql-database');

// Register user
const register = async (req, res) => {
    console.log('[REGISTER] Starting registration process');
    try {
        // Ensure database connection
        console.log('[REGISTER] Connecting to database...');
        await connectDB();
        console.log('[REGISTER] Database connected');
        
        const { firstName, lastName, email, password, phone } = req.body;
        console.log('[REGISTER] Request body:', { firstName, lastName, email, phone: phone ? 'provided' : 'missing' });

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Semua field harus diisi',
                missing: {
                    firstName: !firstName,
                    lastName: !lastName,
                    email: !email,
                    password: !password,
                    phone: !phone
                }
            });
        }

        // Check if user exists (Sequelize syntax)
        const existingUser = await User.findOne({ where: { email } });
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
            console.error('Email sending failed:', emailError.message);
            // Continue anyway, user is created
        }

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil! Kode verifikasi telah dikirim ke email Anda.',
            userId: user.id
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat registrasi',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Verify email
const verifyEmail = async (req, res) => {
    try {
        await connectDB();
        const { userId, code } = req.body;
        
        console.log('[VERIFY] Received userId:', userId, 'Type:', typeof userId, 'Code:', code);
        
        // Convert userId to integer if it's a string
        const userIdInt = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        console.log('[VERIFY] Converted userId:', userIdInt, 'Type:', typeof userIdInt);

        const user = await User.findByPk(userIdInt);
        console.log('[VERIFY] User found:', user ? `Yes (${user.email})` : 'No');
        
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
            sameSite: 'lax',
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            message: 'Email berhasil diverifikasi',
            token,
            user: {
                id: user.id,
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
        await connectDB();
        const { userId } = req.body;
        
        console.log('[RESEND] Received userId:', userId, 'Type:', typeof userId);

        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID tidak ditemukan dalam request' 
            });
        }
        
        // Convert userId to integer if it's a string
        const userIdInt = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        console.log('[RESEND] Converted userId:', userIdInt, 'Type:', typeof userIdInt);

        const user = await User.findByPk(userIdInt);
        
        console.log('[RESEND] User found:', user ? `Yes (${user.email})` : 'No');
        
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
        await connectDB();
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { email } });
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
                userId: user.id,
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

        // Dev log: show OTP in server logs for local testing
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[LOGIN] OTP for ${email}:`, otpCode);
        }

        // Send OTP email
        await sendLoginOTP(email, user.firstName, otpCode);

        res.json({
            success: true,
            message: 'Kode OTP telah dikirim ke email Anda',
            userId: user.id,
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
        await connectDB();
        const { userId, otpCode } = req.body;
        console.log('[LOGIN OTP] Received userId:', userId, 'Type:', typeof userId, 'OTP:', otpCode);

        // Normalize userId to integer if present
        let user = null;
        if (userId !== undefined && userId !== null) {
            const userIdInt = typeof userId === 'string' ? parseInt(userId, 10) : userId;
            if (userIdInt && !Number.isNaN(userIdInt)) {
                user = await User.findByPk(userIdInt);
            }
        }

        // Fallback: find by OTP code if userId is missing or lookup failed
        if (!user) {
            console.log('[LOGIN OTP] Fallback: searching by OTP code');
            user = await User.findOne({ where: { loginOtpCode: otpCode } });
        }

        console.log('[LOGIN OTP] User found:', user ? `Yes (${user.email})` : 'No');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
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
        user.loginOtpCode = null;
        user.loginOtpExpires = null;
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            message: 'Login berhasil',
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phone: user.phone
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

// Resend Login OTP
const resendLoginOtp = async (req, res) => {
    try {
        await connectDB();
        const { userId, email } = req.body;
        console.log('[RESEND LOGIN OTP] Received userId:', userId, 'email:', email);

        let user = null;
        if (userId) {
            const userIdInt = typeof userId === 'string' ? parseInt(userId, 10) : userId;
            if (userIdInt && !Number.isNaN(userIdInt)) {
                user = await User.findByPk(userIdInt);
            }
        }

        if (!user && email) {
            user = await User.findOne({ where: { email } });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ success: false, message: 'Email belum diverifikasi' });
        }

        // Generate new OTP
        const otpCode = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.loginOtpCode = otpCode;
        user.loginOtpExpires = otpExpires;
        await user.save();

        if (process.env.NODE_ENV !== 'production') {
            console.log(`[RESEND LOGIN OTP] OTP for ${user.email}:`, otpCode);
        }

        await sendLoginOTP(user.email, user.firstName, otpCode);

        res.json({
            success: true,
            message: 'Kode OTP baru telah dikirim ke email Anda',
            userId: user.id
        });
    } catch (error) {
        console.error('Resend login OTP error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengirim ulang OTP', error: error.message });
    }
};

// Forgot password - send OTP
// Forgot password - send reset link
const forgotPassword = async (req, res) => {
    try {
        await connectDB();
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Email tidak ditemukan' 
            });
        }

        // Generate reset token (random string)
        const resetToken = generateOTP() + Date.now().toString();
        const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = tokenExpires;
        await user.save();

        // Send email with reset link
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

// Reset password with token
const resetPassword = async (req, res) => {
    try {
        await connectDB();
        const { token, password } = req.body;

        console.log('[RESET PASSWORD] Received token:', token);

        if (!token || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Token dan password harus diisi' 
            });
        }

        // Find user by token
        const user = await User.findOne({ 
            where: { 
                resetPasswordToken: token
            } 
        });

        console.log('[RESET PASSWORD] User found:', user ? `Yes (${user.email})` : 'No');

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Token reset password tidak valid' 
            });
        }

        // Check if token expired
        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Token reset password sudah kadaluarsa. Silakan minta reset password ulang.' 
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        console.log('[RESET PASSWORD] Password updated for user:', user.email);

        res.json({
            success: true,
            message: 'Password berhasil direset. Silakan login dengan password baru Anda.'
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
    // New controller will be added below
    login,
    verifyLoginOtp,
    resendLoginOtp,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    logout
};
