import api from './api';

const clubService = {
  // Get all clubs with optional category filter
  getClubs: async (category = null) => {
    try {
      const url = category ? `/api/clubs?category=${category}` : '/api/clubs';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch clubs' };
    }
  },

  // Get single club by ID
  getClubById: async (clubId) => {
    try {
      const response = await api.get(`/api/clubs/${clubId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch club' };
    }
  },

  // Create new club (admin only)
  createClub: async (clubData) => {
    try {
      const response = await api.post('/api/clubs', clubData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create club' };
    }
  },

  // Update club (admin only)
  updateClub: async (clubId, clubData) => {
    try {
      const response = await api.put(`/api/clubs/${clubId}`, clubData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update club' };
    }
  },

  // Delete club (admin only)
  deleteClub: async (clubId) => {
    try {
      const response = await api.delete(`/api/clubs/${clubId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete club' };
    }
  },

  // Follow a club
  followClub: async (clubId) => {
    try {
      const response = await api.post(`/api/clubs/${clubId}/follow`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to follow club' };
    }
  },

  // Unfollow a club
  unfollowClub: async (clubId) => {
    try {
      const response = await api.post(`/api/clubs/${clubId}/unfollow`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to unfollow club' };
    }
  },

  // Get clubs followed by user
  getFollowedClubs: async () => {
    try {
      const response = await api.get('/api/clubs/my/following');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch followed clubs' };
    }
  },
};

export default clubService;
