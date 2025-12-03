import api from './api';

const rsvpService = {
  // RSVP to an event
  createRSVP: async (eventId) => {
    try {
      const response = await api.post(`/api/rsvp/${eventId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to RSVP' };
    }
  },

  // Cancel RSVP
  cancelRSVP: async (eventId) => {
    try {
      const response = await api.delete(`/api/rsvp/${eventId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel RSVP' };
    }
  },

  // Check RSVP status for an event
  getRSVPStatus: async (eventId) => {
    try {
      const response = await api.get(`/api/rsvp/event/${eventId}/status`);
      if (response.data.success) {
        return {
          isRSVPd: response.data.data.status === 'attending',
          status: response.data.data.status
        };
      }
      return { isRSVPd: false };
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get RSVP status' };
    }
  },

  // Get RSVP count for an event
  getRSVPCount: async (eventId) => {
    try {
      const response = await api.get(`/api/rsvp/event/${eventId}/count`);
      if (response.data.success) {
        return { count: response.data.data.rsvpCount };
      }
      return { count: 0 };
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get RSVP count' };
    }
  },

  // Get user's RSVPs
  getUserRSVPs: async () => {
    try {
      const response = await api.get('/api/rsvp/my-rsvps');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch RSVPs' };
    }
  },

  // Get attendees list for an event (admin only)
  getEventAttendees: async (eventId) => {
    try {
      const response = await api.get(`/api/rsvp/event/${eventId}/attendees`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch attendees' };
    }
  },
};

export default rsvpService;
