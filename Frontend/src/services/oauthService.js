/**
 * OAuth Service
 * Handles Google and GitHub OAuth authentication
 */
import apiService from './api';

const oauthService = {
  /**
   * Get Google OAuth URL
   */
  getGoogleAuthUrl: () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'profile email';
    const responseType = 'code';
    const state = Math.random().toString(36).substring(7);
    
    // Store state for verification
    sessionStorage.setItem('oauth_state', state);
    
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${state}&access_type=online`;
  },

  /**
   * Get GitHub OAuth URL
   */
  getGitHubAuthUrl: () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'user:email';
    const state = Math.random().toString(36).substring(7);
    
    // Store state for verification
    sessionStorage.setItem('oauth_state', state);
    
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
  },

  /**
   * Exchange OAuth code for access token
   */
  exchangeToken: async (provider, code) => {
    try {
      const response = await apiService.post('/oauth/exchange-token/', {
        provider,
        code,
      });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to exchange token',
      };
    }
  },

  /**
   * Login with Google
   */
  loginWithGoogle: async (accessToken) => {
    try {
      const response = await apiService.post('/oauth/google/', {
        access_token: accessToken,
      });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Google login failed',
      };
    }
  },

  /**
   * Login with GitHub
   */
  loginWithGitHub: async (accessToken) => {
    try {
      const response = await apiService.post('/oauth/github/', {
        access_token: accessToken,
      });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'GitHub login failed',
      };
    }
  },

  /**
   * Handle OAuth callback
   */
  handleCallback: async (code, state, provider) => {
    // Verify state
    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      return {
        success: false,
        error: 'Invalid state parameter. Possible CSRF attack.',
      };
    }

    // Clear stored state
    sessionStorage.removeItem('oauth_state');

    // Exchange code for access token
    const tokenResult = await oauthService.exchangeToken(provider, code);
    if (!tokenResult.success) {
      return tokenResult;
    }

    const accessToken = tokenResult.data.access_token;

    // Login with the access token
    if (provider === 'google') {
      return await oauthService.loginWithGoogle(accessToken);
    } else if (provider === 'github') {
      return await oauthService.loginWithGitHub(accessToken);
    }

    return {
      success: false,
      error: 'Invalid provider',
    };
  },
};

export default oauthService;
