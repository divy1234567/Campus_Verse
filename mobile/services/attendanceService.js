import api from './api';

const attendanceService = {
  // Check in to event using QR code
  checkIn: async (qrData) => {
    try {
      const response = await api.post('/api/attendance/checkin', { qrData });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to check in' };
    }
  },

  // Get user's attendance history
  getUserAttendance: async () => {
    try {
      const response = await api.get('/api/attendance/my-attendance');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch attendance history' };
    }
  },

  // Get attendance list for an event (admin only)
  getEventAttendance: async (eventId) => {
    try {
      const response = await api.get(`/api/attendance/event/${eventId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch event attendance' };
    }
  },

  // Get attendance stats for an event (admin only)
  getAttendanceStats: async (eventId) => {
    try {
      // Note: This route might not exist in backend yet, verify before using
      const response = await api.get(`/api/attendance/event/${eventId}/count`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch attendance stats' };
    }
  },

  // Check if user has checked in to an event
  getCheckInStatus: async (eventId) => {
    try {
      const response = await api.get(`/api/attendance/event/${eventId}/status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get check-in status' };
    }
  },
};

export default attendanceService;
