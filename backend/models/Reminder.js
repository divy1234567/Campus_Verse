const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  reminderTime: {
    type: Date,
    required: [true, 'Reminder time is required']
  },
  notified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
reminderSchema.index({ userId: 1, eventId: 1 });
reminderSchema.index({ reminderTime: 1, notified: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);

