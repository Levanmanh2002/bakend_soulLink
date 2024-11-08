const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const User = require('../../../models/user');
require('dotenv').config();

// Cấu hình multer để lưu trữ hình ảnh tạm thời trước khi upload lên Cloudinary
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/avatar');
    },
    filename: function (req, file, cb) {
        // cb(null, file.fieldname + '-' + Date.now());
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    allowedFormats: ['jpg', 'png'],

    limits: {
        fileSize: 1024 * 1024, // 1MB file size limit
    },
    fileFilter: function (req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('File must be an image.'));
        }
        cb(null, true);
    },
});

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: 'dzom8gp2e',
    api_key: '593899631997165',
    api_secret: 'U7ghx5SZ2SXCWK2NNH4MbTbM5L0'
});

// Xử lý upload hình ảnh avatar
router.post('/avatar', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded.');
        }
        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);
        // Update user with image URL
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { image: result.secure_url },
            { new: true }
        );
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
