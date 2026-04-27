/**
 * Registration Service
 * Handles registration-related API calls
 */
import apiService from './api';

const registrationService = {
  /**
   * Get list of departments for dropdown
   * @returns {Promise} List of departments
   */
  getDepartments: async () => {
    try {
      const response = await apiService.get('/registrations/departments/');
      console.log('Fetched Departments:', response); // Debug log
      
      return {
        success: true,
        data: response.results || response,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.detail ||
                          'Failed to fetch departments';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Register new user
   * @param {FormData} formData - Registration data with file
   * @param {function} onProgress - Upload progress callback
   * @returns {Promise} Registration response
   */
  register: async (formData, onProgress) => {
    try {
      const response = await apiService.uploadFile(
        '/registrations/register/',
        formData,
        onProgress
      );
      
      // Response format from backend:
      // {
      //   message: "Registration submitted successfully...",
      //   registration_id: 1
      // }
      
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      // Extract error messages from response
      const errors = error.response?.data?.error || error.response?.data;
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (typeof errors === 'object' && !Array.isArray(errors)) {
        // Field-specific errors
        errorMessage = Object.entries(errors)
          .map(([field, messages]) => {
            const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const message = Array.isArray(messages) ? messages[0] : messages;
            return `${fieldName}: ${message}`;
          })
          .join('\n');
      } else if (typeof errors === 'string') {
        errorMessage = errors;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};

export default registrationService;