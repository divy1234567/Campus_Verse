const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Event = require('../models/Event');
const User = require('../models/User');
const RSVP = require('../models/RSVP');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { sendNewEventNotification } = require('../services/notificationService');

/**
 * @route   GET /api/events
 * @desc    Get all events (with optional filters)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { tags, clubId, upcoming } = req.query;
    
    let query = {};
    
    // Filter by tags
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }
    
    // Filter by club
    if (clubId) {
      query.clubId = clubId;
    }
    
    // Filter upcoming events only
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .populate('clubId', 'name logoUrl')
      .populate('createdBy', 'name email')
      .sort({ date: 1 });

    res.json({
      success: true,
      count: events.length,
      data: { events }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching events',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/events/:id
 * @desc    Get event by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('clubId', 'name logoUrl')
      .populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    res.json({
      success: true,
      data: { event }
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching event',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (Admin only)
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, date, time, endTime, venue, organizer, tags, clubId } = req.body;

    // Validate input
    if (!title || !description || !date || !time || !venue || !organizer) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    const event = new Event({
      title,
      description,
      date,
      time,
      endTime,
      venue,
      organizer,
      tags: tags || [],
      clubId: clubId || null,
      createdBy: req.user._id
    });

    // Generate QR code for the event
    const qrData = JSON.stringify({
      eventId: event._id.toString(),
      title: event.title,
      type: 'attendance'
    });
    
    const qrCodeDataURL = await QRCode.toDataURL(qrData);
    event.qrCode = qrCodeDataURL;

    await event.save();

    // Populate the event before sending response
    await event.populate('clubId', 'name logoUrl');
    await event.populate('createdBy', 'name email');

    // Send notifications to club followers if this event is associated with a club
    if (clubId) {
      try {
        const followers = await User.find({ 
          followedClubs: clubId,
          expoPushToken: { $ne: null }
        });
        
        if (followers.length > 0) {
          const tokens = followers.map(f => f.expoPushToken);
          const club = await require('../models/Club').findById(clubId);
          
          if (club) {
            await sendNewEventNotification(tokens, event, club.name);
          }
        }
      } catch (notifError) {
        console.error('Error sending notifications:', notifError);
        // Don't fail the request if notification fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating event',
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Private (Admin only)
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, date, time, endTime, venue, organizer, tags, clubId } = req.body;

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    // Track what changed for notifications
    const changes = [];
    if (time && event.time !== time) changes.push('time_change');
    if (venue && event.venue !== venue) changes.push('venue_change');

    // Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (time) event.time = time;
    if (endTime) event.endTime = endTime;
    if (venue) event.venue = venue;
    if (organizer) event.organizer = organizer;
    if (tags) event.tags = tags;
    if (clubId !== undefined) event.clubId = clubId;

    await event.save();
    await event.populate('clubId', 'name logoUrl');
    await event.populate('createdBy', 'name email');

    // Send update notifications to users who RSVP'd
    if (changes.length > 0) {
      try {
        const rsvps = await RSVP.find({ 
          eventId: req.params.id, 
          status: 'attending' 
        }).populate('userId');
        
        const tokens = rsvps
          .map(rsvp => rsvp.userId.expoPushToken)
          .filter(token => token);
        
        if (tokens.length > 0) {
          const { sendEventUpdate } = require('../services/notificationService');
          await sendEventUpdate(tokens, event, changes[0]);
        }
      } catch (notifError) {
        console.error('Error sending update notifications:', notifError);
      }
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating event',
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event
 * @access  Private (Admin only)
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    // Notify users who RSVP'd
    try {
      const rsvps = await RSVP.find({ 
        eventId: req.params.id, 
        status: 'attending' 
      }).populate('userId');
      
      const tokens = rsvps
        .map(rsvp => rsvp.userId.expoPushToken)
        .filter(token => token);
      
      if (tokens.length > 0) {
        const { sendEventUpdate } = require('../services/notificationService');
        await sendEventUpdate(tokens, event, 'cancelled');
      }
    } catch (notifError) {
      console.error('Error sending cancellation notifications:', notifError);
    }

    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting event',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/events/:id/qrcode
 * @desc    Get QR code for an event
 * @access  Private (Admin only)
 */
router.get('/:id/qrcode', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    // If QR code doesn't exist, generate it
    if (!event.qrCode) {
      const qrData = JSON.stringify({
        eventId: event._id.toString(),
        title: event.title,
        type: 'attendance'
      });
      
      const qrCodeDataURL = await QRCode.toDataURL(qrData);
      event.qrCode = qrCodeDataURL;
      await event.save();
    }

    res.json({
      success: true,
      data: { 
        qrCode: event.qrCode,
        eventId: event._id,
        eventTitle: event.title
      }
    });
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching QR code',
      error: error.message 
    });
  }
});

module.exports = router;
