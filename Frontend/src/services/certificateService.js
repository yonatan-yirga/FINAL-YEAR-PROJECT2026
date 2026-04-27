/**
 * certificateService page
 * All certificate-related API calls.
 * Uses apiService (axios) — same pattern as all other services in this codebase.
 */
import apiService from './api';
import { API_URL } from './api';

const certificateService = {
  /**
   * Department: mark student as completed and issue certificate.
   * POST /api/certificates/mark-completed/
   */
  markStudentCompleted: async (finalReportId, departmentReview = '') => {
    try {
      const response = await apiService.post('/certificates/mark-completed/', {
        final_report_id: finalReportId,
        department_review: departmentReview,
      });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error
          || error.response?.data?.detail
          || (Array.isArray(error.response?.data?.non_field_errors) ? error.response.data.non_field_errors[0] : null)
          || (typeof error.response?.data === 'string' ? error.response.data.slice(0, 200) : null)
          || `Server error (${error.response?.status || 'no response'})`,
      };
    }
  },

  /**
   * Student: get own certificate.
   * GET /api/certificates/my-certificate/
   */
  getMyCertificate: async () => {
    try {
      const response = await apiService.get('/certificates/my-certificate/');
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to load certificate.',
      };
    }
  },

  /**
   * Department: list all certificates in the department.
   * GET /api/certificates/department/
   */
  getDepartmentCertificates: async () => {
    try {
      const response = await apiService.get('/certificates/department/');
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load certificates.',
      };
    }
  },

  /**
   * Download certificate PDF (triggers browser download).
   * GET /api/certificates/<id>/download/
   * Uses raw fetch because we need to handle a binary blob response,
   * which axios returns differently. Auth token from 'authToken' key (matches app standard).
   */
  downloadCertificate: async (certificateId) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/certificates/${certificateId}/download/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) return { success: false, error: 'Download failed.' };
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `certificate_${certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Download failed.' };
    }
  },

  /**
   * Public: verify a certificate by ID or verification code.
   * GET /api/certificates/verify/<code>/
   * No auth required — uses raw fetch with no Authorization header.
   */
  verifyCertificate: async (codeOrId) => {
    try {
      const res = await fetch(
        `${API_URL}/certificates/verify/${encodeURIComponent(codeOrId)}/`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, error: data?.message || 'Certificate not found.' };
      return { success: true, data };
    } catch (e) {
      return { success: false, error: 'Network error.' };
    }
  },
};

export default certificateService;