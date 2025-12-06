import api from './api';

const reminderService = {
  // Get all reminders for current user
  getReminders: async () => {
    try {
      const response = await api.get('/api/reminders/user');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch reminders' };
    }
  },

  // Create a reminder
  createReminder: async (eventId, reminderTime) => {
    try {
      const response = await api.post('/api/reminders', { eventId, reminderTime });
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to create reminder' };
    }
  },

  // Update a reminder
  updateReminder: async (reminderId, reminderTime) => {
    try {
      const response = await api.put(`/api/reminders/${reminderId}`, { reminderTime });
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update reminder' };
    }
  },

  // Delete a reminder
  deleteReminder: async (reminderId) => {
    try {
      const response = await api.delete(`/api/reminders/${reminderId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete reminder' };
    }
  },

  // Delete reminder by event
  deleteReminderByEvent: async (eventId) => {
    try {
      const response = await api.delete(`/api/reminders/event/${eventId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete reminder' };
    }
  },
};

export default reminderService;

