const mongoose = require('mongoose');

// Cache connection for serverless
let cachedConnection = null;

const connectDB = async () => {
    // Return cached connection if available
    if (cachedConnection && mongoose.connection.readyState === 1) {
        console.log('Using cached database connection');
        return cachedConnection;
    }

    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI);
        cachedConnection = conn;
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Create super admin if doesn't exist (only in non-serverless or first connection)
        if (!process.env.VERCEL) {
            const User = require('../models/User');
            const bcrypt = require('bcryptjs');
            
            const superAdmin = await User.findOne({ email: process.env.SUPER_ADMIN_EMAIL });
            
            if (!superAdmin && process.env.SUPER_ADMIN_EMAIL && process.env.SUPER_ADMIN_PASSWORD) {
                const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 10);
                await User.create({
                    firstName: 'Super',
                    lastName: 'Admin',
                    email: process.env.SUPER_ADMIN_EMAIL,
                    password: hashedPassword,
                    phone: '08123456789',
                    role: 'superadmin',
                    isVerified: true,
                    isPermanent: true
                });
                console.log('Super Admin created successfully');
            }
        }
        
        return conn;
    } catch (error) {
        console.error(`Database connection error: ${error.message}`);
        throw error; // Don't exit process in serverless
    }
};

module.exports = connectDB;
