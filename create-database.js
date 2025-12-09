// Create database if not exists
require('dotenv').config();
const mysql = require('mysql2/promise');

async function createDatabase() {
    try {
        console.log('Creating database...');
        
        // Connect without specifying database
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            port: process.env.MYSQL_PORT || 3311,
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || ''
        });
        
        // Create database
        await connection.query('CREATE DATABASE IF NOT EXISTS cinewix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        console.log('✅ Database "cinewix" created successfully!');
        
        await connection.end();
        
        // Now test connection with database
        console.log('\nTesting connection to cinewix database...');
        const { connectDB } = require('./backend/config/mysql-database');
        await connectDB();
        console.log('✅ All tables created successfully!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createDatabase();
