const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Generate 6-digit verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send welcome email with verification code
const sendWelcomeEmail = async (email, firstName, verificationCode) => {
    const mailOptions = {
        from: `"Cinewix" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Selamat Datang di Cinewix - Verifikasi Akun Anda',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #C9B59C, #D9CFC7); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .code-box { background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; border: 2px dashed #C9B59C; }
                    .code { font-size: 32px; font-weight: bold; color: #C9B59C; letter-spacing: 5px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .button { background: #C9B59C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="color: white; margin: 0;">🎬 CINEWIX</h1>
                        <p style="color: white; margin: 10px 0 0 0;">Selamat Datang!</p>
                    </div>
                    <div class="content">
                        <h2>Halo ${firstName}!</h2>
                        <p>Terima kasih telah mendaftar di Cinewix. Kami sangat senang Anda bergabung dengan kami!</p>
                        <p>Untuk mengaktifkan akun Anda, silakan gunakan kode verifikasi berikut:</p>
                        
                        <div class="code-box">
                            <p style="margin: 0; color: #666;">Kode Verifikasi Anda:</p>
                            <div class="code">${verificationCode}</div>
                            <p style="margin: 10px 0 0 0; color: #999; font-size: 14px;">Kode ini berlaku selama 5 menit</p>
                        </div>
                        
                        <p>Masukkan kode di atas pada halaman verifikasi untuk melanjutkan.</p>
                        
                        <p><strong>Keuntungan menjadi member Cinewix:</strong></p>
                        <ul>
                            <li>✓ Pemesanan tiket yang mudah dan cepat</li>
                            <li>✓ Pilih kursi favorit Anda</li>
                            <li>✓ Dapatkan promo dan diskon menarik</li>
                            <li>✓ Riwayat pemesanan yang tersimpan</li>
                        </ul>
                        
                        <p>Jika Anda tidak merasa mendaftar di Cinewix, abaikan email ini.</p>
                        
                        <div class="footer">
                            <p>© 2024 Cinewix. All rights reserved.</p>
                            <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    await transporter.sendMail(mailOptions);
};

// Send password reset email
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password.html?token=${resetToken}`;
    
    const mailOptions = {
        from: `"Cinewix" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset Password - Cinewix',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #C9B59C, #D9CFC7); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { background: #C9B59C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .warning { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="color: white; margin: 0;">🎬 CINEWIX</h1>
                        <p style="color: white; margin: 10px 0 0 0;">Reset Password</p>
                    </div>
                    <div class="content">
                        <h2>Halo ${firstName},</h2>
                        <p>Kami menerima permintaan untuk mereset password akun Anda.</p>
                        <p>Klik tombol di bawah ini untuk mereset password Anda:</p>
                        
                        <div style="text-align: center;">
                            <a href="${resetUrl}" class="button">Reset Password</a>
                        </div>
                        
                        <p>Atau copy dan paste link berikut ke browser Anda:</p>
                        <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">
                            ${resetUrl}
                        </p>
                        
                        <div class="warning">
                            <strong>⚠️ Penting:</strong> Link ini hanya berlaku selama 1 jam. Setelah itu, Anda perlu meminta reset password baru.
                        </div>
                        
                        <p>Jika Anda tidak meminta reset password, abaikan email ini dan password Anda tidak akan berubah.</p>
                        
                        <div class="footer">
                            <p>© 2024 Cinewix. All rights reserved.</p>
                            <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    await transporter.sendMail(mailOptions);
};

// Send booking confirmation email
const sendBookingConfirmation = async (email, firstName, bookingDetails) => {
    const { bookingCode, movieTitle, date, time, studio, seats, totalPrice } = bookingDetails;
    
    const mailOptions = {
        from: `"Cinewix" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Konfirmasi Booking - ${bookingCode}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #C9B59C, #D9CFC7); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .ticket-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px solid #C9B59C; }
                    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .detail-label { font-weight: bold; color: #666; }
                    .detail-value { color: #333; }
                    .total { background: #C9B59C; color: white; padding: 15px; text-align: center; border-radius: 5px; margin-top: 20px; font-size: 18px; }
                    .qr-code { text-align: center; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .payment-info { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="color: white; margin: 0;">🎬 CINEWIX</h1>
                        <p style="color: white; margin: 10px 0 0 0;">E-Ticket</p>
                    </div>
                    <div class="content">
                        <h2>Halo ${firstName}!</h2>
                        <p>Terima kasih telah memesan tiket di Cinewix. Berikut adalah detail pesanan Anda:</p>
                        
                        <div class="ticket-box">
                            <h3 style="text-align: center; color: #C9B59C; margin-top: 0;">DETAIL PESANAN</h3>
                            
                            <div class="detail-row">
                                <span class="detail-label">Kode Booking:</span>
                                <span class="detail-value" style="font-weight: bold; font-size: 18px;">${bookingCode}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Film:</span>
                                <span class="detail-value">${movieTitle}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Tanggal:</span>
                                <span class="detail-value">${date}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Waktu:</span>
                                <span class="detail-value">${time}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Studio:</span>
                                <span class="detail-value">${studio}</span>
                            </div>
                            
                            <div class="detail-row" style="border-bottom: none;">
                                <span class="detail-label">Kursi:</span>
                                <span class="detail-value">${seats.join(', ')}</span>
                            </div>
                            
                            <div class="total">
                                <strong>TOTAL PEMBAYARAN: Rp ${totalPrice.toLocaleString('id-ID')}</strong>
                            </div>
                        </div>
                        
                        <div class="payment-info">
                            <h4 style="margin-top: 0;">💳 Informasi Pembayaran</h4>
                            <p>Silakan lakukan pembayaran ke:</p>
                            <p><strong>Bank BCA</strong><br>
                            No. Rekening: 1234567890<br>
                            A/n: PT Cinewix Indonesia</p>
                            <p style="margin-bottom: 0;"><strong>Jumlah yang harus dibayar: Rp ${totalPrice.toLocaleString('id-ID')}</strong></p>
                        </div>
                        
                        <div class="qr-code">
                            <p style="font-size: 64px; margin: 0;">📱</p>
                            <p style="margin: 10px 0;">Tunjukkan email ini di bioskop</p>
                        </div>
                        
                        <p style="font-size: 14px; color: #666;">
                            <strong>Catatan:</strong><br>
                            - Harap tiba 15 menit sebelum waktu tayang<br>
                            - Tunjukkan e-ticket ini atau kode booking di kasir<br>
                            - Pembayaran harus dilakukan maksimal 1 jam setelah pemesanan<br>
                            - E-ticket tidak dapat diuangkan kembali
                        </p>
                        
                        <div class="footer">
                            <p>© 2024 Cinewix. All rights reserved.</p>
                            <p>Untuk bantuan, hubungi: info@cinewix.com atau (021) 1234-5678</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = {
    generateVerificationCode,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendBookingConfirmation
};
