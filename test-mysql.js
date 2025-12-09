// Test MySQL connection
require('dotenv').config();
const { connectDB, sequelize } = require('./backend/config/mysql-database');

async function testConnection() {
    try {
        console.log('Testing MySQL connection...');
        console.log('Config:', {
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            database: process.env.MYSQL_DATABASE,
            user: process.env.MYSQL_USER
        });
        
        await connectDB();
        console.log('✅ Connection successful!');
        
        // Test query
        const [results] = await sequelize.query('SELECT 1 + 1 AS result');
        console.log('Test query result:', results);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

testConnection();
