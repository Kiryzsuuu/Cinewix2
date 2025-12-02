# ⚠️ PENTING - CATATAN KONFIGURASI

## 🔧 Yang Harus Anda Lakukan Sebelum Running:

### 1. Edit file `.env` - WAJIB!

Buka file `.env` dan ubah:

#### MongoDB Password:
```env
# SEBELUM (line 2):
MONGODB_URI=mongodb+srv://maskiryz23_db_user:YOUR_PASSWORD_HERE@cinewix...

# SESUDAH (ganti YOUR_PASSWORD_HERE dengan password database Anda):
MONGODB_URI=mongodb+srv://maskiryz23_db_user:PASSWORD_ANDA_DISINI@cinewix.8x11qy4.mongodb.net/cinewix?retryWrites=true&w=majority&appName=cinewix
```

#### Gmail App Password:
```env
# SEBELUM (line 12):
EMAIL_PASSWORD=your_gmail_app_password_here

# SESUDAH (ganti dengan 16-digit App Password dari Gmail):
EMAIL_PASSWORD=abcd efgh ijkl mnop  
# (Contoh format, tanpa spasi sebenarnya: abcdefghijklmnop)
```

### 2. Cara Mendapatkan Gmail App Password

**STEP BY STEP:**

1. Buka: https://myaccount.google.com/
2. Klik **"Security"** (menu kiri)
3. Scroll ke **"How you sign in to Google"**
4. Klik **"2-Step Verification"** → Aktifkan jika belum
5. Kembali ke Security page
6. Scroll ke **"App passwords"** (di bawah 2-Step Verification)
7. Klik **"App passwords"**
8. Mungkin diminta login lagi
9. Di halaman App passwords:
   - **Select app:** Mail
   - **Select device:** Other (Custom name)
   - Ketik: **Cinewix**
   - Klik **"Generate"**
10. **COPY** 16-digit password yang muncul
11. **PASTE** ke `.env` file di `EMAIL_PASSWORD`

**CONTOH:**
```
Generated password: abcd efgh ijkl mnop

Di .env file paste sebagai:
EMAIL_PASSWORD=abcdefghijklmnop
(tanpa spasi!)
```

---

## 🚀 Cara Menjalankan Aplikasi

### Step 1: Install Dependencies
```powershell
npm install
```

### Step 2: Seed Database (Isi Film)
```powershell
npm run seed
```

**Output yang benar:**
```
MongoDB Connected
Existing movies cleared
Movies seeded successfully!
```

### Step 3: Start Server
```powershell
npm start
```

**Output yang benar:**
```
╔════════════════════════════════════════╗
║     🎬 CINEWIX SERVER RUNNING 🎬      ║
║     Server: http://localhost:5000     ║
╚════════════════════════════════════════╝

MongoDB Connected: cinewix.8x11qy4.mongodb.net
Super Admin created successfully
```

### Step 4: Buka Browser
```
http://localhost:5000
```

---

## ✅ Checklist Setup

- [ ] Edit `.env` - ganti MongoDB password
- [ ] Edit `.env` - ganti Gmail App Password
- [ ] Run `npm install`
- [ ] Run `npm run seed`
- [ ] Run `npm start`
- [ ] Buka http://localhost:5000
- [ ] Test registrasi dengan email Anda
- [ ] Cek email untuk verification code
- [ ] Test login
- [ ] Test booking tiket

---

## 🔑 Default Login Super Admin

Setelah server running, Anda bisa login sebagai super admin:

**Email:** maskiryz23@gmail.com
**Password:** hehehe

Super admin dapat:
- Manage users (promote/delete)
- View all transactions
- View all bookings
- Manage movies (create/update/delete)

---

## 🐛 Common Errors & Solutions

### Error: "Cannot find module 'express'"
**Solusi:** Run `npm install`

### Error: "MongoNetworkError: failed to connect"
**Solusi:** 
- Check internet connection
- Pastikan password MongoDB di `.env` benar
- Tidak ada typo di connection string

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Solusi:**
- Pastikan menggunakan **App Password**, BUKAN password Gmail biasa
- Pastikan 2-Step Verification sudah aktif
- Generate ulang App Password jika perlu

### Error: "Address already in use :::5000"
**Solusi:**
- Port 5000 sudah dipakai aplikasi lain
- Ganti `PORT=5000` di `.env` ke `PORT=3000`
- Restart server

---

## 📧 Test Email Feature

Untuk test apakah email berfungsi:

1. Register dengan **email Anda sendiri** (bukan maskiryz23@gmail.com)
2. Tunggu beberapa detik
3. Check inbox email Anda
4. Jika tidak ada, check **Spam folder**
5. Seharusnya ada email dari "Cinewix" dengan kode 6 digit

Jika email tidak masuk dalam 1 menit:
- Check `.env` EMAIL_USER dan EMAIL_PASSWORD sudah benar
- Check console log server untuk error message
- Pastikan menggunakan App Password yang benar

---

## 💡 Tips

1. **Selalu check console log** saat ada error
2. **Restart server** setelah mengubah `.env`
3. **Clear browser cache** jika tampilan tidak update
4. **Use Incognito mode** untuk test registrasi/login

---

## 📱 Features to Test

1. ✅ Homepage - lihat featured movies
2. ✅ Movies page - browse dan search
3. ✅ Registration - dengan email verification
4. ✅ Login - dengan redirect
5. ✅ Forgot password - test reset flow
6. ✅ Booking - pilih film, kursi, payment
7. ✅ My Bookings - lihat history
8. ✅ Admin login - manage users & transactions

---

## 🎬 Selamat Mencoba!

Jika ada pertanyaan atau error, check:
1. Console log di terminal (backend errors)
2. Browser console (F12 -> Console) (frontend errors)
3. File README.md dan SETUP.md untuk panduan lengkap

**Good luck! 🚀**
