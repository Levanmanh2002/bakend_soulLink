const express = require('express');
const router = express.Router();

const User = require("../../models/user");

const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');

const activeResetRequests = {};

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
});

router.post('/reset-password', async (req, res) => {
    try {
        const email = req.body.email;

        const currentTime = Date.now();
        if (activeResetRequests[email] && currentTime - activeResetRequests[email] < 5 * 60 * 1000) {
            return res.status(429).json({
                status: "requestsExists",
                message: "Too many requests. Please wait before requesting again."
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            res.status(400).json({
                status: "emailExists",
                message: "Email not found"
            });
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        const expirationTime = currentTime + (30 * 60 * 1000);
        user.verificationCode = verificationCode;
        user.resetTokenExpiration = expirationTime;

        await user.save();

        const remainingTime = new Date(expirationTime - currentTime).toISOString().substr(11, 8);
        const emailHtml = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Password Reset Email</title>
                    <style>
                        body, h1, p {
                            margin: 0;
                            padding: 0;
                        }
                        .card {
                            background-color: #feeefc;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                            margin: 20px auto;
                            max-width: 500px;
                            padding: 20px;
                            text-align: center;
                        }
                        h1 {
                            color: #ff00cc;
                            font-size: 24px;
                            margin-bottom: 15px;
                        }
                        p {
                            color: #555;
                            font-size: 16px;
                            margin-bottom: 20px;
                        }
                        .code {
                            color: #000;
                            font-size: 30px;
                            font-weight: bold;
                            margin: 20px 0;
                        }
                        .note {
                            color: #888;
                            font-size: 14px;
                            margin-top: 15px;
                        }
                        .bold {
                            color: #000;
                            font-weight: bold;
                        }
                        .icons {
                            display: flex;
                            justify-content: center;
                            margin-top: 30px;
                        }
                        .icon {
                            font-size: 24px;
                            margin: 0 10px;
                            color: #333;
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>Hello<h4>${email}</h4></h1>
                        <p>Chúng tôi đã nhận được yêu cầu thay đổi mật khẩu của quý khách</p>
                        <p>Mã xác minh của bạn là:</p>
                        <p class="code">${verificationCode}</p>
                        <p>Vui lòng nhập mã này để đặt lại mật khẩu của bạn</p>
                        <p class="note"><span class="bold">Lưu ý:</span> đường dẫn chỉ có hiệu lực trong vòng ${remainingTime}. Vui lòng đổi mật khẩu trong thời gian này.</p>
                    </div>
                </body>
            </html>
        `;

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: 'Password Reset Verification Code',
            html: emailHtml
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.log(error);
            } else {
                activeResetRequests[email] = currentTime;
                res.status(201).json({
                    status: "SUCCESS",
                    message: "Check your email for the password reset"
                });
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "serverFAILED",
            message: "Internal Server Error"
        });
    }
});


router.post('/recover-account', async (req, res) => {
    try {
        const { verificationCode, newPassword } = req.body;
        const user = await User.findOne({ verificationCode });

        if (!user) {
            return res.status(400).json({
                status: 'verifiExists',
                message: 'Invalid verification code'
            });
        }

        if (user.resetTokenExpiration < Date.now()) {
            return res.status(400).json({
                status: 'expiredExists',
                message: 'Verification code has expired'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.verificationCode = null;
        user.resetTokenExpiration = null;
        await user.save();

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Password reset successful',
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Internal Server Error'
        });
    }
});

module.exports = router;