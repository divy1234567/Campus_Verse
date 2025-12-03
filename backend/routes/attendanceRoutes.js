const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/attendance/checkin
 * @desc    Check in to an event via QR code scan
 * @access  Private
 */
router.post('/checkin', authMiddleware, async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({ 
        success: false, 
        message: 'QR code data is required' 
      });
    }

    // Parse QR code data
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (parseError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid QR code format' 
      });
    }

    const { eventId, type } = parsedData;

    if (type !== 'attendance') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid QR code type' 
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    // Check if already checked in
    let attendance = await Attendance.findOne({ 
      userId: req.user._id, 
      eventId 
    });

    if (attendance) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already checked in to this event',
        data: { 
          attendance,
          checkedInAt: attendance.checkedInAt
        }
      });
    }

    // Create attendance record
    attendance = new Attendance({
      userId: req.user._id,
      eventId,
      qrCodeScanned: true
    });

    await attendance.save();

    res.status(201).json({
      success: true,
      message: 'Checked in successfully',
      data: { 
        attendance,
        event: {
          id: event._id,
          title: event.title,
          date: event.date,
          time: event.time,
          venue: event.venue
        }
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during check-in',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/attendance/event/:eventId
 * @desc    Get attendance list for an event
 * @access  Private (Admin only)
 */
router.get('/event/:eventId', authMiddleware, adminMiddleware, async (req, res) => {
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

    const attendanceRecords = await Attendance.find({ eventId })
      .populate('userId', 'name email role')
      .sort({ checkedInAt: -1 });

    const attendees = attendanceRecords.map(record => ({
      id: record._id,
      user: {
        id: record.userId._id,
        name: record.userId.name,
        email: record.userId.email,
        role: record.userId.role
      },
      checkedInAt: record.checkedInAt,
      qrCodeScanned: record.qrCodeScanned
    }));

    res.json({
      success: true,
      count: attendees.length,
      data: { 
        eventId,
        eventTitle: event.title,
        attendees 
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching attendance',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/attendance/my-attendance
 * @desc    Get current user's attendance history
 * @access  Private
 */
router.get('/my-attendance', authMiddleware, async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find({ userId: req.user._id })
      .populate({
        path: 'eventId',
        populate: { path: 'clubId', select: 'name logoUrl' }
      })
      .sort({ checkedInAt: -1 });

    const attendance = attendanceRecords.map(record => ({
      id: record._id,
      event: record.eventId,
      checkedInAt: record.checkedInAt,
      qrCodeScanned: record.qrCodeScanned
    }));

    res.json({
      success: true,
      count: attendance.length,
      data: { attendance }
    });
  } catch (error) {
    console.error('Get my attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching attendance history',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/attendance/event/:eventId/status
 * @desc    Check if user has checked in to an event
 * @access  Private
 */
router.get('/event/:eventId/status', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;

    const attendance = await Attendance.findOne({ 
      userId: req.user._id, 
      eventId 
    });

    res.json({
      success: true,
      data: { 
        eventId,
        hasCheckedIn: !!attendance,
        checkedInAt: attendance ? attendance.checkedInAt : null
      }
    });
  } catch (error) {
    console.error('Get attendance status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching attendance status',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/attendance/event/:eventId/count
 * @desc    Get attendance count for an event
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

    const count = await Attendance.countDocuments({ eventId });

    res.json({
      success: true,
      data: { 
        eventId,
        attendanceCount: count 
      }
    });
  } catch (error) {
    console.error('Get attendance count error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching attendance count',
      error: error.message 
    });
  }
});

module.exports = router;
