/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
import apiService from './api';

const authService = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Login response with token and user data
   */
  login: async (email, password) => {
    try {
      const response = await apiService.post('/auth/login/', {
        email,
        password,
      });
      
      // Response format from backend:
      // {
      //   token: "abc123...",
      //   user: { id, email, role, department, ... },
      //   message: "Login successful"
      // }
      
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      // Extract error message from response
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail ||
                          'Login failed. Please try again.';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Logout user
   * Deletes auth token from backend
   * @returns {Promise} Logout response
   */
  logout: async () => {
    try {
      const response = await apiService.post('/auth/logout/');
      
      return {
        success: true,
        message: response.message || 'Logged out successfully',
      };
    } catch (error) {
      // Even if backend logout fails, we should clear local storage
      return {
        success: true,
        message: 'Logged out locally',
      };
    }
  },

  /**
   * Get current user profile
   * @returns {Promise} User profile data
   */
  getProfile: async () => {
    try {
      const response = await apiService.get('/auth/profile/');
      
      // Response format from backend:
      // {
      //   user: { id, email, role, department, ... },
      //   profile: { role-specific profile data }
      // }
      
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.detail ||
                          'Failed to fetch profile';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Update current user profile
   * @param {object|FormData} profileData - Profile data to update
   * @returns {Promise} Updated profile data
   */
  updateProfile: async (profileData) => {
    try {
      // Use PATCH for partial updates
      // If profileData is FormData (for file uploads), Axios handles it automatically
      const response = await apiService.patch('/auth/profile/', profileData);
      
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.detail ||
                          'Failed to update profile';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Change user password
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Confirm new password
   * @returns {Promise} Password change response
   */
  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    try {
      const response = await apiService.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      
      // Response format from backend:
      // {
      //   message: "Password changed successfully...",
      //   token: "new_token_key..."
      // }
      
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.detail ||
                          'Failed to change password';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  /**
   * Get stored auth token
   * @returns {string|null} Auth token
   */
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  /**
   * Get stored user data
   * @returns {object|null} User object
   */
  getUser: () => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * Store auth token and user data
   * @param {string} token - Auth token
   * @param {object} user - User object
   */
  storeAuthData: (token, user) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Clear all auth data from storage
   */
  clearAuthData: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
  /**
   * Request a password reset email
   */
  forgotPassword: async (email) => {
    try {
      const response = await apiService.post('/auth/forgot-password/', { email });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to send reset email.' };
    }
  },

  /**
   * Send temporary password to user's email
   */
  sendTemporaryPassword: async (email) => {
    try {
      const response = await apiService.post('/auth/send-temporary-password/', { email });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to send temporary password.' };
    }
  },

  /**
   * Validate a reset token (check it's still valid before showing the form)
   */
  validateResetToken: async (token) => {
    try {
      const response = await apiService.get(`/auth/reset-password/${token}/validate/`);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, data: { valid: false, error: 'Invalid token.' } };
    }
  },

  /**
   * Submit new password using reset token
   */
  resetPassword: async (token, newPassword, confirmPassword) => {
    try {
      const response = await apiService.post('/auth/reset-password/', {
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to reset password.' };
    }
  },
};

export default authService;