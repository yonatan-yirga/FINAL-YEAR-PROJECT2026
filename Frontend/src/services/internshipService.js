/**
 * Internship Service
 * API service for internship CRUD operations
 */
import apiService from './api';

/**
 * Internship Service Object
 * Handles all internship-related API calls
 */
const internshipService = {
  /**
   * Create new internship
   * @param {object} internshipData - Internship data
   * @returns {Promise} Created internship
   */
  create: async (internshipData) => {
    try {
      const response = await apiService.post('/internships/create/', internshipData);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Failed to create internship',
      };
    }
  },

  /**
   * Get all internships (with filters)
   * @param {object} params - Query parameters (search, filters, pagination)
   * @returns {Promise} List of internships
   */
  getAll: async (params = {}) => {
    try {
      console.log('🔍 internshipService.getAll called with params:', params);
      const response = await apiService.get('/internships/', { params });
      console.log('✅ internshipService.getAll response:', response);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error('❌ internshipService.getAll error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      
      let errorMessage = 'Failed to fetch internships';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else {
            errorMessage = JSON.stringify(error.response.data);
          }
        } else {
          errorMessage = `Server error: ${error.response.status} ${error.response.statusText}`;
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Error in request setup
        errorMessage = error.message || 'Request failed';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Get single internship by ID
   * @param {number} id - Internship ID
   * @returns {Promise} Internship details
   */
  getById: async (id) => {
    try {
      const response = await apiService.get(`/internships/${id}/`);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Failed to fetch internship details',
      };
    }
  },

  /**
   * Get company's own internships
   * @returns {Promise} List of company's internships
   */
  getMyInternships: async () => {
    try {
      const response = await apiService.get('/internships/my-internships/');
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Failed to fetch your internships',
      };
    }
  },

  /**
   * Update internship
   * @param {number} id - Internship ID
   * @param {object} internshipData - Updated data
   * @returns {Promise} Updated internship
   */
  update: async (id, internshipData) => {
    try {
      const response = await apiService.patch(`/internships/${id}/update/`, internshipData);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Failed to update internship',
      };
    }
  },

  /**
   * Delete internship (soft delete)
   * @param {number} id - Internship ID
   * @returns {Promise} Delete confirmation
   */
  delete: async (id) => {
    try {
      await apiService.delete(`/internships/${id}/delete/`);
      return {
        success: true,
        message: 'Internship deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Failed to delete internship',
      };
    }
  },

  /**
   * Close internship
   * @param {number} id - Internship ID
   * @returns {Promise} Updated internship
   */
  close: async (id) => {
    try {
      const response = await apiService.post(`/internships/${id}/close/`);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Failed to close internship',
      };
    }
  },

  /**
   * Reopen internship
   * @param {number} id - Internship ID
   * @returns {Promise} Updated internship
   */
  reopen: async (id) => {
    try {
      const response = await apiService.post(`/internships/${id}/reopen/`);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Failed to reopen internship',
      };
    }
  },

  /**
   * Search internships with filters
   * @param {object} filters - Search and filter parameters
   * @returns {Promise} Filtered internships
   */
  search: async (filters) => {
    try {
      const params = {};
      
      // Search query
      if (filters.search) {
        params.search = filters.search;
      }
      
      // Location filter
      if (filters.location) {
        params.location = filters.location;
      }
      
      // Duration filter
      if (filters.duration_months) {
        params.duration_months = filters.duration_months;
      }
      
      // Start date range
      if (filters.start_date_from) {
        params.start_date_from = filters.start_date_from;
      }
      if (filters.start_date_to) {
        params.start_date_to = filters.start_date_to;
      }
      
      // Status filter
      if (filters.status) {
        params.status = filters.status;
      }
      
      // Ordering
      if (filters.ordering) {
        params.ordering = filters.ordering;
      }
      
      const response = await apiService.get('/internships/', { params });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Failed to search internships',
      };
    }
  },
};

export default internshipService;