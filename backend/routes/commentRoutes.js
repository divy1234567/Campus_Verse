const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Event = require('../models/Event');
const { authenticate } = require('../middleware/authMiddleware');

// Get all comments for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const comments = await Comment.find({ eventId: req.params.eventId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: { comments } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new comment
router.post('/', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.body.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const comment = new Comment({
      eventId: req.body.eventId,
      userId: req.user._id,
      content: req.body.content
    });

    await comment.save();
    await comment.populate('userId', 'name email');

    res.status(201).json({ success: true, data: { comment } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a comment
router.put('/:commentId', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    comment.content = req.body.content || comment.content;
    await comment.save();
    await comment.populate('userId', 'name email');

    res.json({ success: true, data: { comment } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a comment
router.delete('/:commentId', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Like/Unlike a comment
router.post('/:commentId/like', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const userId = req.user._id;
    const likeIndex = comment.likes.indexOf(userId);

    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    res.json({ success: true, data: { likes: comment.likes.length, isLiked: likeIndex === -1 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add a reply to a comment
router.post('/:commentId/reply', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const newReply = {
      userId: req.user._id,
      content: req.body.content
    };
    
    comment.replies.push(newReply);
    await comment.save();
    
    // Populate the reply's userId
    await comment.populate({
      path: 'replies.userId',
      select: 'name email'
    });
    
    const reply = comment.replies[comment.replies.length - 1];

    res.json({ success: true, data: { reply } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

