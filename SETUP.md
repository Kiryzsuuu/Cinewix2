# 🎬 CINEWIX - PANDUAN SETUP LENGKAP

## 📋 Langkah-langkah Setup

### 1️⃣ Persiapan Database MongoDB

Anda sudah memiliki connection string MongoDB:
```
mongodb+srv://maskiryz23_db_user:<db_password>@cinewix.8x11qy4.mongodb.net/?appName=cinewix
```

**Langkah:**
1. Buka file `.env`
2. Ganti `<db_password>` dengan password database Anda di `MONGODB_URI`
3. Pastikan koneksi internet stabil

### 2️⃣ Setup Email (Gmail)

**PENTING:** Untuk mengirim email, Anda perlu **App Password** dari Gmail.

**Cara mendapatkan Gmail App Password:**

1. Buka browser dan login ke: https://myaccount.google.com/
2. Klik **Security** di menu sebelah kiri
3. **Aktifkan 2-Step Verification:**
   - Scroll ke "Signing in to Google"
   - Klik "2-Step Verification"
   - Follow langkah-langkahnya untuk activate
4. **Generate App Password:**
   - Kembali ke halaman Security
   - Scroll ke bawah sampai "App passwords"
   - Klik "App passwords"
   - Pilih:
     - **Select app:** Mail
     - **Select device:** Other (Custom name)
   - Ketik: "Cinewix"
   - Klik **Generate**
5. **Copy Password:**
   - Akan muncul 16-digit password
   - Copy password ini (tanpa spasi)
6. **Paste ke .env:**
   - Buka file `.env`
   - Paste password ke `EMAIL_PASSWORD=...`

### 3️⃣ Install Dependencies

Buka terminal/PowerShell di folder project, jalankan:

```powershell
npm install
```

### 4️⃣ Setup Database dengan Sample Data

Isi database dengan 8 film terbaru:

```powershell
npm run seed
```

Output yang diharapkan:
```
MongoDB Connected
Existing movies cleared
Movies seeded successfully!
```

### 5️⃣ Start Server

```powershell
npm start
```

Output yang diharapkan:
```
╔════════════════════════════════════════╗
║                                        ║
║     🎬 CINEWIX SERVER RUNNING 🎬      ║
║                                        ║
║     Server: http://localhost:5000     ║
║     Environment: development              ║
║                                        ║
╚════════════════════════════════════════╝

MongoDB Connected: cinewix.8x11qy4.mongodb.net
Super Admin created successfully
```

### 6️⃣ Akses Aplikasi

Buka browser dan akses:
```
http://localhost:5000
```

---

## 🔐 Default Credentials

### Super Admin Account:
- **Email:** maskiryz23@gmail.com
- **Password:** hehehe

**Note:** Super Admin dibuat otomatis saat server pertama kali running.

---

## 🧪 Testing Flow

### Test 1: Registrasi User Baru

1. Buka http://localhost:5000/register.html
2. Isi form registrasi dengan email valid Anda
3. Klik "Daftar Sekarang"
4. Cek email Anda - akan ada email welcome dengan 6-digit code
5. Masukkan kode di halaman verifikasi
6. Jika berhasil, akan redirect ke halaman movies

### Test 2: Login

1. Buka http://localhost:5000/login.html
2. Login dengan:
   - Email: maskiryz23@gmail.com
   - Password: hehehe
3. Akan redirect ke movies page

### Test 3: Booking Tiket

1. Login terlebih dahulu
2. Pilih film yang ingin ditonton
3. Klik "Pesan Tiket"
4. Pilih tanggal, waktu, dan studio
5. Pilih kursi yang diinginkan
6. Review pesanan
7. Klik "Bayar Sekarang"
8. Cek email - akan ada email konfirmasi booking dengan detail lengkap

### Test 4: View My Bookings

1. Login terlebih dahulu
2. Buka http://localhost:5000/my-bookings.html
3. Lihat riwayat pemesanan Anda

---

## ⚠️ Troubleshooting

### Problem: "Cannot connect to MongoDB"

**Solusi:**
1. Pastikan password di `.env` sudah benar
2. Check koneksi internet
3. Pastikan tidak ada typo di connection string
4. Coba restart server

### Problem: "Email tidak terkirim"

**Solusi:**
1. Pastikan sudah menggunakan **App Password** (bukan password Gmail biasa)
2. Pastikan **2-Step Verification** Gmail sudah aktif
3. Check `EMAIL_USER` dan `EMAIL_PASSWORD` di `.env` sudah benar
4. Check spam folder di email

### Problem: "Super Admin tidak terbuat"

**Solusi:**
1. Check console log saat server start
2. Pastikan database connection berhasil
3. Coba hapus user dengan email maskiryz23@gmail.com dari database
4. Restart server

### Problem: "Movies tidak muncul"

**Solusi:**
1. Jalankan `npm run seed` untuk isi database dengan sample movies
2. Refresh halaman
3. Check console browser untuk error (F12 -> Console)

### Problem: Port 5000 sudah digunakan

**Solusi:**
1. Edit file `.env`
2. Ganti `PORT=5000` ke port lain, misalnya `PORT=3000`
3. Restart server
4. Akses di http://localhost:3000

---

## 📧 Email Templates

### 1. Welcome Email (Verification)
- Subject: "Selamat Datang di Cinewix - Verifikasi Akun Anda"
- Contains: 6-digit verification code
- Valid for: 5 minutes

### 2. Password Reset
- Subject: "Reset Password - Cinewix"
- Contains: Reset password link
- Valid for: 1 hour

### 3. Booking Confirmation
- Subject: "Konfirmasi Booking - [BOOKING_CODE]"
- Contains: 
  - Booking code
  - Movie details
  - Showtime & studio
  - Seats
  - Total price
  - Payment instructions

---

## 🎯 Next Steps

Setelah setup berhasil:

1. ✅ Test registrasi dengan email Anda sendiri
2. ✅ Test booking flow lengkap
3. ✅ Test forgot password feature
4. ✅ Login sebagai super admin
5. ✅ Explore admin features (user management, transactions)

---

## 📞 Support

Jika mengalami masalah:
1. Check console log di terminal untuk error message
2. Check browser console (F12 -> Console)
3. Pastikan semua konfigurasi di `.env` sudah benar
4. Restart server setelah mengubah `.env`

---

## 🎉 Selamat!

Aplikasi Cinewix Anda sudah siap digunakan!

Fitur yang tersedia:
- ✅ User Registration dengan Email Verification
- ✅ Login & Authentication
- ✅ Browse & Search Movies
- ✅ Interactive Seat Selection
- ✅ Booking System
- ✅ Email Notifications
- ✅ Admin Dashboard
- ✅ User Management
- ✅ Transaction Logs

**Happy Coding! 🚀**
