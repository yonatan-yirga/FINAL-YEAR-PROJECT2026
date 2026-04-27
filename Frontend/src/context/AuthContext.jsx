/**
 * Authentication Context
 * Manages global authentication state and provides auth methods
 */
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import authService from '../services/authService';

// Create Auth Context
export const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Wraps app and provides authentication state and methods
 */
export const AuthProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize authentication on app load
   * Checks for existing token and fetches user profile
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if token exists in localStorage
        const token = authService.getToken();
        const storedUser = authService.getUser();
        
        if (token && storedUser) {
          // Verify token is still valid by fetching profile
          const response = await authService.getProfile();
          
          if (response.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear auth data
            authService.clearAuthData();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.clearAuthData();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login function
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Login result
   */
  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call login API
      const response = await authService.login(email, password);
      
      if (response.success) {
        const { token, user } = response.data;
        
        // Store token and user data
        authService.storeAuthData(token, user);
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        return {
          success: true,
          user,
        };
      } else {
        // Login failed
        setError(response.error);
        return {
          success: false,
          error: response.error,
        };
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during login';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout function
   * Clears auth data and calls backend logout
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Call backend logout (deletes token from database)
      await authService.logout();
      
      // Clear local storage
      authService.clearAuthData();
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if backend fails, clear local state
      authService.clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
      
      return {
        success: true,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get current auth token
   * @returns {string|null} Auth token
   */
  const getAuthToken = useCallback(() => {
    return authService.getToken();
  }, []);

  /**
   * Get user profile
   * Fetches latest user data from backend
   * @returns {Promise} Profile data
   */
  const getProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = await authService.getProfile();
      
      if (response.success) {
        // Update user state with latest data
        setUser(response.data.user);
        
        // Update localStorage
        const token = authService.getToken();
        if (token) {
          authService.storeAuthData(token, response.data.user);
        }
        
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch profile',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Change password
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Confirm new password
   * @returns {Promise} Password change result
   */
  const changePassword = useCallback(async (oldPassword, newPassword, confirmPassword) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.changePassword(
        oldPassword,
        newPassword,
        confirmPassword
      );
      
      if (response.success) {
        // Backend returns new token after password change
        const { token } = response.data;
        
        if (token && user) {
          // Update token in localStorage
          authService.storeAuthData(token, user);
        }
        
        return {
          success: true,
          message: response.data.message,
        };
      } else {
        setError(response.error);
        return {
          success: false,
          error: response.error,
        };
      }
    } catch (error) {
      const errorMessage = 'Failed to change password';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Update user state
   * Used when user data changes (e.g., profile update)
   * @param {object} updatedUser - Updated user object
   */
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    const token = authService.getToken();
    if (token) {
      authService.storeAuthData(token, updatedUser);
    }
  }, []);

  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    getAuthToken,
    getProfile,
    changePassword,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// PropTypes validation
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to use Auth Context
 * Provides easy access to authentication state and methods
 * @returns {Object} Auth context value
 * @throws {Error} If used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;