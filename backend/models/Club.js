const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Club name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Club description is required']
  },
  category: {
    type: String,
    required: [true, 'Club category is required'],
    enum: ['Academic', 'Sports', 'Cultural', 'Technical', 'Social', 'Other']
  },
  logoUrl: {
    type: String,
    default: null
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Club', clubSchema);
