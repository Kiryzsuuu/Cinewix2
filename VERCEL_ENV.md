# Environment Variables untuk Vercel

Untuk deploy aplikasi Cinewix ke Vercel, Anda perlu mengatur environment variables berikut di dashboard Vercel:

## Database MySQL (Wajib)

```
MYSQL_HOST=<your-mysql-host>
MYSQL_PORT=3306
MYSQL_DATABASE=cinewix
MYSQL_USER=<your-mysql-username>
MYSQL_PASSWORD=<your-mysql-password>
MYSQL_SSL=false
```

**Catatan:** 
- Untuk MySQL di Vercel, Anda perlu menggunakan database hosting eksternal seperti:
  - PlanetScale (recommended, free tier available)
  - Railway
  - AWS RDS
  - Azure MySQL
- Tidak bisa menggunakan localhost atau XAMPP untuk production

## JWT Secret (Wajib)

```
JWT_SECRET=<your-secret-key-min-32-characters>
```

## Email Configuration (Wajib untuk verifikasi & OTP)

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-gmail-address>
EMAIL_PASSWORD=<your-gmail-app-password>
```

**Cara mendapatkan Gmail App Password:**
1. Buka https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Generate App Password untuk "Mail"
4. Gunakan 16-digit password tersebut

## Server Configuration

```
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-vercel-domain.vercel.app
```

## Super Admin (Opsional)

```
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=<your-admin-password>
```

---

## Cara Setup di Vercel Dashboard

1. Login ke https://vercel.com
2. Pilih project Cinewix2
3. Buka Settings → Environment Variables
4. Tambahkan semua variable di atas
5. Pilih environment: Production, Preview, Development (atau sesuai kebutuhan)
6. Save dan redeploy

---

## Testing Database Connection

Setelah setup, test dengan mengakses:
```
https://your-vercel-domain.vercel.app/api/health
```

Jika berhasil, akan menampilkan:
```json
{
  "success": true,
  "message": "Server is running",
  "env": "production"
}
```

## Troubleshooting

### Error: "Please install mysql2 package manually"
- Pastikan `mysql2` ada di dependencies package.json
- Redeploy dari GitHub

### Error: "Unknown database 'cinewix'"
- Database belum dibuat di hosting MySQL
- Buat database manual via phpMyAdmin/panel hosting
- Atau jalankan setup query dari `database-setup.sql`

### Error: "Connection refused"
- Cek MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD
- Pastikan MySQL hosting mengizinkan koneksi eksternal
- Whitelist IP Vercel jika perlu

### Error: "ECONNREFUSED"
- MySQL host tidak bisa diakses dari Vercel
- Gunakan database hosting yang support koneksi eksternal
- Tidak bisa pakai localhost/XAMPP
