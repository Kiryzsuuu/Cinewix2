// Vercel serverless function handler
// Don't load dotenv in production - Vercel provides env vars natively
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Set environment for Vercel
process.env.VERCEL = '1';

const app = require('../server');

// Export as serverless function
module.exports = app;
