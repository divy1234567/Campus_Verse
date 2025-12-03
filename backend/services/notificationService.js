const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Send push notification to a single user
 * @param {String} expoPushToken - User's Expo push token
 * @param {String} title - Notification title
 * @param {String} body - Notification body
 * @param {Object} data - Additional data to send with notification
 */
const sendPushNotification = async (expoPushToken, title, body, data = {}) => {
  // Check that the token is valid
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.error(`Push token ${expoPushToken} is not a valid Expo push token`);
    return { success: false, message: 'Invalid Expo push token' };
  }

  // Construct the notification message
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
    priority: 'high'
  };

  try {
    const ticketChunk = await expo.sendPushNotificationsAsync([message]);
    console.log('Notification sent:', ticketChunk);
    return { success: true, ticket: ticketChunk };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Send push notifications to multiple users
 * @param {Array} tokens - Array of Expo push tokens
 * @param {String} title - Notification title
 * @param {String} body - Notification body
 * @param {Object} data - Additional data to send with notification
 */
const sendBulkPushNotifications = async (tokens, title, body, data = {}) => {
  const messages = [];

  for (let token of tokens) {
    // Check that the token is valid
    if (!Expo.isExpoPushToken(token)) {
      console.error(`Push token ${token} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: token,
      sound: 'default',
      title: title,
      body: body,
      data: data,
      priority: 'high'
    });
  }

  // Send notifications in chunks
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  try {
    for (let chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }
    console.log(`Sent ${tickets.length} notifications`);
    return { success: true, tickets };
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Send event reminder notification
 * @param {String} expoPushToken - User's Expo push token
 * @param {Object} event - Event object
 */
const sendEventReminder = async (expoPushToken, event) => {
  const title = `Reminder: ${event.title}`;
  const body = `Event starts at ${event.time} on ${new Date(event.date).toLocaleDateString()}`;
  const data = { 
    type: 'event_reminder', 
    eventId: event._id.toString() 
  };

  return await sendPushNotification(expoPushToken, title, body, data);
};

/**
 * Send event update notification
 * @param {Array} tokens - Array of user Expo push tokens
 * @param {Object} event - Event object
 * @param {String} updateType - Type of update (time_change, venue_change, cancelled, etc.)
 */
const sendEventUpdate = async (tokens, event, updateType) => {
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

  return await sendBulkPushNotifications(tokens, title, body, data);
};

/**
 * Send new event notification to club followers
 * @param {Array} tokens - Array of follower Expo push tokens
 * @param {Object} event - Event object
 * @param {String} clubName - Club name
 */
const sendNewEventNotification = async (tokens, event, clubName) => {
  const title = `New Event from ${clubName}`;
  const body = `${event.title} - ${new Date(event.date).toLocaleDateString()} at ${event.time}`;
  const data = { 
    type: 'new_event', 
    eventId: event._id.toString(),
    clubName 
  };

  return await sendBulkPushNotifications(tokens, title, body, data);
};

module.exports = {
  sendPushNotification,
  sendBulkPushNotifications,
  sendEventReminder,
  sendEventUpdate,
  sendNewEventNotification
};
