const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const FriendSchema = new Schema({
    userId: mongoose.Schema.Types.ObjectId,
    friendId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted'],
        default: 'pending'
    }
});


const Friend = mongoose.model('Friend', FriendSchema);

module.exports = Friend;