import api from './api';

const eventService = {
  // Get all events with optional filters
  getEvents: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.tag) params.append('tag', filters.tag);
      if (filters.clubId) params.append('clubId', filters.clubId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await api.get(`/api/events?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch events' };
    }
  },

  // Get single event by ID
  getEventById: async (eventId) => {
    try {
      const response = await api.get(`/api/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch event' };
    }
  },

  // Create new event (admin only)
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/api/events', eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create event' };
    }
  },

  // Update event (admin only)
  updateEvent: async (eventId, eventData) => {
    try {
      const response = await api.put(`/api/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update event' };
    }
  },

  // Delete event (admin only)
  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/api/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete event' };
    }
  },

  // Get QR code for event (admin only)
  getEventQRCode: async (eventId) => {
    try {
      const response = await api.get(`/api/events/${eventId}/qrcode`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get QR code' };
    }
  },

  // Get upcoming events
  getUpcomingEvents: async () => {
    try {
      const response = await api.get('/api/events/upcoming');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch upcoming events' };
    }
  },
};

export default eventService;
