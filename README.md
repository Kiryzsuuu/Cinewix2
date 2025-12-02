# 🎬 CINEWIX - Platform Pemesanan Tiket Bioskop

Platform pemesanan tiket bioskop online yang lengkap dengan sistem autentikasi, booking, payment, dan admin dashboard.

## 🚀 Fitur Utama

### User Features:
- ✅ **Registrasi dengan Email Verification** (Kode PIN 6 digit berlaku 5 menit)
- ✅ **Login & Logout** dengan JWT Authentication
- ✅ **Forgot Password** dengan reset link via email
- ✅ **Browse Movies** dengan search functionality
- ✅ **Booking Tiket** dengan pemilihan kursi interaktif
- ✅ **Payment System** dengan multiple payment methods
- ✅ **Email Notifications** untuk welcome, verification, booking confirmation
- ✅ **My Bookings** untuk melihat riwayat pemesanan
- ✅ **Responsive Design** dengan animasi smooth

### Admin Features:
- ✅ **Dashboard Statistics** (Total Users, Movies, Bookings, Revenue)
- ✅ **User Management** (Promote to admin, Delete users)
- ✅ **Transaction Logs** dengan detail lengkap
- ✅ **Movie Management** (CRUD operations)
- ✅ **Booking Management** (Update status)

### Super Admin:
- 📧 Email: `maskiryz23@gmail.com`
- 🔐 Password: `hehehe`
- 🛡️ **Permanent & Cannot be deleted**

## 📦 Tech Stack

**Backend:**
- Node.js & Express.js
- MongoDB (mongoose)
- JWT (jsonwebtoken)
- Nodemailer (email service)
- bcryptjs (password hashing)

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Responsive Design
- Smooth Animations

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Edit file `.env` dan sesuaikan dengan konfigurasi Anda:

```env
# MongoDB Configuration (ganti YOUR_PASSWORD_HERE dengan password database)
MONGODB_URI=mongodb+srv://maskiryz23_db_user:YOUR_PASSWORD_HERE@cinewix.8x11qy4.mongodb.net/cinewix?retryWrites=true&w=majority&appName=cinewix

# JWT Secret
JWT_SECRET=cinewix_super_secret_key_2024_change_this_in_production

# Email Configuration (Gmail SMTP)
# Untuk mendapatkan App Password Gmail:
# 1. Buka Google Account Settings
# 2. Security -> 2-Step Verification (aktifkan jika belum)
# 3. App passwords -> Generate new app password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=maskiryz23@gmail.com
EMAIL_PASSWORD=your_gmail_app_password_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
CLIENT_URL=http://localhost:5000

# Super Admin Configuration
SUPER_ADMIN_EMAIL=maskiryz23@gmail.com
SUPER_ADMIN_PASSWORD=hehehe
```

### 3. Seed Database dengan Film
```bash
npm run seed
```

Command ini akan mengisi database dengan 8 film terbaru.

### 4. Start Server
```bash
npm start
```

Untuk development dengan auto-reload:
```bash
npm run dev
```

Server akan berjalan di: **http://localhost:5000**

## 📧 Email Configuration Guide

### Setup Gmail App Password:

1. Login ke Google Account: https://myaccount.google.com/
2. Pilih **Security** di sidebar
3. Aktifkan **2-Step Verification** (jika belum aktif)
4. Scroll ke bawah, klik **App passwords**
5. Pilih **Mail** dan device nya **Other**
6. Masukkan nama: "Cinewix"
7. Klik **Generate**
8. Copy password yang dihasilkan (16 karakter tanpa spasi)
9. Paste ke `.env` file di `EMAIL_PASSWORD`

## 🗄️ Database Schema

### Collections:

**Users:**
- firstName, lastName, email, password (hashed)
- phone, role (user/admin/superadmin)
- isVerified, verificationCode, verificationExpires
- resetPasswordToken, resetPasswordExpires

**Movies:**
- title, description, genre[], duration
- rating, posterUrl, releaseDate
- director, cast[], language, ageRating

**Bookings:**
- user (ref), movie (ref)
- showtime { date, time, studio }
- seats[], totalPrice, bookingCode
- status, paymentStatus, paymentMethod

**Transactions:**
- booking (ref), user (ref)
- amount, paymentMethod, status
- transactionId

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email with code
- `POST /api/auth/resend-verification` - Resend verification code
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### Movies
- `GET /api/movies` - Get all movies
- `GET /api/movies/search?query=...` - Search movies
- `GET /api/movies/:id` - Get movie by ID
- `POST /api/movies` - Create movie (Admin only)
- `PUT /api/movies/:id` - Update movie (Admin only)
- `DELETE /api/movies/:id` - Delete movie (Admin only)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/available-seats` - Get available seats

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/transactions` - Get all transactions
- `GET /api/admin/bookings` - Get all bookings
- `PUT /api/admin/users/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/bookings/status` - Update booking status

## 🎨 Pages

- `/` - Homepage dengan featured movies
- `/movies.html` - Browse all movies dengan search
- `/login.html` - Login page
- `/register.html` - Registration page
- `/verify-email.html` - Email verification page
- `/booking.html` - Booking page dengan seat selection
- `/my-bookings.html` - User booking history
- `/admin-dashboard.html` - Admin dashboard (coming soon)

## 📱 Features Detail

### Email Notifications
1. **Welcome Email** - Dikirim saat registrasi dengan kode verifikasi 6 digit
2. **Password Reset** - Link reset password berlaku 1 jam
3. **Booking Confirmation** - E-ticket dengan detail lengkap dan informasi pembayaran

### Booking Flow
1. Pilih film
2. Pilih tanggal, waktu, dan studio
3. Pilih kursi (visual seat selector)
4. Review pesanan
5. Pilih metode pembayaran
6. Konfirmasi & terima email

### Security Features
- Password hashing dengan bcryptjs
- JWT authentication dengan HTTP-only cookies
- Email verification required
- Protected admin routes
- Super admin cannot be deleted

## 🐛 Troubleshooting

### Email tidak terkirim:
- Pastikan EMAIL_PASSWORD sudah benar (16 karakter App Password)
- Pastikan 2-Step Verification Gmail aktif
- Check firewall/antivirus tidak block port 587

### Cannot connect to MongoDB:
- Pastikan password database sudah benar di MONGODB_URI
- Check koneksi internet
- Pastikan IP address sudah di-whitelist di MongoDB Atlas

### Super Admin tidak terbuat:
- Server akan otomatis membuat super admin saat pertama kali connect ke database
- Check console log saat server start

## 📝 Notes

- Harga tiket: **Rp 50.000 per kursi**
- Verification code berlaku: **5 menit**
- Password reset link berlaku: **1 jam**
- Studio capacity: **50 kursi** (5 rows x 10 seats)

## 👨‍💻 Development

Untuk menambahkan fitur baru atau modify existing features, silakan lihat struktur folder:

```
cinewix3/
├── backend/
│   ├── config/          # Database config
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── utils/           # Helper functions (email, etc)
├── public/
│   └── js/
│       └── api.js       # Frontend API helper
├── *.html               # Frontend pages
├── style.css            # Global styles
├── server.js            # Main server file
└── .env                 # Environment variables
```

## 📄 License

© 2024 Cinewix. All rights reserved.

---

**Developed with ❤️ for Indonesian Cinema Lovers**
