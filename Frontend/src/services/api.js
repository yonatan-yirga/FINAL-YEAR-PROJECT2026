/**
 * API Service Configuration
 * Axios instance with interceptors for authentication and error handling
 */
import axios from 'axios';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Create Axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {},
  withCredentials: false, // Set to true if using cookies
});

/**
 * Request Interceptor
 * Adds authentication token to all requests
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    // Add Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles errors and token expiration
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return successful response
    return response;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      const { status } = error.response;
      
      // Handle 401 Unauthorized - token invalid or expired
      if (status === 401) {
        // Clear stored tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Handle 403 Forbidden
      if (status === 403) {
        console.error('Access forbidden');
      }
      
      // Handle 500 Internal Server Error
      if (status === 500) {
        console.error('Server error occurred');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response from server');
    } else {
      // Error in request configuration
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * API Service Methods
 */
const apiService = {
  /**
   * GET request
   * @param {string} url - Endpoint URL
   * @param {object} config - Axios config
   * @returns {Promise} Response data
   */
  get: async (url, config = {}) => {
    try {
      const response = await apiClient.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * POST request
   * @param {string} url - Endpoint URL
   * @param {object} data - Request body
   * @param {object} config - Axios config
   * @returns {Promise} Response data
   */
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * PUT request
   * @param {string} url - Endpoint URL
   * @param {object} data - Request body
   * @param {object} config - Axios config
   * @returns {Promise} Response data
   */
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * PATCH request
   * @param {string} url - Endpoint URL
   * @param {object} data - Request body
   * @param {object} config - Axios config
   * @returns {Promise} Response data
   */
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * DELETE request
   * @param {string} url - Endpoint URL
   * @param {object} config - Axios config
   * @returns {Promise} Response data
   */
  delete: async (url, config = {}) => {
    try {
      const response = await apiClient.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload file with progress tracking
   * @param {string} url - Endpoint URL
   * @param {FormData} formData - Form data with file
   * @param {function} onProgress - Progress callback
   * @returns {Promise} Response data
   */
  uploadFile: async (url, formData, onProgress) => {
    try {
      const response = await apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiService;
export { API_URL, apiClient };