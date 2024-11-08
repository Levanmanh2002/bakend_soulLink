const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userId: String,
    userName: String,
    name: String,
    email: String,
    phone: String,
    password: String,
    image: String,
    backgroundImage: String,
    dateOfBirth: Date,
    sex: Number,
    verified: Boolean,
    verificationCode: String,
    resetTokenExpiration: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.userName;
    delete user.password;
    return user;
};


const User = mongoose.model('User', UserSchema);

module.exports = User;