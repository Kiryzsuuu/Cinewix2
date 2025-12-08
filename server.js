require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Database connection with caching for serverless
let cachedDb = null;

async function connectDB() {
    if (cachedDb) {
        return cachedDb;
    }
    
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        cachedDb = conn;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Create super admin if doesn't exist (only in non-serverless)
        if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
            const User = require('./backend/models/User');
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
        console.error(`Database Error: ${error.message}`);
        throw error;
    }
}

// Connect to database for local development
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    connectDB();
}

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection middleware for serverless
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('Database connection failed:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Database connection failed' 
        });
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/movies', require('./backend/routes/movies'));
app.use('/api/bookings', require('./backend/routes/bookings'));
app.use('/api/admin', require('./backend/routes/admin'));
app.use('/api/users', require('./backend/routes/users'));

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════╗
║                                        ║
║     🎬 CINEWIX SERVER RUNNING 🎬      ║
║                                        ║
║     Server: http://localhost:${PORT}     ║
║     Environment: ${process.env.NODE_ENV || 'development'}              ║
║                                        ║
╚════════════════════════════════════════╝
        `);
    });
}

// Export for Vercel
module.exports = app;
