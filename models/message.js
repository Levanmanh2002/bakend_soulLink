const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        required: true
    },
}, { timestamps: true });

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;