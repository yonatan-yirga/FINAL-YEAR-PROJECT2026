/**
 * Recommendation Service
 * API service for AI-powered internship recommendations
 */
import apiService from './api';

/**
 * Recommendation Service Object
 * Handles recommendation-related API calls
 */
const recommendationService = {
  /**
   * Get recommended internships for current student
   * Returns internships ranked by match percentage
   * @param {object} options - Optional parameters
   * @param {number} options.limit - Maximum results (default: 20)
   * @param {number} options.min_match - Minimum match % (default: 0)
   * @returns {Promise} Recommended internships with match percentages
   */
  getRecommendations: async (options = {}) => {
    try {
      const params = {
        limit: options.limit || 20,
        min_match: options.min_match !== undefined ? options.min_match : 0,
      };
      
      const response = await apiService.get('/recommendations/internships/', { params });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Failed to fetch recommendations',
      };
    }
  },

  /**
   * Get explanation for why an internship matches
   * Shows common skills, missing skills, and match details
   * @param {number} internshipId - Internship ID
   * @returns {Promise} Match explanation
   */
  explainMatch: async (internshipId) => {
    try {
      const response = await apiService.get(`/recommendations/explain/${internshipId}/`);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Failed to get match explanation',
      };
    }
  },

  /**
   * Calculate match percentage locally (for preview)
   * @param {string} studentSkills - Comma-separated student skills
   * @param {string} requiredSkills - Comma-separated required skills
   * @returns {object} Match details
   */
  calculateMatch: (studentSkills, requiredSkills) => {
    try {
      // Split and normalize skills
      const studentSkillsArray = studentSkills
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(s => s);
      
      const requiredSkillsArray = requiredSkills
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(s => s);
      
      if (requiredSkillsArray.length === 0) {
        return {
          match_percentage: 0,
          common_skills: [],
          missing_skills: [],
        };
      }
      
      // Find common and missing skills
      const common_skills = requiredSkillsArray.filter(skill =>
        studentSkillsArray.includes(skill)
      );
      
      const missing_skills = requiredSkillsArray.filter(skill =>
        !studentSkillsArray.includes(skill)
      );
      
      // Calculate simple match percentage
      const match_percentage = Math.round(
        (common_skills.length / requiredSkillsArray.length) * 100
      );
      
      return {
        match_percentage,
        common_skills,
        missing_skills,
        student_skills_count: studentSkillsArray.length,
        required_skills_count: requiredSkillsArray.length,
      };
    } catch (error) {
      return {
        match_percentage: 0,
        common_skills: [],
        missing_skills: [],
        error: 'Failed to calculate match',
      };
    }
  },

  /**
   * Get match color based on percentage
   * @param {number} percentage - Match percentage (0-100)
   * @returns {string} Color code
   */
  getMatchColor: (percentage) => {
    if (percentage >= 80) return '#48bb78'; // Green
    if (percentage >= 50) return '#f6ad55'; // Orange/Yellow
    return '#cbd5e0'; // Gray
  },

  /**
   * Get match label based on percentage
   * @param {number} percentage - Match percentage (0-100)
   * @returns {string} Match label
   */
  getMatchLabel: (percentage) => {
    if (percentage >= 80) return 'Excellent Match';
    if (percentage >= 60) return 'Good Match';
    if (percentage >= 40) return 'Fair Match';
    return 'Low Match';
  },
};

export default recommendationService;