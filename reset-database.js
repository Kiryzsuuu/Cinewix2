require('dotenv').config();
const mysql = require('mysql2/promise');

async function resetDatabase() {
    try {
        // Connect to MySQL
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || ''
        });

        console.log('Connected to MySQL');

        // Drop database if exists
        await connection.query('DROP DATABASE IF EXISTS cinewix');
        console.log('✅ Dropped old database');

        // Create database
        await connection.query('CREATE DATABASE cinewix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        console.log('✅ Created new database');

        await connection.end();
        
        // Now initialize with Sequelize
        const { connectDB } = require('./backend/config/mysql-database');
        await connectDB();
        
        console.log('\n✅ Database reset complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetDatabase();
