/**
 * UIL Service
 * Handles UIL-specific API calls for registration management
 */
import apiService from './api';

const uilService = {
  /**
   * Get dashboard statistics
   * @returns {Promise} Dashboard stats
   */
  getDashboardStats: async () => {
    try {
      const response = await apiService.get('/registrations/stats/');
      
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.detail ||
                          'Failed to fetch dashboard statistics';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Get pending registrations with optional type filter
   * @param {string} type - Registration type (STUDENT, COMPANY, ADVISOR, DEPARTMENT)
   * @returns {Promise} List of pending registrations
   */
  getPendingRegistrations: async (type = null) => {
    try {
      const url = type 
        ? `/registrations/pending/?type=${type}`
        : '/registrations/pending/';
      
      const response = await apiService.get(url);
      
      return {
        success: true,
        data: response.results || response,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.detail ||
                          'Failed to fetch pending registrations';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Get single registration details
   * @param {number} id - Registration ID
   * @returns {Promise} Registration details
   */
  getRegistrationDetail: async (id) => {
    try {
      const response = await apiService.get(`/registrations/${id}/`);
      
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.detail ||
                          'Failed to fetch registration details';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Approve registration
   * @param {number} id - Registration ID
   * @returns {Promise} Approval response
   */
  approveRegistration: async (id) => {
    try {
      const response = await apiService.post(`/registrations/${id}/approve/`);
      
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.detail ||
                          'Failed to approve registration';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Reject registration with reason
   * @param {number} id - Registration ID
   * @param {string} reason - Rejection reason
   * @returns {Promise} Rejection response
   */
  rejectRegistration: async (id, reason) => {
    try {
      const response = await apiService.post(`/registrations/${id}/reject/`, {
        rejection_reason: reason,
      });
      
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.detail ||
                          'Failed to reject registration';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
  /**
   * Get all approved users — filterable by role
   * GET /api/auth/users/?role=STUDENT&search=...
   */
  getUsers: async (role = null, search = '', page = 1) => {
    try {
      const params = new URLSearchParams();
      if (role)   params.append('role',   role);
      if (search) params.append('search', search);
      if (page > 1) params.append('page', page);
      const url = `/auth/users/${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiService.get(url);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch users',
      };
    }
  },

  /**
   * Get system-wide statistics for UIL overview
   * GET /api/auth/system-stats/
   */
  getSystemStats: async () => {
    try {
      const response = await apiService.get('/auth/system-stats/');
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch system stats',
      };
    }
  },

};

export default uilService;