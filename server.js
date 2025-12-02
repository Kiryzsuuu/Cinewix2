require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./backend/config/database');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
