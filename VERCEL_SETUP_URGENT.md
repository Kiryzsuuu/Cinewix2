# 🚨 URGENT: Setup Vercel Environment Variables

## Status Saat Ini
❌ **Error**: `ECONNREFUSED 127.0.0.1:3306`  
❌ **Penyebab**: Environment variables belum di-set di Vercel  
❌ **Dampak**: Aplikasi tidak bisa connect ke database

## Solusi Quick Fix

### Opsi 1: Gunakan PlanetScale (RECOMMENDED - FREE)

PlanetScale adalah MySQL database hosting yang compatible dengan Vercel dan memiliki free tier.

#### Step 1: Buat Database di PlanetScale
1. Daftar di https://planetscale.com (gratis)
2. Klik "Create database"
3. Pilih region terdekat (Asia - Singapore recommended)
4. Tunggu database dibuat

#### Step 2: Dapatkan Connection String
1. Buka database yang baru dibuat
2. Klik "Connect"
3. Pilih "Prisma" atau "General"
4. Copy informasi berikut:
   - Host
   - Username
   - Password
   - Database name

#### Step 3: Set Environment Variables di Vercel
1. Login ke https://vercel.com/dashboard
2. Pilih project **Cinewix2**
3. Buka **Settings** → **Environment Variables**
4. Tambahkan variable berikut (klik "Add" untuk setiap variable):

```
MYSQL_HOST=<your-planetscale-host>
MYSQL_PORT=3306
MYSQL_DATABASE=<your-database-name>
MYSQL_USER=<your-username>
MYSQL_PASSWORD=<your-password>
MYSQL_SSL=true
```

```
JWT_SECRET=cinewix_production_secret_key_2024_change_this_to_random_32_chars
```

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=maskiryz23@gmail.com
EMAIL_PASSWORD=gabxainqoilwhiml
```

```
NODE_ENV=production
```

```
SUPER_ADMIN_EMAIL=maskiryz23@gmail.com
SUPER_ADMIN_PASSWORD=hehehe
```

#### Step 4: Setup Database Tables
1. Install PlanetScale CLI atau gunakan web console
2. Jalankan SQL berikut di PlanetScale console:

```sql
CREATE TABLE IF NOT EXISTS `users` (
    `id` INTEGER auto_increment,
    `firstName` VARCHAR(100) NOT NULL,
    `lastName` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `role` ENUM('user', 'admin', 'superadmin') DEFAULT 'user',
    `isVerified` TINYINT(1) DEFAULT false,
    `isPermanent` TINYINT(1) DEFAULT false,
    `profilePhotoUrl` VARCHAR(500),
    `verificationCode` VARCHAR(10),
    `verificationExpires` DATETIME,
    `loginOtpCode` VARCHAR(10),
    `loginOtpExpires` DATETIME,
    `resetPasswordToken` VARCHAR(10),
    `resetPasswordExpires` DATETIME,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `movies` (
    `id` INTEGER auto_increment,
    `title` VARCHAR(255) NOT NULL,
    `genre` VARCHAR(100) NOT NULL,
    `duration` INTEGER NOT NULL COMMENT 'Duration in minutes',
    `rating` DECIMAL(2,1) NOT NULL,
    `director` VARCHAR(255) NOT NULL,
    `cast` TEXT NOT NULL,
    `synopsis` TEXT NOT NULL,
    `posterUrl` VARCHAR(500) NOT NULL,
    `releaseDate` DATE NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `showTimes` TEXT NOT NULL,
    `availableSeats` INTEGER NOT NULL DEFAULT 100,
    `isActive` TINYINT(1) DEFAULT true,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `bookings` (
    `id` INTEGER auto_increment,
    `userId` INTEGER NOT NULL,
    `movieId` INTEGER NOT NULL,
    `bookingCode` VARCHAR(20) NOT NULL UNIQUE,
    `showTime` VARCHAR(10) NOT NULL,
    `showDate` DATE NOT NULL,
    `seats` TEXT NOT NULL,
    `totalPrice` DECIMAL(10,2) NOT NULL,
    `paymentMethod` VARCHAR(50) NOT NULL,
    `status` ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'confirmed',
    `isUsed` TINYINT(1) DEFAULT false,
    `usedAt` DATETIME,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`movieId`) REFERENCES `movies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `transactions` (
    `id` INTEGER auto_increment,
    `userId` INTEGER NOT NULL,
    `bookingId` INTEGER NOT NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    `paymentMethod` VARCHAR(50) NOT NULL,
    `status` ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`bookingId`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
```

#### Step 5: Redeploy Vercel
1. Setelah set semua env variables, klik **"Redeploy"** di Vercel
2. Atau push commit baru ke GitHub (auto-deploy)

---

### Opsi 2: Railway MySQL (Alternative)

1. Daftar di https://railway.app (free tier $5 credit)
2. Create New Project → MySQL
3. Copy connection details
4. Set di Vercel environment variables (sama seperti di atas)

---

### Opsi 3: AWS RDS / Azure / Other MySQL Hosting

Jika Anda sudah punya MySQL hosting lain, gunakan credential nya dan set di Vercel environment variables.

---

## Checklist Setup

- [ ] Database hosting sudah dibuat (PlanetScale/Railway/etc)
- [ ] MYSQL_HOST di-set di Vercel
- [ ] MYSQL_PORT di-set di Vercel
- [ ] MYSQL_DATABASE di-set di Vercel
- [ ] MYSQL_USER di-set di Vercel
- [ ] MYSQL_PASSWORD di-set di Vercel
- [ ] MYSQL_SSL=true di-set di Vercel (jika pakai PlanetScale)
- [ ] JWT_SECRET di-set di Vercel
- [ ] EMAIL variables di-set di Vercel
- [ ] NODE_ENV=production di-set di Vercel
- [ ] Tables sudah dibuat di database
- [ ] Vercel sudah di-redeploy

---

## Testing Setelah Setup

Setelah redeploy, test endpoint berikut:

1. Health check:  
   https://cinewix2.vercel.app/api/health

2. Movies API:  
   https://cinewix2.vercel.app/api/movies

3. Homepage:  
   https://cinewix2.vercel.app/

Jika berhasil, Anda akan melihat data movies dan tidak ada error 500.

---

## Troubleshooting

### Error: "ECONNREFUSED"
- Environment variables belum di-set atau salah
- Database hosting tidak allow external connections

### Error: "Unknown database"
- Database name salah
- Tables belum dibuat

### Error: "Access denied"
- Username atau password salah
- Check credentials di database hosting

---

## Catatan Penting

⚠️ **JANGAN gunakan localhost/XAMPP untuk production Vercel!**  
⚠️ Vercel adalah serverless platform, tidak bisa connect ke komputer lokal Anda.  
⚠️ Harus menggunakan database hosting eksternal yang bisa diakses via internet.

📝 **Free tier recommendations:**
- PlanetScale: 1 database gratis, 10GB storage
- Railway: $5 credit/month (cukup untuk development)
- Clever Cloud: MySQL free tier available
