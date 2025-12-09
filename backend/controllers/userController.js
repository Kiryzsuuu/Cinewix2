const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { generateVerificationCode, sendWelcomeEmail } = require('../utils/emailService');

const fsPromises = fs.promises;

const ensureUploadDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        try {
            fs.mkdirSync(dirPath, { recursive: true });
        } catch (error) {
            // In serverless environments, directories may not be writable
            console.warn('Cannot create directory:', dirPath, error.message);
        }
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password -verificationCode -verificationExpires -resetPasswordToken -resetPasswordExpires');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil profil',
            error: error.message
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            firstName,
            lastName,
            displayName,
            email,
            phone
        } = req.body;

        const updateFields = {};
        const normalize = (value) => (typeof value === 'string' ? value.trim() : undefined);

        if (firstName !== undefined) {
            updateFields.firstName = normalize(firstName);
        }
        if (lastName !== undefined) {
            updateFields.lastName = normalize(lastName);
        }
        if (displayName !== undefined) {
            updateFields.displayName = normalize(displayName);
        }
        if (phone !== undefined) {
            updateFields.phone = normalize(phone);
        }

        let emailChanged = false;
        let verificationCode;
        if (email !== undefined) {
            const normalizedEmail = normalize(email)?.toLowerCase();
            if (normalizedEmail && normalizedEmail !== req.user.email) {
                const existingUser = await User.findOne({ email: normalizedEmail });
                if (existingUser && existingUser._id.toString() !== userId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email sudah digunakan oleh akun lain'
                    });
                }

                emailChanged = true;
                verificationCode = generateVerificationCode();
                updateFields.email = normalizedEmail;
                updateFields.isVerified = false;
                updateFields.verificationCode = verificationCode;
                updateFields.verificationExpires = new Date(Date.now() + 5 * 60 * 1000);
            }
        }

        if (!Object.keys(updateFields).length) {
            const currentUser = await User.findById(userId)
                .select('-password -verificationCode -verificationExpires -resetPasswordToken -resetPasswordExpires');
            return res.json({
                success: true,
                user: currentUser,
                needVerification: false
            });
        }

        const updatedUser = await User.findById(userId);

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        Object.assign(updatedUser, updateFields);
        await updatedUser.save();

        // Remove sensitive fields from response
        const userResponse = updatedUser.toObject();
        delete userResponse.password;
        delete userResponse.verificationCode;
        delete userResponse.verificationExpires;
        delete userResponse.resetPasswordToken;
        delete userResponse.resetPasswordExpires;

        if (emailChanged && verificationCode) {
            try {
                await sendWelcomeEmail(updatedUser.email, updatedUser.firstName, verificationCode);
            } catch (sendError) {
                console.error('Failed to send verification email:', sendError);
            }
        }

        res.json({
            success: true,
            user: userResponse,
            needVerification: emailChanged,
            userId: updatedUser._id
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memperbarui profil',
            error: error.message
        });
    }
};

const moveFileSafely = async (src, dest) => {
    try {
        await fsPromises.rename(src, dest);
    } catch (error) {
        if (error.code === 'EXDEV') {
            await fsPromises.copyFile(src, dest);
            await fsPromises.unlink(src);
        } else {
            throw error;
        }
    }
};

const deleteIfExists = async (filePath) => {
    try {
        await fsPromises.unlink(filePath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.warn('Failed to delete file:', filePath, error);
        }
    }
};

const updateProfilePhoto = async (req, res) => {
    // Note: File uploads are not persistent in Vercel serverless
    // Consider using cloud storage (Cloudinary, AWS S3, Vercel Blob) for production
    if (process.env.VERCEL) {
        return res.status(501).json({
            success: false,
            message: 'File upload tidak tersedia di deployment serverless. Gunakan cloud storage untuk production.'
        });
    }

    let targetPath;
    const tempPath = req.file?.path;

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'File foto tidak ditemukan'
            });
        }

        const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'avatars');
        ensureUploadDir(uploadDir);

        const user = await User.findById(req.user.id);
        if (!user) {
            await deleteIfExists(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        if (user.profilePhotoUrl && user.profilePhotoUrl.startsWith('/uploads/')) {
            const existingPath = path.join(__dirname, '..', '..', user.profilePhotoUrl.replace(/^\/+/, ''));
            await deleteIfExists(existingPath);
        }

        const filename = `${req.user.id}-${Date.now()}${path.extname(req.file.originalname)}`;
        targetPath = path.join(uploadDir, filename);

        await moveFileSafely(tempPath, targetPath);

        const publicPath = `/uploads/avatars/${filename}`;
        user.profilePhotoUrl = publicPath;
        await user.save();

        res.json({
            success: true,
            photoUrl: publicPath
        });
    } catch (error) {
        console.error('Update profile photo error:', error);
        if (targetPath) {
            try {
                await deleteIfExists(targetPath);
            } catch (cleanupError) {
                console.warn('Failed to delete uploaded file after error:', cleanupError);
            }
        }

        if (tempPath) {
            try {
                await deleteIfExists(tempPath);
            } catch (cleanupError) {
                console.warn('Failed to cleanup temp file:', cleanupError);
            }
        }
        res.status(500).json({
            success: false,
            message: error.message === 'File too large'
                ? 'Ukuran file melebihi batas 2 MB'
                : 'Terjadi kesalahan saat mengunggah foto',
            error: error.message
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    updateProfilePhoto
};
