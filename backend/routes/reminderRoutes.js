const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const Event = require('../models/Event');
const { authenticate } = require('../middleware/authMiddleware');

// Get all reminders for a user
router.get('/user', authenticate, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id })
      .populate('eventId')
      .sort({ reminderTime: 1 });
    
    res.json({ success: true, data: { reminders } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a reminder
router.post('/', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.body.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if reminder already exists
    const existingReminder = await Reminder.findOne({
      userId: req.user._id,
      eventId: req.body.eventId
    });

    if (existingReminder) {
      existingReminder.reminderTime = req.body.reminderTime;
      await existingReminder.save();
      await existingReminder.populate('eventId');
      return res.json({ success: true, data: { reminder: existingReminder } });
    }

    const reminder = new Reminder({
      userId: req.user._id,
      eventId: req.body.eventId,
      reminderTime: req.body.reminderTime
    });

    await reminder.save();
    await reminder.populate('eventId');

    res.status(201).json({ success: true, data: { reminder } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a reminder
router.put('/:reminderId', authenticate, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.reminderId);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    if (reminder.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    reminder.reminderTime = req.body.reminderTime || reminder.reminderTime;
    await reminder.save();
    await reminder.populate('eventId');

    res.json({ success: true, data: { reminder } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a reminder
router.delete('/:reminderId', authenticate, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.reminderId);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    if (reminder.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Reminder.findByIdAndDelete(req.params.reminderId);
    res.json({ success: true, message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete reminder by event
router.delete('/event/:eventId', authenticate, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      userId: req.user._id,
      eventId: req.params.eventId
    });

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    res.json({ success: true, message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
