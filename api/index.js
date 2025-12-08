// Vercel serverless function handler
require('dotenv').config();

// Set environment for Vercel
process.env.VERCEL = '1';

const app = require('../server');

// Export as serverless function
module.exports = app;
