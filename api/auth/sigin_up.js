const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require('uuid');
const sendOTPEmailHtml = require('../html/auth_format');

const User = require("../../models/user");
const UserOTPVerification = require("../../models/user_otp_verification");

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log("Ready for messages");
        console.log(success);
    }
})

// signUp
router.post('/signup', async (req, res) => {
    try {
        const userData = req.body;
        const errors = [];

        const existingUserName = await User.findOne({ userName: userData.userName });
        if (existingUserName) {
            errors.push({
                code: 404,
                error: "userNameExists",
                message: "Tên người dùng được cung cấp đã tồn tại"
            });
        }

        const existingPhone = await User.findOne({ phone: userData.phone });
        if (existingPhone) {
            errors.push({
                code: 404,
                error: "phoneExists",
                message: "Số điện thoại được cung cấp đã tồn tại"
            });
        }

        const existingEmail = await User.findOne({ email: userData.email });
        if (existingEmail) {
            errors.push({
                code: 404,
                error: "emailExists",
                message: "Email được cung cấp đã tồn tại"
            });
        }

        if (!userData.password) {
            errors.push({
                code: 404,
                error: "missingPassword",
                message: "Vui lòng cung cấp mật khẩu"
            });
        }

        if (errors.length > 0) {
            return res.status(404).json({
                success: false,
                status: "validationErrors",
                message: "Liệt kê lỗi",
                errors: errors
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        const userId = uuidv4();
        const newUser = new User({
            userId,
            userName: userData.userName,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: hashedPassword,
            verified: false,
        });

        await newUser.save();

        newUser
            .save()
            .then((result) => {
                sendOTPVerificationEmail(result, res);
            })
            .catch(err => {
                res.status(404).json(err);
                res.json({
                    success: false,
                    status: "FAILED",
                    message: "Đã xảy ra lỗi khi lưu tài khoản người dùng!"
                });
            });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            status: "error",
            message: 'Lỗi máy chủ nội bộ'
        });
    }
});

// send otp verification email
const sendOTPVerificationEmail = async (user, res) => {
    try {
        const otp = `${Math.floor(100000 + Math.random() * 900000)}`;

        const remainingTime = new Date(Date.now() + (30 * 60 * 1000) - Date.now()).toISOString().substr(11, 8);
        // mail options
        const emailHtml = sendOTPEmailHtml.sendOTPEmailHtml
            .replace('$email', user.email)
            .replace('$otp', otp)
            .replace('$remainingTime', remainingTime);

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: user.email,
            subject: "Verify Your Email",
            html: emailHtml,
        }
        // hash the otp
        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp, saltRounds);
        const newOTPVerification = new UserOTPVerification({
            userId: user.userId,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000,
        });

        // save otp record
        await newOTPVerification.save();
        transporter.sendMail(mailOptions);
        res.status(201).json({
            success: true,
            status: "PENDING",
            message: "Đã gửi email xác minh otp",
            data: user,
        });
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message,
        });
    }
};

// verify otp email
router.post('/verifyOTP', async (req, res) => {
    try {
        let { userId, otp } = req.body;
        if (!userId || !otp) {
            return res.status(400).json({
                status: "FAILED",
                message: "Chi tiết otp trống không được phép",
            });
        } else {
            const UserOTPVerificationRecords = await UserOTPVerification.find({
                userId,
            });
            if (UserOTPVerificationRecords.length <= 0) {
                // no record found
                return res.status(404).json({
                    status: "userVerificationExists",
                    message: "Hồ sơ tài khoản không tồn tại hoặc đã được xác minh. Vui lòng đăng ký hoặc đăng nhập.",
                });
            } else {
                // user otp record exists
                const { expiresAt } = UserOTPVerificationRecords[0];
                const hashedOTP = UserOTPVerificationRecords[0].otp;

                if (expiresAt < Date.now()) {
                    // user otp record has expired
                    await UserOTPVerification.deleteMany({ userId });
                    return res.status(410).json({
                        status: "codeExpirationStatus",
                        message: "Mã đã hết hạn. Vui lòng yêu cầu lại.",
                    });
                } else {
                    const valiOTP = await bcrypt.compare(otp, hashedOTP);
                    if (!valiOTP) {
                        // supplied otp is wrong
                        return res.status(400).json({
                            status: "invalidOTPCode",
                            message: "Mã không hợp lệ.",
                        });
                    } else {
                        // success
                        await User.updateOne({ userId: userId }, { verified: true });
                        await UserOTPVerification.deleteMany({ userId });
                        res.status(201).json({
                            status: "VERIFIED",
                            message: "Email người dùng đã được xác minh thành công.",
                        });
                    }
                }
            }
        }
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message,
        });
    }
});

// resend verification
router.post('/resendOTPVerificationCode', async (req, res) => {
    try {
        let { userId, email } = req.body;

        if (!userId || !email) {
            throw Error("Empty user details are not allowed");
        } else {
            // delete axisting records and resend
            const existingUserIdUser = await User.findOne({ userId: userId });
            const existingEmailUser = await User.findOne({ email: email });

            if (!existingUserIdUser || !existingEmailUser) {
                return res.status(404).json({
                    status: "alreadyExists",
                    message: "Email hoặc userId đã tồn tại.",
                });
            }
            await UserOTPVerification.deleteMany({ userId });
            sendOTPVerificationEmail({ userId: userId, email }, res);
        }
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message,
        });
    }
});

module.exports = router;
