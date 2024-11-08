const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserOTPverificationSchema = new Schema({
    userId: String,
    otp: String,
    createdAt: Date,
    expiresAt: Date
});

const UserOTPVerification = mongoose.model('UserOTPVerification', UserOTPverificationSchema);

module.exports = UserOTPVerification;