// Vercel serverless function handler
try {
    // Don't load dotenv in production - Vercel provides env vars natively
    if (process.env.NODE_ENV !== 'production') {
        require('dotenv').config();
    }

    // Set environment for Vercel
    process.env.VERCEL = '1';

    const app = require('../server');

    // Export as serverless function
    module.exports = app;
} catch (error) {
    console.error('Fatal error loading app:', error);
    
    // Export error handler if app fails to load
    module.exports = (req, res) => {
        res.status(500).json({
            success: false,
            message: 'Server initialization failed',
            error: error.message
        });
    };
}
