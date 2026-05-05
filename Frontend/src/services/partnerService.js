/**
 * Partner Organizations Service
 * Handles API calls for partner organizations
 */
import api from './api';

const partnerService = {
  /**
   * Get all partner organizations
   */
  getPartnerOrganizations: async () => {
    try {
      const response = await api.get('/auth/partner-organizations/');
      return {
        success: true,
        data: response.data.data || response.data,
        count: response.data.count
      };

    } catch (error) {
      console.error('Get partner organizations error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch partner organizations'
      };
    }
  },

  /**
   * Get partner organization details
   */
  getPartnerOrganizationDetail: async (id) => {
    try {
      const response = await api.get(`/auth/partner-organizations/${id}/`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get partner organization detail error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch partner organization details'
      };
    }
  },

  /**
   * Get partner organizations statistics
   */
  getPartnerOrganizationsStats: async () => {
    try {
      const response = await api.get('/auth/partner-organizations/stats/');
      return {
        success: true,
        data: response.data.data || response.data
      };

    } catch (error) {
      console.error('Get partner organizations stats error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch statistics'
      };
    }
  }
};

export default partnerService;
