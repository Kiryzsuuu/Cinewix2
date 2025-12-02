const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');
const { getProfile, updateProfile, updateProfilePhoto } = require('../controllers/userController');

const router = express.Router();

const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const tempDir = path.join(__dirname, '..', '..', 'uploads', 'tmp');
ensureDir(tempDir);

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        ensureDir(tempDir);
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const safeExt = ext ? ext.toLowerCase() : '';
        cb(null, `${req.user._id}-${Date.now()}${safeExt}`);
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
