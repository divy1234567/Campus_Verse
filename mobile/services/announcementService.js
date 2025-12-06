import api from './api';

const announcementService = {
  // Get all active announcements
  getAnnouncements: async () => {
    try {
      const response = await api.get('/api/announcements');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch announcements' };
    }
  },

  // Get a single announcement
  getAnnouncement: async (announcementId) => {
    try {
      const response = await api.get(`/api/announcements/${announcementId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch announcement' };
    }
  },

  // Create an announcement (Admin only)
  createAnnouncement: async (announcementData) => {
    try {
      const response = await api.post('/api/announcements', announcementData);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to create announcement' };
    }
  },

  // Update an announcement (Admin only)
  updateAnnouncement: async (announcementId, announcementData) => {
    try {
      const response = await api.put(`/api/announcements/${announcementId}`, announcementData);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update announcement' };
    }
  },

  // Delete an announcement (Admin only)
  deleteAnnouncement: async (announcementId) => {
    try {
      const response = await api.delete(`/api/announcements/${announcementId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete announcement' };
    }
  },
};

export default announcementService;

