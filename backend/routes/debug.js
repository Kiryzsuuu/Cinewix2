const express = require('express');
const router = express.Router();

// Debug endpoint - check environment variables (remove after debugging)
router.get('/env-check', (req, res) => {
    res.json({
        success: true,
        environment: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
        mongoConfigured: !!process.env.MONGODB_URI,
        jwtConfigured: !!process.env.JWT_SECRET,
        emailConfigured: {
            host: !!process.env.EMAIL_HOST,
            port: !!process.env.EMAIL_PORT,
            user: !!process.env.EMAIL_USER,
            pass: !!process.env.EMAIL_PASSWORD
        }
    });
});

module.exports = router;
