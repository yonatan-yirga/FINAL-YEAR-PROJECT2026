/**
 * Application Service
 */
import apiService from './api';

/**
 * Extract a human-readable error message from DRF error responses.
 * DRF can return errors in many shapes:
 *   { "detail": "..." }
 *   { "error": "..." }
 *   { "internship": ["..."] }
 *   { "student": ["..."] }
 *   { "non_field_errors": ["..."] }
 *   "plain string"
 */
const extractError = (error, fallback = 'An error occurred. Please try again.') => {
  const data = error.response?.data;

  if (!data) return fallback;

  // Plain string
  if (typeof data === 'string') return data;

  // Priority order: most specific first
  if (data.detail)            return data.detail;
  if (data.error)             return data.error;
  if (data.non_field_errors)  return data.non_field_errors[0];
  if (data.student)           return Array.isArray(data.student)   ? data.student[0]   : data.student;
  if (data.internship)        return Array.isArray(data.internship) ? data.internship[0] : data.internship;

  // Generic: grab first value from any key
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    return Array.isArray(val) ? val[0] : String(val);
  }

  return fallback;
};

const applicationService = {
  /**
   * Apply to an internship
   * POST /api/applications/
   * Supports FormData for file uploads (certificate)
   */
  applyToInternship: async (applicationData) => {
    try {
      // Always use FormData to support potential file uploads correctly
      const payload = new FormData();
      Object.keys(applicationData).forEach(key => {
        // Append all fields, handle null/undefined
        if (applicationData[key] !== null && applicationData[key] !== undefined) {
          payload.append(key, applicationData[key]);
        }
      });

      // Pass config to override default JSON content-type
      // Setting Content-Type to undefined allows Axios/Browser to set it correctly with boundary
      const response = await apiService.post('/applications/', payload, {
        headers: {
          'Content-Type': undefined,
        }
      });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: extractError(error, 'Failed to submit application. Please try again.'),
      };
    }
  },

  /**
   * Get my applications (student)
   * GET /api/applications/my-applications/
   */
  getMyApplications: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await apiService.get('/applications/my-applications/', { params });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: extractError(error, 'Failed to fetch applications.'),
      };
    }
  },

  /**
   * Get application detail
   * GET /api/applications/<id>/
   */
  getApplicationDetail: async (id) => {
    try {
      const response = await apiService.get(`/applications/${id}/`);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: extractError(error, 'Failed to fetch application.'),
      };
    }
  },

  /**
   * Get company applications
   * GET /api/applications/company-applications/
   */
  getCompanyApplications: async (filters = {}) => {
    try {
      const response = await apiService.get('/applications/company-applications/', {
        params: filters,
      });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: extractError(error, 'Failed to fetch applications.'),
      };
    }
  },

  /**
   * Accept an application
   * POST /api/applications/<id>/accept/
   */
  acceptApplication: async (id) => {
    try {
      const response = await apiService.post(`/applications/${id}/accept/`);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: extractError(error, 'Failed to accept application.'),
      };
    }
  },

  /**
   * Reject an application
   * POST /api/applications/<id>/reject/
   */
  rejectApplication: async (id, rejectionReason) => {
    try {
      const response = await apiService.post(`/applications/${id}/reject/`, {
        rejection_reason: rejectionReason,
      });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: extractError(error, 'Failed to reject application.'),
      };
    }
  },

  /**
   * Withdraw an application (student)
   * POST /api/applications/<id>/withdraw/
   */
  withdrawApplication: async (id) => {
    try {
      const response = await apiService.post(`/applications/${id}/withdraw/`);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: extractError(error, 'Failed to withdraw application.'),
      };
    }
  },

  /**
   * Confirm a placement offer (student)
   * POST /api/applications/<id>/confirm/
   */
  confirmPlacement: async (id) => {
    try {
      const response = await apiService.post(`/applications/${id}/confirm/`);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: extractError(error, 'Failed to confirm placement.'),
      };
    }
  },
};

export default applicationService;