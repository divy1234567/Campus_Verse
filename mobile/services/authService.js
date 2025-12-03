import api from './api';

const authService = {
  // Sign up new user
  signup: async (userData) => {
    try {
      const response = await api.post('/api/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Sign up failed' };
    }
  },

  // Sign in existing user
  signin: async (email, password) => {
    try {
      const response = await api.post('/api/auth/signin', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Sign in failed' };
    }
  },

  // Save Expo push token
  saveExpoPushToken: async (expoPushToken, authToken) => {
    try {
      const response = await api.post('/api/auth/expo-token', {
        expoPushToken,
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to save push token:', error);
      throw error.response?.data || { message: 'Failed to save push token' };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get user' };
    }
  },
};

export default authService;
