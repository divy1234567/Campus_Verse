const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const { authenticate } = require('../middleware/authMiddleware');
const { sendAnnouncementNotification } = require('../services/notificationService');

// Get all active announcements
router.get('/', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const query = { isActive: true };
    
    // Filter by target audience
    if (user.role === 'student') {
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: 'students' }
      ];
    } else {
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: 'admins' }
      ];
    }

    // Filter expired announcements
    query.$or.push({ expiresAt: null });
    query.$or.push({ expiresAt: { $gt: new Date() } });

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email')
      .sort({ priority: -1, createdAt: -1 });
    
    res.json({ success: true, data: { announcements } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get a single announcement
router.get('/:announcementId', authenticate, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.announcementId)
      .populate('createdBy', 'name email');
    
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.json({ success: true, data: { announcement } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create an announcement (Admin only)
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const announcement = new Announcement({
      title: req.body.title,
      content: req.body.content,
      priority: req.body.priority || 'medium',
      targetAudience: req.body.targetAudience || 'all',
      createdBy: req.user._id,
      expiresAt: req.body.expiresAt || null
    });

    await announcement.save();
    await announcement.populate('createdBy', 'name email');

    // Send notifications to target audience
    try {
      let targetUsers = [];
      if (announcement.targetAudience === 'all') {
        targetUsers = await User.find({});
      } else if (announcement.targetAudience === 'students') {
        targetUsers = await User.find({ role: 'student' });
      } else if (announcement.targetAudience === 'admins') {
        targetUsers = await User.find({ role: 'admin' });
      }
      
      if (targetUsers.length > 0) {
        const userIds = targetUsers.map(u => u._id);
        await sendAnnouncementNotification(userIds, announcement);
      }
    } catch (notifError) {
      console.error('Error sending announcement notifications:', notifError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({ success: true, data: { announcement } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update an announcement (Admin only)
router.put('/:announcementId', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const announcement = await Announcement.findById(req.params.announcementId);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    announcement.title = req.body.title || announcement.title;
    announcement.content = req.body.content || announcement.content;
    announcement.priority = req.body.priority || announcement.priority;
    announcement.targetAudience = req.body.targetAudience || announcement.targetAudience;
    announcement.isActive = req.body.isActive !== undefined ? req.body.isActive : announcement.isActive;
    announcement.expiresAt = req.body.expiresAt !== undefined ? req.body.expiresAt : announcement.expiresAt;

    await announcement.save();
    await announcement.populate('createdBy', 'name email');

    res.json({ success: true, data: { announcement } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete an announcement (Admin only)
router.delete('/:announcementId', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const announcement = await Announcement.findByIdAndDelete(req.params.announcementId);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

