import api from './api';

const commentService = {
  // Get all comments for an event
  getComments: async (eventId) => {
    try {
      const response = await api.get(`/api/comments/event/${eventId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch comments' };
    }
  },

  // Create a comment
  createComment: async (eventId, content) => {
    try {
      const response = await api.post('/api/comments', { eventId, content });
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to create comment' };
    }
  },

  // Update a comment
  updateComment: async (commentId, content) => {
    try {
      const response = await api.put(`/api/comments/${commentId}`, { content });
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update comment' };
    }
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/api/comments/${commentId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete comment' };
    }
  },

  // Like/Unlike a comment
  toggleLike: async (commentId) => {
    try {
      const response = await api.post(`/api/comments/${commentId}/like`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to toggle like' };
    }
  },

  // Add a reply to a comment
  addReply: async (commentId, content) => {
    try {
      const response = await api.post(`/api/comments/${commentId}/reply`, { content });
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to add reply' };
    }
  },
};

export default commentService;

