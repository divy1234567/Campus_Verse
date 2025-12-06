import api from './api';

const notificationService = {
  // Get all notifications for current user
  getNotifications: async (params = {}) => {
    try {
      const response = await api.get('/api/notifications', { params });
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch notifications' };
    }
  },

  // Get unread notification count
  getUnreadCount: async () => {
    try {
      const response = await api.get('/api/notifications/unread/count');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch unread count' };
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to mark as read' };
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.put('/api/notifications/read-all');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to mark all as read' };
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/api/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete notification' };
    }
  },

  // Delete all read notifications
  deleteAllRead: async () => {
    try {
      const response = await api.delete('/api/notifications/read/all');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete read notifications' };
    }
  },
};

export default notificationService;

