/**
 * Advisor Service
 * API calls for advisor functionality
 */
import apiService from './api';

const advisorService = {
  /**
   * Get advisor statistics
   * GET /api/advisors/statistics/
   */
  getStatistics: async () => {
    try {
      const response = await apiService.get('/advisors/statistics/');
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch statistics',
      };
    }
  },

  /**
   * Get list of students assigned to advisor
   * GET /api/advisors/my-students/?active=true/false
   * @param {Object} params - Query parameters (active filter)
   */
  getMyStudents: async (params = {}) => {
    try {
      const response = await apiService.get('/advisors/my-students/', { params });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch students',
      };
    }
  },

  /**
   * Get detailed information about a specific student
   * GET /api/advisors/students/<id>/
   * @param {number} assignmentId - AdvisorAssignment ID
   */
  getStudentDetail: async (assignmentId) => {
    try {
      const response = await apiService.get(`/advisors/students/${assignmentId}/`);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch student details',
      };
    }
  },

  /**
   * Get all feedback for a student — ADVISOR use only
   * GET /api/advisors/students/<id>/feedback/
   * Requires IsAdvisor permission — do NOT call from student pages
   * @param {number} assignmentId - AdvisorAssignment ID
   */
  getStudentFeedback: async (assignmentId) => {
    try {
      const response = await apiService.get(`/advisors/students/${assignmentId}/feedback/`);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch feedback',
      };
    }
  },

  /**
   * Get feedback received by the current STUDENT
   * GET /api/applications/my-feedback/
   * Uses student permission — call this from ActiveInternship.jsx
   */
  getMyFeedback: async () => {
    try {
      const response = await apiService.get('/applications/my-feedback/');
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch feedback',
      };
    }
  },

  /**
   * Create feedback for a student
   * POST /api/advisors/students/<id>/feedback/create/
   * @param {number} assignmentId - AdvisorAssignment ID
   * @param {string} feedbackText - Feedback content
   */
  createFeedback: async (assignmentId, feedbackText) => {
    try {
      const response = await apiService.post(
        `/advisors/students/${assignmentId}/feedback/create/`,
        { feedback_text: feedbackText }
      );
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error ||
               error.response?.data?.feedback_text?.[0] ||
               'Failed to create feedback',
      };
    }
  },

  /**
   * Mark student's internship as completed
   * POST /api/advisors/students/<id>/complete/
   * NOTE: This endpoint is reserved for Phase 9 (Final Report completion flow)
   * The Department triggers completion — not the advisor directly
   * @param {number} assignmentId - AdvisorAssignment ID
   */
  markStudentCompleted: async (assignmentId) => {
    try {
      const response = await apiService.post(`/advisors/students/${assignmentId}/complete/`);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to mark as completed',
      };
    }
  },
};

export default advisorService;