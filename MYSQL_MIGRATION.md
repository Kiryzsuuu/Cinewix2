# Migrasi ke MySQL (XAMPP)

## Setup XAMPP

1. **Pastikan XAMPP sudah terinstall**
2. **Edit konfigurasi MySQL di XAMPP**:
   - Buka `C:\xampp\mysql\bin\my.ini`
   - Cari baris `port=3306`
   - Ganti menjadi `port=3311`
   - Save dan restart MySQL di XAMPP Control Panel

3. **Buat database**:
   - Buka phpMyAdmin: `http://localhost/phpmyadmin`
   - Klik "New" untuk buat database baru
   - Nama database: `cinewix`
   - Collation: `utf8mb4_unicode_ci`
   - Klik "Create"

## Update Environment Variables

File `.env` sudah diupdate dengan:
```
MYSQL_HOST=localhost
MYSQL_PORT=3311
MYSQL_DATABASE=cinewix
MYSQL_USER=root
MYSQL_PASSWORD=
```

## Instalasi Dependencies

Dependencies MySQL sudah terinstall:
- ✅ `mysql2` - MySQL driver
- ✅ `sequelize` - ORM untuk MySQL

## File-File Baru

1. **backend/config/mysql-database.js** - Konfigurasi koneksi MySQL
2. **backend/models/mysql-models.js** - Model untuk User, Movie, Booking, Transaction

## Yang Perlu Diupdate

Semua controller masih menggunakan syntax MongoDB. Perlu diupdate ke Sequelize:

### MongoDB vs Sequelize Syntax

```javascript
// MongoDB
const user = await User.findOne({ email });
const user = await User.findById(userId);
await User.create({ ... });
await user.save();

// Sequelize
const user = await User.findOne({ where: { email } });
const user = await User.findByPk(userId);
await User.create({ ... });
await user.save(); // sama
```

### Files yang perlu diupdate:
- [x] `backend/controllers/authController.js` - PARTIAL (register done)
- [ ] `backend/controllers/movieController.js`
- [ ] `backend/controllers/bookingController.js`
- [ ] `backend/controllers/adminController.js`
- [ ] `backend/middleware/auth.js`

## Testing

Setelah semua diupdate, jalankan:

```bash
npm start
```

Database tables akan otomatis dibuat oleh Sequelize.

## Keuntungan MySQL:
- ✅ Local development (tidak perlu internet)
- ✅ Lebih mudah di-debug dengan phpMyAdmin
- ✅ Tidak ada masalah serverless/middleware
- ✅ Gratis tanpa batasan

## Next Steps:

1. Pastikan XAMPP MySQL running di port 3311
2. Buat database 'cinewix' di phpMyAdmin
3. Saya akan lanjutkan update semua controllers ke Sequelize syntax
4. Test registrasi

Mau saya lanjutkan update semua controller sekarang?
