exports.sendOTPEmailHtml = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Verify Your Email</title>
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
                        <h1>Hello<h4>$email</h4></h1>
                        <p>Hãy nhập dãy gồm 6 số sau vào ứng dụng để xác minh địa chỉ email của bạn và hoàn tất quá trình đăng ký.</p>
                        <p>Mã xác minh của bạn là:</p>
                        <p class="code">$otp</p>
                        <p class="note"><span class="bold">Lưu ý:</span> đường dẫn chỉ có hiệu lực trong vòng $remainingTime. Vui lòng nhập mã xác minh trong thời gian này.</p>
                    </div>
                </body>
            </html>
        `;