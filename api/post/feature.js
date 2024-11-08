const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const Post = require('../../models/post');

// Like a post
router.post('/posts/:postId/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    post.likes++;
    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Comment on a post
router.post('/posts/:postId/comment', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    const newComment = {
      user_id: uuid.v4(),
      content: req.body.comment,
      created_at: Date.now()
    };
    post.comments.push(newComment);
    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Vote on a post
router.post('/posts/:postId/vote', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    const { voteType } = req.body;
    const userId = req.user?.id; // Assuming you have a middleware that adds a user object to the request
    const existingVoteIndex = post.votes.findIndex(vote => vote.user_id === userId);
    if (existingVoteIndex > -1) {
      if (post.votes[existingVoteIndex].value === 1 && voteType === 'upvote') {
        post.upvotes--;
        post.votes.splice(existingVoteIndex, 1);
      } else if (post.votes[existingVoteIndex].value === -1 && voteType === 'downvote') {
        post.downvotes--;
        post.votes.splice(existingVoteIndex, 1);
      } else if (post.votes[existingVoteIndex].value === -1 && voteType === 'upvote') {
        post.upvotes++;
        post.downvotes--;
        post.votes[existingVoteIndex].value = 1;
      } else if (post.votes[existingVoteIndex].value === 1 && voteType === 'downvote') {
        post.downvotes++;
        post.upvotes--;
        post.votes[existingVoteIndex].value = -1;
      }
    } else {
      if (voteType === 'upvote') {
        post.upvotes++;
        post.votes.push({ user_id: userId, value: 1 });
      } else if (voteType === 'downvote') {
        post.downvotes++;
        post.votes.push({ user_id: userId, value: -1 });
      }
    }
    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Share a post


module.exports = router;
