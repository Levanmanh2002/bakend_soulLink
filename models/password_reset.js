const mongoose = require('mongoose');
const PasswordResetSchema = mongoose.Schema;

const PasswordChema = new PasswordResetSchema({
    userId: String,
    resetString: String,
    createdAt: Date,
    expiresAt: Date
})

const PasswordReset = mongoose.model('PasswordReset', PasswordChema);

module.exports = PasswordReset;
