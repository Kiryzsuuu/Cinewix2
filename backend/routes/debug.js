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

// Test register endpoint without database
router.post('/test-register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;
        
        // Just echo back the data
        res.json({
            success: true,
            message: 'Test successful - data received',
            receivedData: {
                firstName,
                lastName,
                email,
                phone: phone ? 'present' : 'missing',
                password: password ? 'present' : 'missing'
            },
            dependencies: {
                bcrypt: require('bcryptjs') ? 'loaded' : 'missing',
                User: 'skipped for test'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

module.exports = router;
