/**
 * Report Service 
 * API calls for monthly and final report submission and retrieval.
 */
import apiService from './api';
import { API_URL } from './api';

const reportService = {
  // ── Phase 8: Monthly Reports ───────────────────────────────────────────────

  getActiveInterns: async () => {
    try {
      const response = await apiService.get('/reports/active-interns/');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to load active interns.' };
    }
  },

  submitMonthlyReport: async (data) => {
    try {
      const response = await apiService.post('/reports/monthly/submit/', data);
      return { success: true, data: response };
    } catch (error) {
      const errData = error.response?.data;
      let errorMsg = 'Failed to submit report.';
      if (errData) {
        if (typeof errData === 'string') errorMsg = errData;
        else {
          const firstKey = Object.keys(errData)[0];
          if (firstKey) { const val = errData[firstKey]; errorMsg = Array.isArray(val) ? val[0] : val; }
        }
      }
      return { success: false, error: errorMsg };
    }
  },

  getCompanyReports: async (assignmentId = null) => {
    try {
      const params = assignmentId ? { assignment_id: assignmentId } : {};
      const response = await apiService.get('/reports/monthly/company/', { params });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to load company reports.' };
    }
  },

  getAdvisorReports: async (assignmentId = null) => {
    try {
      const params = assignmentId ? { assignment_id: assignmentId } : {};
      const response = await apiService.get('/reports/monthly/advisor/', { params });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to load reports.' };
    }
  },

  getAdvisorStudentReports: async (assignmentId = null) => {
    try {
      const params = assignmentId ? { assignment_id: assignmentId } : {};
      const response = await apiService.get('/reports/student-monthly/advisor/', { params });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to load student reports.' };
    }
  },

  downloadConsolidatedReports: async (assignmentId, filename = null) => {
    try {
      const token = localStorage.getItem('authToken');
      const url = `${API_URL}/reports/monthly/consolidated/${assignmentId}/`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!res.ok) {
        let errMsg = `Download failed (HTTP ${res.status}).`;
        try {
          const errData = await res.json();
          if (errData?.error) errMsg = errData.error;
        } catch (_) { }
        return { success: false, error: errMsg };
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename || `consolidated_reports_${assignmentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);

      return { success: true };
    } catch (e) {
      return { success: false, error: 'Network error while downloading PDF.' };
    }
  },

  // ── Phase 9: Final Reports ─────────────────────────────────────────────────

  submitFinalReport: async (data) => {
    try {
      const response = await apiService.post('/reports/final/submit/', data);
      return { success: true, data: response };
    } catch (error) {
      const errData = error.response?.data;
      let errorMsg = 'Failed to submit final report.';
      if (errData) {
        if (typeof errData === 'string') errorMsg = errData;
        else {
          const firstKey = Object.keys(errData)[0];
          if (firstKey) { const val = errData[firstKey]; errorMsg = Array.isArray(val) ? val[0] : val; }
        }
      }
      return { success: false, error: errorMsg };
    }
  },

  completeFinalReport: async (reportId, data) => {
    try {
      const response = await apiService.patch(`/reports/final/${reportId}/complete/`, data);
      return { success: true, data: response };
    } catch (error) {
      const errData = error.response?.data;
      let errorMsg = 'Failed to complete final report.';
      if (errData) {
        if (typeof errData === 'string') errorMsg = errData;
        else {
          const firstKey = Object.keys(errData)[0];
          if (firstKey) { const val = errData[firstKey]; errorMsg = Array.isArray(val) ? val[0] : val; }
        }
      }
      return { success: false, error: errorMsg };
    }
  },

  advisorInitiateFinalReport: async (assignmentId) => {
    try {
      const response = await apiService.post('/reports/final/advisor-initiate/', { assignment_id: assignmentId });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to initiate final report.' };
    }
  },

  getCompanyFinalReports: async () => {
    try {
      const response = await apiService.get('/reports/final/company/');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to load final reports.' };
    }
  },

  getAdvisorFinalReports: async () => {
    try {
      const response = await apiService.get('/reports/final/advisor/');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to load final reports.' };
    }
  },

  getDepartmentFinalReports: async (statusFilter = null) => {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await apiService.get('/reports/final/department/', { params });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to load final reports.' };
    }
  },

  getFinalReportDetail: async (reportId) => {
    try {
      const response = await apiService.get(`/reports/final/${reportId}/`);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to load report detail.' };
    }
  },

  /**
   * Download a final report PDF with authentication.
   *
   * WHY: The backend endpoint GET /api/reports/final/<id>/pdf/ requires an
   * Authorization header (Token auth). A plain <a href="..."> or window.open()
   * never attaches that header, so the browser gets HTTP 401.
   *
   * This method uses fetch() with the token from localStorage (key: 'authToken',
   * consistent with api.js and authService.js), converts the response to a Blob,
   * creates a temporary object URL, and triggers a programmatic click to download.
   *
   * @param {number} reportId  - The FinalReport PK
   * @param {string} [filename] - Optional custom filename (default: final_report_<id>.pdf)
   * @returns {{ success: boolean, error?: string }}
   */
  downloadFinalReportPdf: async (reportId, filename = null) => {
    try {
      const token = localStorage.getItem('authToken');
      const url = `${API_URL}/reports/final/${reportId}/pdf/`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!res.ok) {
        // Try to read a JSON error body if available
        let errMsg = `Download failed (HTTP ${res.status}).`;
        try {
          const errData = await res.json();
          if (errData?.error) errMsg = errData.error;
        } catch (_) { /* ignore parse error */ }
        return { success: false, error: errMsg };
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename || `final_report_${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);

      return { success: true };
    } catch (e) {
      return { success: false, error: 'Network error while downloading PDF.' };
    }
  },

  // ── Student-Side Reporting ───────────────────────────────────────────────

  submitStudentMonthlyReport: async (data) => {
    try {
      let payload = data;
      let headers = {};
      
      // If data contains a file, use FormData
      if (data.report_file instanceof File) {
        payload = new FormData();
        Object.keys(data).forEach(key => {
          if (data[key] !== null && data[key] !== undefined) {
            payload.append(key, data[key]);
          }
        });
        headers = { 'Content-Type': 'multipart/form-data' };
      }

      const response = await apiService.post('/reports/student-monthly/submit/', payload, { headers });
      return { success: true, data: response };
    } catch (error) {
      const errData = error.response?.data;
      let errorMsg = 'Failed to submit report.';
      if (errData) {
        if (typeof errData === 'string') errorMsg = errData;
        else {
          const firstKey = Object.keys(errData)[0];
          if (firstKey) { const val = errData[firstKey]; errorMsg = Array.isArray(val) ? val[0] : val; }
        }
      }
      return { success: false, error: errorMsg };
    }
  },

  getStudentPersonalReports: async () => {
    try {
      const response = await apiService.get('/reports/student-monthly/my-reports/');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to load your reports.' };
    }
  },

  // ── Department Head Actions ────────────────────────────────────────────────

  /**
   * Approve or reject a final report (Department Head action)
   * @param {number} reportId - The FinalReport ID
   * @param {object} data - { action: 'approve'|'reject', review_comments: string }
   */
  approveFinalReport: async (reportId, data) => {
    try {
      const response = await apiService.patch(`/reports/final/${reportId}/department-approve/`, data);
      return { success: true, data: response };
    } catch (error) {
      const errData = error.response?.data;
      let errorMsg = 'Failed to process approval.';
      if (errData) {
        if (typeof errData === 'string') errorMsg = errData;
        else if (errData.error) errorMsg = errData.error;
        else {
          const firstKey = Object.keys(errData)[0];
          if (firstKey) { 
            const val = errData[firstKey]; 
            errorMsg = Array.isArray(val) ? val[0] : val; 
          }
        }
      }
      return { success: false, error: errorMsg };
    }
  },

  /**
   * Issue certificate for approved final report (Department Head action)
   * @param {number} reportId - The FinalReport ID
   */
  issueCertificate: async (reportId) => {
    try {
      const response = await apiService.post(`/reports/final/${reportId}/issue-certificate/`);
      return { success: true, data: response };
    } catch (error) {
      const errData = error.response?.data;
      let errorMsg = 'Failed to issue certificate.';
      if (errData) {
        if (typeof errData === 'string') errorMsg = errData;
        else if (errData.error) errorMsg = errData.error;
        else {
          const firstKey = Object.keys(errData)[0];
          if (firstKey) { 
            const val = errData[firstKey]; 
            errorMsg = Array.isArray(val) ? val[0] : val; 
          }
        }
      }
      return { success: false, error: errorMsg };
    }
  },

  /**
   * Get certificates issued by department
   */
  getDepartmentCertificates: async (statusFilter = null) => {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await apiService.get('/reports/certificates/department/', { params });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to load certificates.' };
    }
  },

  /**
   * Get pending approvals for department head
   */
  getDepartmentPendingApprovals: async () => {
    try {
      const response = await apiService.get('/reports/final/department/pending-approvals/');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to load pending approvals.' };
    }
  },

  advisorReviewStudentFinalReport: async (reportId, action, feedback = '') => {
    try {
      const response = await apiService.patch(`/reports/final/advisor-review/${reportId}/`, {
        action,
        feedback
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to process review.' };
    }
  },
};

export default reportService;