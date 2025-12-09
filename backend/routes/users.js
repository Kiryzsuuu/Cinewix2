const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');
const { getProfile, updateProfile, updateProfilePhoto } = require('../controllers/userController');

const router = express.Router();

const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        try {
            fs.mkdirSync(dirPath, { recursive: true });
        } catch (error) {
            // In serverless, use /tmp directory
            if (error.code === 'EROFS' || error.code === 'ENOENT') {
                console.warn('Cannot create upload directory, using /tmp');
            } else {
                throw error;
            }
        }
    }
};

// Use /tmp in serverless environments (Vercel), uploads/tmp locally
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const tempDir = isServerless 
    ? path.join('/tmp', 'uploads') 
    : path.join(__dirname, '..', '..', 'uploads', 'tmp');

// Only try to create directory if not in serverless (will be created on demand)
if (!isServerless) {
    ensureDir(tempDir);
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        ensureDir(tempDir);
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const safeExt = ext ? ext.toLowerCase() : '';
        cb(null, `${req.user.id}-${Date.now()}${safeExt}`);
    }
});

const fileFilter = (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WEBP.'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
});

router.get('/me', authMiddleware, getProfile);
router.put('/me', authMiddleware, updateProfile);
router.patch('/me/photo', authMiddleware, (req, res, next) => {
    upload.single('photo')(req, res, (err) => {
        if (err) {
            const message = err.code === 'LIMIT_FILE_SIZE'
                ? 'Ukuran file melebihi batas 2 MB'
                : err.message || 'Gagal mengunggah foto';
            return res.status(400).json({
                success: false,
                message
            });
        }
        updateProfilePhoto(req, res, next);
    });
});

module.exports = router;
