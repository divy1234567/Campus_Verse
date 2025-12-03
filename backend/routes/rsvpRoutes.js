const express = require('express');
const router = express.Router();
const RSVP = require('../models/RSVP');
const Event = require('../models/Event');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/rsvp/:eventId
 * @desc    RSVP to an event
 * @access  Private
 */
router.post('/:eventId', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    // Check if user already RSVP'd
    let rsvp = await RSVP.findOne({ 
      userId: req.user._id, 
      eventId 
    });

    if (rsvp) {
      // Update existing RSVP
      if (rsvp.status === 'attending') {
        return res.status(400).json({ 
          success: false, 
          message: 'You have already RSVP\'d to this event' 
        });
      }
      
      rsvp.status = 'attending';
      await rsvp.save();
    } else {
      // Create new RSVP
      rsvp = new RSVP({
        userId: req.user._id,
        eventId,
        status: 'attending'
      });
      await rsvp.save();
    }

    res.status(201).json({
      success: true,
      message: 'RSVP successful',
      data: { rsvp }
    });
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating RSVP',
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/rsvp/:eventId
 * @desc    Cancel RSVP for an event
 * @access  Private
 */
router.delete('/:eventId', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;

    const rsvp = await RSVP.findOne({ 
      userId: req.user._id, 
      eventId 
    });

    if (!rsvp) {
      return res.status(404).json({ 
        success: false, 
        message: 'RSVP not found' 
      });
    }

    if (rsvp.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'RSVP already cancelled' 
      });
    }

    rsvp.status = 'cancelled';
    await rsvp.save();

    res.json({
      success: true,
      message: 'RSVP cancelled successfully',
      data: { rsvp }
    });
  } catch (error) {
    console.error('Cancel RSVP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error cancelling RSVP',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/rsvp/my-rsvps
 * @desc    Get current user's RSVPs
 * @access  Private
 */
router.get('/my-rsvps', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { userId: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const rsvps = await RSVP.find(query)
      .populate({
        path: 'eventId',
        populate: { path: 'clubId', select: 'name logoUrl' }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rsvps.length,
      data: { rsvps }
    });
  } catch (error) {
    console.error('Get RSVPs error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching RSVPs',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/rsvp/event/:eventId/count
 * @desc    Get RSVP count for an event
 * @access  Public
 */
router.get('/event/:eventId/count', async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    const count = await RSVP.countDocuments({ 
      eventId, 
      status: 'attending' 
    });

    res.json({
      success: true,
      data: { 
        eventId,
        rsvpCount: count 
      }
    });
  } catch (error) {
    console.error('Get RSVP count error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching RSVP count',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/rsvp/event/:eventId/status
 * @desc    Get user's RSVP status for an event
 * @access  Private
 */
router.get('/event/:eventId/status', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;

    const rsvp = await RSVP.findOne({ 
      userId: req.user._id, 
      eventId 
    });

    res.json({
      success: true,
      data: { 
        eventId,
        hasRSVP: !!rsvp,
        status: rsvp ? rsvp.status : null
      }
    });
  } catch (error) {
    console.error('Get RSVP status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching RSVP status',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/rsvp/event/:eventId/attendees
 * @desc    Get list of attendees for an event
 * @access  Public
 */
router.get('/event/:eventId/attendees', async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    const rsvps = await RSVP.find({ 
      eventId, 
      status: 'attending' 
    }).populate('userId', 'name email');

    const attendees = rsvps.map(rsvp => ({
      id: rsvp.userId._id,
      name: rsvp.userId.name,
      email: rsvp.userId.email,
      rsvpDate: rsvp.createdAt
    }));

    res.json({
      success: true,
      count: attendees.length,
      data: { attendees }
    });
  } catch (error) {
    console.error('Get attendees error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching attendees',
      error: error.message 
    });
  }
});

module.exports = router;
