/**
 * Notification Service
 * Handles notification-related API calls
 */
import apiService from './api';

const notificationService = {
  /**
   * Get all notifications for current user
   * @param {number} page - Page number
   * @param {string} readFilter - 'true', 'false', or null for all
   * @returns {Promise} Notifications list
   */
  getNotifications: async (page = 1, readFilter = null) => {
    try {
      let url = `/notifications/?page=${page}`;
      
      if (readFilter !== null) {
        url += `&read=${readFilter}`;
      }
      
      const response = await apiService.get(url);
      
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.detail ||
                          'Failed to fetch notifications';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Get recent notifications (for bell dropdown)
   * @returns {Promise} Recent 5 notifications
   */
  getRecentNotifications: async () => {
    try {
      const response = await apiService.get('/notifications/recent/');
      
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.detail ||
                          'Failed to fetch recent notifications';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Get unread notification count
   * @returns {Promise} Unread count
   */
  getUnreadCount: async () => {
    try {
      const response = await apiService.get('/notifications/unread-count/');
      
      return {
        success: true,
        data: response.unread_count || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch unread count',
        data: 0,
      };
    }
  },

  /**
   * Mark single notification as read
   * @param {number} notificationId - Notification ID
   * @returns {Promise} Result
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await apiService.post(`/notifications/${notificationId}/mark-read/`);
      
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.detail ||
                          'Failed to mark as read';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise} Result
   */
  markAllAsRead: async () => {
    try {
      const response = await apiService.post('/notifications/mark-all-read/');
      
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.detail ||
                          'Failed to mark all as read';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Delete single notification
   * @param {number} notificationId - Notification ID
   * @returns {Promise} Result
   */
  deleteNotification: async (notificationId) => {
    try {
      const response = await apiService.delete(`/notifications/${notificationId}/`);
      
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.detail ||
                          'Failed to delete notification';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};

export default notificationService;