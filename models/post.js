const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    post_code: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        required: true
    },
    has_verify: {
        type: Boolean,
        required: true
    },
    post_url: {
        type: String,
        required: true
    },
    post_url_type: {
        type: String,
        required: true
    },
    updated_at: {
        type: Date,
        default: Date.now,
        required: true
    },
    hash_tag: [{
        id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        updated_at: {
            type: Date,
            default: Date.now,
            required: true
        }
    }],
    tag_friend: [
        {
            type: String,
            required: true
        }
    ],
    post_access: {
        type: String,
        enum: ['Only me', 'Friends', 'Public', 'Custom'],
        default: 'Public',
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: [
        {
            user_id: String,
            content: String,
            created_at: {
                type: Date,
                default: Date.now
            }
        }
    ],
    votes: [
        {
            user_id: String,
            value: Number
        }
    ],
    // shares: {
    //     type: Number,
    //     default: 0
    // }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;