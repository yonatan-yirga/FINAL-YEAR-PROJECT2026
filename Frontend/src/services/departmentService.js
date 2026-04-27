/**
 * Department Service
 * API calls for Department Head dashboard
 */
import apiService from './api';

const departmentService = {
  /**
   * Get department statistics
   * GET /api/departments/statistics/
   */
  getStatistics: async () => {
    try {
      const response = await apiService.get('/departments/statistics/');
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch statistics',
      };
    }
  },

  /**
   * Get all students in department
   * GET /api/departments/students/
   * @param {Object} params - Query parameters (search, status)
   */
  getStudents: async (params = {}) => {
    try {
      const response = await apiService.get('/departments/students/', { params });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch students',
      };
    }
  },

  /**
   * Get all advisors in department
   * GET /api/departments/advisors/
   * @param {Object} params - Query parameters (search)
   */
  getAdvisors: async (params = {}) => {
    try {
      const response = await apiService.get('/departments/advisors/', { params });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch advisors',
      };
    }
  },

  /**
   * Get all companies in department
   * GET /api/departments/companies/
   * @param {Object} params - Query parameters (search)
   */
  getCompanies: async (params = {}) => {
    try {
      const response = await apiService.get('/departments/companies/', { params });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch companies',
      };
    }
  },

  /**
   * Get students awaiting advisor assignment
   * GET /api/departments/unassigned-students/
   */
  getUnassignedStudents: async () => {
    try {
      const response = await apiService.get('/departments/unassigned-students/');
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch unassigned students',
      };
    }
  },

  /**
   * Assign advisor to student
   * POST /api/departments/assign-advisor/
   * @param {Object} data - { application_id, advisor_id }
   */
  assignAdvisor: async (data) => {
    try {
      const response = await apiService.post('/departments/assign-advisor/', data);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to assign advisor',
      };
    }
  },

  /**
   * Get all final reports
   * GET /api/departments/reports/
   * @param {Object} params - Query parameters (status, search)
   */
  getReports: async (params = {}) => {
    try {
      const response = await apiService.get('/departments/reports/', { params });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch reports',
      };
    }
  },

  /**
   * Download report PDF
   * @param {string} pdfUrl - URL to the PDF file
   */
  downloadReport: async (pdfUrl) => {
    try {
      window.open(pdfUrl, '_blank');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to download report',
      };
    }
  },

  /**
   * Get advanced decision intelligence analytics
   * GET /api/departments/decision-intelligence/
   */
  getDecisionIntelligence: async () => {
    try {
      const response = await apiService.get('/departments/decision-intelligence/');
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch intelligence data',
      };
    }
  },

  /**
   * Bulk validate student eligibility
   * POST /api/departments/validate-students/
   */
  validateStudents: async (data) => {
    try {
      const response = await apiService.post('/departments/validate-students/', data);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to validate students',
      };
    }
  },

  /**
   * Blacklist or remove from blacklist a company
   * POST /api/departments/students/<id>/blacklist/
   */
  blacklistCompany: async (id, data) => {
    try {
      const response = await apiService.post(`/departments/${id}/blacklist/`, data);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update company status',
      };
    }
  },

  /**
   * Get all department cycles
   * GET /api/departments/cycles/
   */
  getCycles: async () => {
    try {
      const response = await apiService.get('/departments/cycles/');
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch cycles',
      };
    }
  },

  /**
   * Create a new cycle
   * POST /api/departments/cycles/create/
   * @param {Object} data - { year, semester, start_date, end_date, is_active }
   */
  createCycle: async (data) => {
    try {
      const response = await apiService.post('/departments/cycles/create/', data);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create cycle',
      };
    }
  },

  /**
   * Update an existing cycle
   * PUT /api/departments/{cycle_id}/cycles/update/
   * @param {number} cycleId - Cycle ID
   * @param {Object} data - { year, semester, start_date, end_date, is_active }
   */
  updateCycle: async (cycleId, data) => {
    try {
      const response = await apiService.put(`/departments/${cycleId}/cycles/update/`, data);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update cycle',
      };
    }
  },

  /**
   * Activate a cycle
   * POST /api/departments/{cycle_id}/cycles/activate/
   * @param {number} cycleId - Cycle ID
   */
  activateCycle: async (cycleId) => {
    try {
      const response = await apiService.post(`/departments/${cycleId}/cycles/activate/`);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to activate cycle',
      };
    }
  },

  /**
   * Close a cycle
   * POST /api/departments/{cycle_id}/cycles/close/
   * @param {number} cycleId - Cycle ID
   */
  closeCycle: async (cycleId) => {
    try {
      const response = await apiService.post(`/departments/${cycleId}/cycles/close/`);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to close cycle',
      };
    }
  },

  /**
   * Delete a cycle
   * DELETE /api/departments/{cycle_id}/cycles/delete/
   * @param {number} cycleId - Cycle ID
   */
  deleteCycle: async (cycleId) => {
    try {
      const response = await apiService.delete(`/departments/${cycleId}/cycles/delete/`);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete cycle',
      };
    }
  },

  /**
   * Get all escalations for the department
   * GET /api/departments/escalations/
   * @param {Object} params - Query parameters (status)
   */
  getEscalations: async (params = {}) => {
    try {
      const response = await apiService.get('/departments/escalations/', { params });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch escalations',
      };
    }
  },

  /**
   * Create a new escalation
   * POST /api/departments/escalations/create/
   * @param {Object} data - { issue_type, title, description, student_id, advisor_id, company_id }
   */
  createEscalation: async (data) => {
    try {
      const response = await apiService.post('/departments/escalations/create/', data);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create escalation',
      };
    }
  },

  /**
   * Resolve an escalation
   * POST /api/departments/{escalation_id}/escalations/resolve/
   * @param {number} escalationId - Escalation ID
   * @param {Object} data - { resolution_notes }
   */
  resolveEscalation: async (escalationId, data) => {
    try {
      const response = await apiService.post(`/departments/${escalationId}/escalations/resolve/`, data);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to resolve escalation',
      };
    }
  },

  /**
   * Escalate to UIL
   * POST /api/departments/{escalation_id}/escalations/escalate-to-uil/
   * @param {number} escalationId - Escalation ID
   * @param {Object} data - { escalation_reason }
   */
  escalateToUIL: async (escalationId, data) => {
    try {
      const response = await apiService.post(`/departments/${escalationId}/escalations/escalate-to-uil/`, data);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to escalate to UIL',
      };
    }
  },

  /**
   * Assign company/internship to student (Direct Placement)
   * POST /api/departments/assign-company/
   * @param {Object} data - { student_id, internship_id, assigned_by }
   */
  assignCompanyToStudent: async (data) => {
    try {
      const response = await apiService.post('/departments/assign-company/', data);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to assign company to student',
      };
    }
  },

  /**
   * Register a new advisor (Department Head only)
   * POST /api/departments/add-advisor/
   * @param {Object} data - { full_name, email, phone_number, staff_id, max_students }
   */
  addAdvisor: async (data) => {
    try {
      const response = await apiService.post('/departments/add-advisor/', data);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to register advisor',
      };
    }
  },
};

export default departmentService;
