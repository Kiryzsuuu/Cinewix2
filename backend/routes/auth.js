const express = require('express');
const router = express.Router();
const {
    register,
    verifyEmail,
    resendVerificationCode,
    login,
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
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, logout);

module.exports = router;
