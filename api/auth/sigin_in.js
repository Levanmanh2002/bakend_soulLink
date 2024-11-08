const express = require('express');
const router = express.Router();

const User = require("../../models/user");

const bcrypt = require("bcrypt");

const jwt = require('jsonwebtoken');
const JWT_KEY = process.env.JWT_KEY;

// signIn
router.post('/signin', async (req, res) => {
    let { identifier, password } = req.body;
    identifier = identifier.trim();
    password = password.trim();

    try {

        if (identifier == "" || password == "") {
            return res.status(404).json({
                status: 404,
                error: "FAILED",
                message: "Thông tin xác thực trống"
            });
        }

        const user = await User.findOne({
            $or: [
                { email: identifier },
                { userName: identifier },
                { phone: identifier }
            ]
        })

        if (!user) {
            return res.status(404).json({
                success: false,
                status: "invalid_credentials",
                message: "Tài khoản không hợp lệ!"
            });
        } else {
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                return res.status(404).json({
                    success: false,
                    status: "invalid_password",
                    message: "Mật khẩu không hợp lệ!"
                });
            }
        }

        if (!user.verified) {
            return res.status(404).json({
                success: false,
                status: "not_verified",
                message: "Tài khoản chưa được xác minh. Vui lòng hãy xác minh."
            });
        }

        const userObject = user.toObject();
        delete userObject.password;

        /// 1h tồn tại token
        const token = jwt.sign(userObject, JWT_KEY, { expiresIn: "1h" });

        /// token không hết hạn
        // const token = jwt.sign(userObject, JWT_KEY, { expiresIn: "Infinity" });

        /// token tồn tại trong 24h, 48h
        // const token = jwt.sign(userObject, JWT_KEY, { expiresIn: "24h" });
        // const token = jwt.sign(userObject, JWT_KEY, { expiresIn: "48h" });

        return res.status(200).json({
            success: true,
            status: "SUCCESS",
            message: "Đăng nhập thành công",
            token: token
        });


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            status: "error",
            message: "Lỗi máy chủ nội bộ"
        });
    }

});

module.exports = router;
