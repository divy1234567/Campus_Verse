const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Event = require('../models/Event');
const { authenticate } = require('../middleware/authMiddleware');

// Get all favorites for a user
router.get('/user', authenticate, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id })
      .populate('eventId')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: { favorites } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check if event is favorited
router.get('/event/:eventId', authenticate, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      userId: req.user._id,
      eventId: req.params.eventId
    });
    
    res.json({ success: true, data: { isFavorited: !!favorite } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add event to favorites
router.post('/event/:eventId', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const existingFavorite = await Favorite.findOne({
      userId: req.user._id,
      eventId: req.params.eventId
    });

    if (existingFavorite) {
      return res.json({ success: true, message: 'Event already favorited', data: { favorite: existingFavorite } });
    }

    const favorite = new Favorite({
      userId: req.user._id,
      eventId: req.params.eventId
    });

    await favorite.save();
    await favorite.populate('eventId');

    res.status(201).json({ success: true, data: { favorite } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove event from favorites
router.delete('/event/:eventId', authenticate, async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      userId: req.user._id,
      eventId: req.params.eventId
    });

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    res.json({ success: true, message: 'Event removed from favorites' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

