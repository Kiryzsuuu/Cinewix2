const express = require('express');
const router = express.Router();
const {
    register,
    verifyEmail,
    resendVerificationCode,
    login,
    verifyLoginOtp,
    resendLoginOtp,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    logout
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationCode);
router.post('/login', login);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/resend-login-otp', resendLoginOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, logout);

module.exports = router;
