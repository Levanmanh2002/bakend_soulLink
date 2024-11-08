const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const Post = require("../../models/post")


router.post('/create_posts', async (req, res) => {
    const { post_url, tag_friend, caption, post_access } = req.body;

    // Determine the post URL type based on the domain
    let postUrlType = '';
    if (post_url.includes('facebook.com')) {
        postUrlType = 'facebook';
    } else if (post_url.includes('youtube.com')) {
        postUrlType = 'youtube';
    } else if (post_url.includes('instagram.com')) {
        postUrlType = 'instagram';
    } else if (post_url.includes('tiktok.com')) {
        postUrlType = 'tiktok';
    } else if (post_url.includes('twitter.com')) {
        postUrlType = 'twitter';
    } else if (post_url.includes('twitch.com')) {
        postUrlType = 'twitch';
    }

    // Create the post object
    const newPost = new Post({
        id: uuid.v4(),
        post_code: uuid.v4(),
        caption: caption,
        has_verify: false,
        post_url: post_url,
        post_url_type: postUrlType,
        updated_at: Date.now(),
        hash_tag: [],
        tag_friend: tag_friend ? tag_friend.split(',') : [],
        post_access: post_access || "Public"
    });

    // 0: Only me: Chỉ mình tôi
    // 1: Friends: Bạn bè
    // 2: Public: Công khai
    // 3: Custom: Có chọn lọc

    // Parse the caption to find hash tags
    const hashTags = caption.match(/#\w+/g) || [];
    if (hashTags) {
        newPost.hash_tag = hashTags.map((tag) => ({
            id: uuid.v4(),
            name: tag.slice(1),
            updated_at: Date.now()
        }));
    }

    try {
        const savedPost = await newPost.save();
        res.status(201).json({
            code: 201,
            success: true,
            message: 'POST.CREATE_POST_SUCCESS',
            data: savedPost
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            success: false,
            message: 'POST.CREATE_POST_FAILED',
            error: error.message
        });
    }
});

router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).json({
            success: true,
            message: 'GET_ALL_POSTS_SUCCESS',
            data: posts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'GET_ALL_POSTS_FAILED',
            error: error.message,
        });
    }
});

// Route to get all posts by a user
router.get('/posts/:user_id', async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const posts = await Post.find({ user_id: user_id });
        res.json(posts);
    } catch (err) {
        res.json({ message: err });
    }
});

// Tìm kiếm theo tên
async function getPostsByType(postUrlType) {
    const posts = await Post.find({ post_url_type: postUrlType });
    return posts;
}

router.get('/post_url', async (req, res) => {
    const postUrlType = req.query.social_type;
    const posts = await getPostsByType(postUrlType);
    res.json(posts);
});

router.delete('/delete/:postId', async (req, res) => {
    try {
        const deletedPost = await Post.deleteOne({ _id: req.params.postId });
        res.status(200).json(deletedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;