const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const JWT_KEY = process.env.JWT_KEY;

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_KEY, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    status: "UNAUTHORIZED",
                    message: "Token đã hết hạn"
                });
            } else {
                return res.status(403).json({
                    success: false,
                    status: "FORBIDDEN",
                    message: "Token không hợp lệ"
                });
            }
        };
        req.user = user;
        next();
    });
}

router.get('/profile', authenticateToken, (req, res) => {
    res.status(200).json({
        success: true,
        status: "SUCCESS",
        message: "Thông tin hồ sơ",
        data: req.user
    });
});

module.exports = router;
