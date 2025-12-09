// Load environment variables (only for local development)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

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
        console.log('Using cached database connection');
        return cachedDb;
    }
    
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        cachedDb = conn;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Auto-seed database if empty
        const { autoSeedDatabase } = require('./backend/utils/autoSeed');
        await autoSeedDatabase();
        
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
        console.error('Full error:', error);
        throw error;
    }
}

// Connect to database for local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    connectDB().catch(err => {
        console.error('Initial DB connection failed:', err.message);
    });
}

// Middleware
app.use(cors({
    origin: process.env.VERCEL ? true : (process.env.CLIENT_URL || 'http://localhost:5000'),
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files FIRST (before DB middleware)
// Explicitly serve public folder
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/style.css', express.static(path.join(__dirname, 'style.css')));
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint (no DB needed)
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running',
        env: process.env.NODE_ENV,
        mongoConnected: mongoose.connection.readyState === 1
    });
});

// Explicit routes for static files
app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'style.css'));
});

app.get('/public/js/api.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'js', 'api.js'));
});

app.get('/public/css/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'css', 'style.css'));
});

// API Routes
app.use('/api/debug', require('./backend/routes/debug'));
app.use('/api/seed', require('./backend/routes/seed'));
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

app.get('/movies.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'movies.html'));
});

app.get('/schedule.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'schedule.html'));
});

app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/booking.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'booking.html'));
});

app.get('/my-bookings.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'my-bookings.html'));
});

app.get('/my-profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'my-profile.html'));
});

app.get('/admin-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

app.get('/verify-email.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'verify-email.html'));
});

app.get('/movie-detail.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'movie-detail.html'));
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
