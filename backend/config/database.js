const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Create super admin if doesn't exist
        const User = require('../models/User');
        const bcrypt = require('bcryptjs');
        
        const superAdmin = await User.findOne({ email: process.env.SUPER_ADMIN_EMAIL });
        
        if (!superAdmin) {
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
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
