const { Sequelize } = require('sequelize');

// Explicitly require mysql2
const mysql2 = require('mysql2');

// Create Sequelize instance with better error handling
const sequelize = new Sequelize({
    dialect: 'mysql',
    dialectModule: mysql2,
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    database: process.env.MYSQL_DATABASE || 'cinewix',
    username: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: process.env.VERCEL ? 2 : 5,  // Reduce connection pool for serverless
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: process.env.MYSQL_SSL === 'true' ? {
        ssl: {
            rejectUnauthorized: true
        }
    } : {}
});

// Test connection
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Connection has been established successfully.');
        
        // Load models first
        const models = require('../models/mysql-models');
        
        // Sync all models (create tables if they don't exist)
        await sequelize.sync({ force: false });
        console.log('Database synchronized');
        
        // Create super admin if doesn't exist
        if (process.env.SUPER_ADMIN_EMAIL && process.env.SUPER_ADMIN_PASSWORD) {
            const bcrypt = require('bcryptjs');
            
            const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
            const superAdmin = await models.User.findOne({ where: { email: superAdminEmail } });
            
            if (!superAdmin) {
                const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 10);
                await models.User.create({
                    firstName: 'Super',
                    lastName: 'Admin',
                    email: superAdminEmail,
                    password: hashedPassword,
                    phone: '08123456789',
                    role: 'superadmin',
                    isVerified: true,
                    isPermanent: true
                });
                console.log('Super Admin created successfully');
            }
        }
        
        return sequelize;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
};

module.exports = { sequelize, connectDB };
