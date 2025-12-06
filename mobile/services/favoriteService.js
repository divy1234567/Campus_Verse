import api from './api';

const favoriteService = {
  // Get all favorites for current user
  getFavorites: async () => {
    try {
      const response = await api.get('/api/favorites/user');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch favorites' };
    }
  },

  // Check if event is favorited
  isFavorited: async (eventId) => {
    try {
      const response = await api.get(`/api/favorites/event/${eventId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to check favorite status' };
    }
  },

  // Add event to favorites
  addFavorite: async (eventId) => {
    try {
      const response = await api.post(`/api/favorites/event/${eventId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to add favorite' };
    }
  },

  // Remove event from favorites
  removeFavorite: async (eventId) => {
    try {
      const response = await api.delete(`/api/favorites/event/${eventId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to remove favorite' };
    }
  },
};

export default favoriteService;

