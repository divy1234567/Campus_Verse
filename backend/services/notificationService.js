const Notification = require('../models/Notification');

/**
 * Create and save a notification for a user
 * @param {String} userId - User ID
 * @param {String} title - Notification title
 * @param {String} body - Notification body
 * @param {String} type - Notification type
 * @param {Object} data - Additional data
 */
const createNotification = async (userId, title, body, type = 'general', data = {}) => {
  try {
    const notification = new Notification({
      userId,
      title,
      body,
      type,
      data
    });

    await notification.save();
    console.log(`Notification created for user ${userId}: ${title}`);
    return { success: true, notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Create notifications for multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {String} title - Notification title
 * @param {String} body - Notification body
 * @param {String} type - Notification type
 * @param {Object} data - Additional data
 */
const createBulkNotifications = async (userIds, title, body, type = 'general', data = {}) => {
  try {
    const notifications = userIds.map(userId => ({
      userId,
      title,
      body,
      type,
      data
    }));

    const result = await Notification.insertMany(notifications);
    console.log(`Created ${result.length} notifications`);
    return { success: true, count: result.length };
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Send event reminder notification
 * @param {String} userId - User ID
 * @param {Object} event - Event object
 */
const sendEventReminder = async (userId, event) => {
  const title = `Reminder: ${event.title}`;
  const body = `Event starts at ${event.time} on ${new Date(event.date).toLocaleDateString()}`;
  const data = { 
    type: 'event_reminder', 
    eventId: event._id.toString() 
  };

  return await createNotification(userId, title, body, 'event_reminder', data);
};

/**
 * Send event update notification
 * @param {Array} userIds - Array of user IDs
 * @param {Object} event - Event object
 * @param {String} updateType - Type of update (time_change, venue_change, cancelled, etc.)
 */
const sendEventUpdate = async (userIds, event, updateType) => {
  let title = '';
  let body = '';

  switch (updateType) {
    case 'time_change':
      title = `Time Changed: ${event.title}`;
      body = `Event time has been updated to ${event.time}`;
      break;
    case 'venue_change':
      title = `Venue Changed: ${event.title}`;
      body = `Event venue has been updated to ${event.venue}`;
      break;
    case 'cancelled':
      title = `Event Cancelled: ${event.title}`;
      body = `This event has been cancelled`;
      break;
    default:
      title = `Event Updated: ${event.title}`;
      body = `This event has been updated. Check the app for details.`;
  }

  const data = { 
    type: 'event_update', 
    eventId: event._id.toString(),
    updateType 
  };

  return await createBulkNotifications(userIds, title, body, 'event_update', data);
};

/**
 * Send new event notification to club followers
 * @param {Array} userIds - Array of user IDs
 * @param {Object} event - Event object
 * @param {String} clubName - Club name
 */
const sendNewEventNotification = async (userIds, event, clubName) => {
  const title = `New Event from ${clubName}`;
  const body = `${event.title} - ${new Date(event.date).toLocaleDateString()} at ${event.time}`;
  const data = { 
    type: 'new_event', 
    eventId: event._id.toString(),
    clubName 
  };

  return await createBulkNotifications(userIds, title, body, 'new_event', data);
};

/**
 * Send announcement notification
 * @param {Array} userIds - Array of user IDs
 * @param {Object} announcement - Announcement object
 */
const sendAnnouncementNotification = async (userIds, announcement) => {
  const title = announcement.title;
  const body = announcement.content.substring(0, 100) + (announcement.content.length > 100 ? '...' : '');
  const data = {
    type: 'announcement',
    announcementId: announcement._id.toString()
  };

  return await createBulkNotifications(userIds, title, body, 'announcement', data);
};

module.exports = {
  createNotification,
  createBulkNotifications,
  sendEventReminder,
  sendEventUpdate,
  sendNewEventNotification,
  sendAnnouncementNotification
};
