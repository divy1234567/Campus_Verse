const express = require('express');
const router = express.Router();
const Club = require('../models/Club');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/clubs
 * @desc    Get all clubs
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = {};
    if (category) {
      query.category = category;
    }

    const clubs = await Club.find(query).sort({ name: 1 });

    res.json({
      success: true,
      count: clubs.length,
      data: { clubs }
    });
  } catch (error) {
    console.error('Get clubs error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching clubs',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/clubs/:id
 * @desc    Get club by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id).populate('members', 'name email');

    if (!club) {
      return res.status(404).json({ 
        success: false, 
        message: 'Club not found' 
      });
    }

    res.json({
      success: true,
      data: { club }
    });
  } catch (error) {
    console.error('Get club error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching club',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/clubs
 * @desc    Create a new club
 * @access  Private (Admin only)
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, category, logoUrl, contactEmail } = req.body;

    // Validate input
    if (!name || !description || !category || !contactEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, description, category, and contact email' 
      });
    }

    // Check if club already exists
    const existingClub = await Club.findOne({ name });
    if (existingClub) {
      return res.status(400).json({ 
        success: false, 
        message: 'Club with this name already exists' 
      });
    }

    const club = new Club({
      name,
      description,
      category,
      logoUrl,
      contactEmail
    });

    await club.save();

    res.status(201).json({
      success: true,
      message: 'Club created successfully',
      data: { club }
    });
  } catch (error) {
    console.error('Create club error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating club',
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/clubs/:id
 * @desc    Update a club
 * @access  Private (Admin only)
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, category, logoUrl, contactEmail } = req.body;

    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ 
        success: false, 
        message: 'Club not found' 
      });
    }

    // Update fields
    if (name) club.name = name;
    if (description) club.description = description;
    if (category) club.category = category;
    if (logoUrl !== undefined) club.logoUrl = logoUrl;
    if (contactEmail) club.contactEmail = contactEmail;

    await club.save();

    res.json({
      success: true,
      message: 'Club updated successfully',
      data: { club }
    });
  } catch (error) {
    console.error('Update club error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating club',
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/clubs/:id
 * @desc    Delete a club
 * @access  Private (Admin only)
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ 
        success: false, 
        message: 'Club not found' 
      });
    }

    // Delete all events associated with this club
    const Event = require('../models/Event');
    await Event.deleteMany({ clubId: req.params.id });

    // Remove club from all users' followedClubs
    await User.updateMany(
      { followedClubs: req.params.id },
      { $pull: { followedClubs: req.params.id } }
    );

    await club.deleteOne();

    res.json({
      success: true,
      message: 'Club and associated events deleted successfully'
    });
  } catch (error) {
    console.error('Delete club error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting club',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/clubs/:id/follow
 * @desc    Follow a club
 * @access  Private
 */
router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ 
        success: false, 
        message: 'Club not found' 
      });
    }

    // Check if already following
    if (req.user.followedClubs.includes(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already following this club' 
      });
    }

    // Add club to user's followed clubs
    req.user.followedClubs.push(req.params.id);
    await req.user.save();

    res.json({
      success: true,
      message: 'Successfully followed club',
      data: { 
        clubId: req.params.id,
        clubName: club.name
      }
    });
  } catch (error) {
    console.error('Follow club error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error following club',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/clubs/:id/unfollow
 * @desc    Unfollow a club
 * @access  Private
 */
router.post('/:id/unfollow', authMiddleware, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ 
        success: false, 
        message: 'Club not found' 
      });
    }

    // Check if not following
    if (!req.user.followedClubs.includes(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Not following this club' 
      });
    }

    // Remove club from user's followed clubs
    req.user.followedClubs = req.user.followedClubs.filter(
      clubId => clubId.toString() !== req.params.id
    );
    await req.user.save();

    res.json({
      success: true,
      message: 'Successfully unfollowed club',
      data: { 
        clubId: req.params.id,
        clubName: club.name
      }
    });
  } catch (error) {
    console.error('Unfollow club error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error unfollowing club',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/clubs/my/followed
 * @desc    Get user's followed clubs
 * @access  Private
 */
router.get('/my/followed', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('followedClubs');
    
    res.json({
      success: true,
      count: user.followedClubs.length,
      data: { clubs: user.followedClubs }
    });
  } catch (error) {
    console.error('Get followed clubs error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching followed clubs',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/clubs/:id/join
 * @desc    Join a club as a member
 * @access  Private
 */
router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ 
        success: false, 
        message: 'Club not found' 
      });
    }

    // Check if already a member
    if (club.members.includes(req.user._id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already a member of this club' 
      });
    }

    // Add user to club members
    club.members.push(req.user._id);
    club.memberCount = club.members.length;
    await club.save();

    res.json({
      success: true,
      message: 'Successfully joined club',
      data: { 
        clubId: req.params.id,
        clubName: club.name,
        memberCount: club.memberCount
      }
    });
  } catch (error) {
    console.error('Join club error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error joining club',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/clubs/:id/leave
 * @desc    Leave a club
 * @access  Private
 */
router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ 
        success: false, 
        message: 'Club not found' 
      });
    }

    // Check if not a member
    if (!club.members.includes(req.user._id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Not a member of this club' 
      });
    }

    // Remove user from club members
    club.members = club.members.filter(
      memberId => memberId.toString() !== req.user._id.toString()
    );
    club.memberCount = club.members.length;
    await club.save();

    res.json({
      success: true,
      message: 'Successfully left club',
      data: { 
        clubId: req.params.id,
        clubName: club.name,
        memberCount: club.memberCount
      }
    });
  } catch (error) {
    console.error('Leave club error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error leaving club',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/clubs/:id/members
 * @desc    Get club members
 * @access  Public
 */
router.get('/:id/members', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id).populate('members', 'name email');

    if (!club) {
      return res.status(404).json({ 
        success: false, 
        message: 'Club not found' 
      });
    }

    res.json({
      success: true,
      count: club.members.length,
      data: { members: club.members }
    });
  } catch (error) {
    console.error('Get club members error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching club members',
      error: error.message 
    });
  }
});

module.exports = router;
