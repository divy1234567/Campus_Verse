const Reminder = require('../models/Reminder');
const Event = require('../models/Event');
const { sendEventReminder } = require('./notificationService');

/**
 * Process reminders that are due
 * This should be called periodically (e.g., every minute via cron job or scheduled task)
 */
const processDueReminders = async () => {
  try {
    const now = new Date();
    const dueReminders = await Reminder.find({
      reminderTime: { $lte: now },
      notified: false
    }).populate('eventId');

    for (const reminder of dueReminders) {
      if (reminder.eventId) {
        // Send reminder notification
        await sendEventReminder(reminder.userId, reminder.eventId);
        
        // Mark as notified
        reminder.notified = true;
        await reminder.save();
      }
    }

    console.log(`Processed ${dueReminders.length} due reminders`);
    return { success: true, processed: dueReminders.length };
  } catch (error) {
    console.error('Error processing reminders:', error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  processDueReminders
};

